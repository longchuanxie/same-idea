import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';

class ResolvedProvider {
  const ResolvedProvider({
    required this.provider,
    required this.apiKey,
    required this.temperature,
    required this.topP,
    required this.streamingEnabled,
    this.model,
  });

  final LlmProvider provider;
  final LlmModel? model;
  final String apiKey;
  final double temperature;
  final double topP;
  final bool streamingEnabled;
}

class ProviderResolver {
  const ProviderResolver({
    required LlmProviderRepository repository,
    required SecretStorage secretStorage,
  })  : _repository = repository,
        _secretStorage = secretStorage;

  final LlmProviderRepository _repository;
  final SecretStorage _secretStorage;

  Future<AppResult<ResolvedProvider>> resolveWritingProvider() async {
    final settingsResult = await _repository.getDefaultSettings();
    switch (settingsResult) {
      case AppFailure(:final error):
        return AppResult<ResolvedProvider>.failure(error);
      case AppSuccess(:final value):
        return _resolveFromSettings(value);
    }
  }

  Future<AppResult<ResolvedProvider>> _resolveFromSettings(
    LlmDefaultSettings settings,
  ) async {
    final providerId = settings.writingProviderId;
    if (providerId == null || providerId.isEmpty) {
      return const AppResult<ResolvedProvider>.failure(
        AppError(
          code: 'llm.model_not_selected',
          message: 'No writing model selected in default settings.',
          userMessage: '请先在设置页选择默认写作模型。',
          source: AppErrorSource.llm,
          recoverable: true,
          suggestedAction: '前往“设置 / 模型与服务商”选择默认写作模型。',
        ),
      );
    }

    final providerResult = await _repository.getById(providerId);
    final LlmProvider provider;
    switch (providerResult) {
      case AppFailure(:final error):
        return AppResult<ResolvedProvider>.failure(error);
      case AppSuccess(:final value):
        if (value == null) {
          return const AppResult<ResolvedProvider>.failure(
            AppError(
              code: 'llm.provider_not_found',
              message: 'Configured writing provider was not found.',
              userMessage: '默认写作服务商不存在，请重新选择。',
              source: AppErrorSource.llm,
              recoverable: true,
              suggestedAction: '前往设置页重新选择写作模型。',
            ),
          );
        }
        provider = value;
    }

    final modelId = settings.writingModelId;
    LlmModel? model;
    if (modelId != null && modelId.isNotEmpty) {
      for (final candidate in provider.cachedModels) {
        if (candidate.modelId == modelId) {
          model = candidate;
          break;
        }
      }
    }

    final secretResult = await _secretStorage.read(ref: provider.secretKeyRef);
    var apiKey = '';
    switch (secretResult) {
      case AppFailure(:final error):
        return AppResult<ResolvedProvider>.failure(error);
      case AppSuccess(:final value):
        apiKey = value ?? '';
    }
    if (apiKey.isEmpty && provider.status != ProviderStatus.local) {
      return const AppResult<ResolvedProvider>.failure(
        AppError(
          code: 'llm.api_key_missing',
          message: 'API key for selected provider is missing.',
          userMessage: '当前服务商缺少 API Key，请在设置页填写。',
          source: AppErrorSource.llm,
          recoverable: true,
          suggestedAction: '前往设置页为该服务商配置 API Key。',
        ),
      );
    }

    final temperature =
        model?.temperature ?? provider.temperature;
    final resolved = ResolvedProvider(
      provider: provider,
      model: model,
      apiKey: apiKey,
      temperature: temperature,
      topP: provider.topP,
      streamingEnabled: provider.streamingEnabled,
    );
    return AppResult<ResolvedProvider>.success(resolved);
  }
}
