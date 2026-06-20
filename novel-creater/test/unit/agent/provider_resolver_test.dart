import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/provider_resolver.dart';
import 'package:novel_creator/data/repositories/in_memory_llm_provider_repository.dart';
import 'package:novel_creator/data/secure/in_memory_secret_storage.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

LlmProvider _makeProvider({
  String id = 'p1',
  ProviderStatus status = ProviderStatus.connected,
  String secretKeyRef = 'novel_creator.llm.p1',
  double temperature = 0.7,
  List<LlmModel> models = const <LlmModel>[],
}) {
  final now = DateTime.utc(2026, 6, 6);
  return LlmProvider(
    id: id,
    projectId: 'global',
    name: 'Test $id',
    baseUrl: 'https://example.com/v1',
    secretKeyRef: secretKeyRef,
    selectedModelId: null,
    status: status,
    createdAt: now,
    updatedAt: now,
    cachedModels: models,
    temperature: temperature,
  );
}

void main() {
  group('ProviderResolver.resolveWritingProvider', () {
    test('returns model_not_selected when defaults empty', () async {
      final resolver = ProviderResolver(
        repository: InMemoryLlmProviderRepository(),
        secretStorage: InMemorySecretStorage(),
      );
      final result = await resolver.resolveWritingProvider();
      expect(result, isA<AppFailure<ResolvedProvider>>());
      expect(
        (result as AppFailure<ResolvedProvider>).error.code,
        'llm.model_not_selected',
      );
    });

    test('returns provider_not_found when settings reference missing provider',
        () async {
      final repo = InMemoryLlmProviderRepository();
      await repo.setDefaultSettings(
        const LlmDefaultSettings(
          writingProviderId: 'ghost',
          writingModelId: 'm1',
          reasoningProviderId: null,
          reasoningModelId: null,
          embeddingProviderId: null,
          embeddingModelId: null,
        ),
      );
      final resolver = ProviderResolver(
        repository: repo,
        secretStorage: InMemorySecretStorage(),
      );
      final result = await resolver.resolveWritingProvider();
      expect(
        (result as AppFailure<ResolvedProvider>).error.code,
        'llm.provider_not_found',
      );
    });

    test('returns api_key_missing when secret empty and provider not local',
        () async {
      final repo = InMemoryLlmProviderRepository();
      final provider = _makeProvider();
      await repo.add(provider);
      await repo.setDefaultSettings(
        const LlmDefaultSettings(
          writingProviderId: 'p1',
          writingModelId: null,
          reasoningProviderId: null,
          reasoningModelId: null,
          embeddingProviderId: null,
          embeddingModelId: null,
        ),
      );
      final resolver = ProviderResolver(
        repository: repo,
        secretStorage: InMemorySecretStorage(),
      );
      final result = await resolver.resolveWritingProvider();
      expect(
        (result as AppFailure<ResolvedProvider>).error.code,
        'llm.api_key_missing',
      );
    });

    test('local provider passes with empty api key', () async {
      final repo = InMemoryLlmProviderRepository();
      final provider = _makeProvider(status: ProviderStatus.local);
      await repo.add(provider);
      await repo.setDefaultSettings(
        const LlmDefaultSettings(
          writingProviderId: 'p1',
          writingModelId: null,
          reasoningProviderId: null,
          reasoningModelId: null,
          embeddingProviderId: null,
          embeddingModelId: null,
        ),
      );
      final resolver = ProviderResolver(
        repository: repo,
        secretStorage: InMemorySecretStorage(),
      );
      final result = await resolver.resolveWritingProvider();
      expect(result, isA<AppSuccess<ResolvedProvider>>());
      final value = (result as AppSuccess<ResolvedProvider>).value;
      expect(value.apiKey, '');
      expect(value.provider.id, 'p1');
    });

    test('temperature priority: model override beats provider default',
        () async {
      final repo = InMemoryLlmProviderRepository();
      const model = LlmModel(
        id: 'm1',
        modelId: 'gpt-4o',
        name: 'GPT-4o',
        temperature: 0.2,
      );
      final provider = _makeProvider(
        temperature: 0.9,
        models: <LlmModel>[model],
      );
      await repo.add(provider);
      await repo.setDefaultSettings(
        const LlmDefaultSettings(
          writingProviderId: 'p1',
          writingModelId: 'gpt-4o',
          reasoningProviderId: null,
          reasoningModelId: null,
          embeddingProviderId: null,
          embeddingModelId: null,
        ),
      );
      final secret = InMemorySecretStorage();
      await secret.write(ref: provider.secretKeyRef, value: 'sk-test');
      final resolver = ProviderResolver(
        repository: repo,
        secretStorage: secret,
      );
      final result = await resolver.resolveWritingProvider();
      expect(result, isA<AppSuccess<ResolvedProvider>>());
      final value = (result as AppSuccess<ResolvedProvider>).value;
      expect(value.temperature, 0.2);
      expect(value.provider.temperature, 0.9);
      expect(value.apiKey, 'sk-test');
    });

    test('temperature falls back to provider default when model has none',
        () async {
      final repo = InMemoryLlmProviderRepository();
      const model = LlmModel(
        id: 'm1',
        modelId: 'gpt-4o',
        name: 'GPT-4o',
      );
      final provider = _makeProvider(
        temperature: 0.5,
        models: <LlmModel>[model],
      );
      await repo.add(provider);
      await repo.setDefaultSettings(
        const LlmDefaultSettings(
          writingProviderId: 'p1',
          writingModelId: 'gpt-4o',
          reasoningProviderId: null,
          reasoningModelId: null,
          embeddingProviderId: null,
          embeddingModelId: null,
        ),
      );
      final secret = InMemorySecretStorage();
      await secret.write(ref: provider.secretKeyRef, value: 'sk-test');
      final resolver = ProviderResolver(
        repository: repo,
        secretStorage: secret,
      );
      final result = await resolver.resolveWritingProvider();
      final value = (result as AppSuccess<ResolvedProvider>).value;
      expect(value.temperature, 0.5);
    });
  });
}
