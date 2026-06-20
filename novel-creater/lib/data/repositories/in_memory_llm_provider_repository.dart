import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryLlmProviderRepository implements LlmProviderRepository {
  final Map<String, LlmProvider> _providers = <String, LlmProvider>{};
  LlmDefaultSettings _defaultSettings = LlmDefaultSettings.empty;

  @override
  Future<AppResult<List<LlmProvider>>> getAll() async =>
      AppResult<List<LlmProvider>>.success(
        List<LlmProvider>.unmodifiable(_providers.values),
      );

  @override
  Future<AppResult<LlmProvider?>> getById(String id) async =>
      AppResult<LlmProvider?>.success(_providers[id]);

  @override
  Future<AppResult<LlmProvider>> add(LlmProvider provider) async {
    _providers[provider.id] = provider;
    return AppResult<LlmProvider>.success(provider);
  }

  @override
  Future<AppResult<LlmProvider>> update(LlmProvider provider) async {
    if (!_providers.containsKey(provider.id)) {
      return const AppResult<LlmProvider>.failure(
        AppError(
          code: 'llm_provider.not_found',
          message: 'Provider was not found.',
          userMessage: '未找到该服务商，无法更新。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );
    }
    final saved = provider.copyWith(updatedAt: DateTime.now().toUtc());
    _providers[provider.id] = saved;
    return AppResult<LlmProvider>.success(saved);
  }

  @override
  Future<AppResult<void>> remove(String id) async {
    _providers.remove(id);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings() async =>
      AppResult<LlmDefaultSettings>.success(_defaultSettings);

  @override
  Future<AppResult<void>> setDefaultSettings(
    LlmDefaultSettings settings,
  ) async {
    _defaultSettings = settings;
    return const AppResult<void>.success(null);
  }
}
