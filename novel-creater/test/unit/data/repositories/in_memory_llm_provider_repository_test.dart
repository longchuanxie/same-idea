import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_llm_provider_repository.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

LlmProvider _makeProvider(String id) {
  final now = DateTime.utc(2026, 6, 6);
  return LlmProvider(
    id: id,
    projectId: 'global',
    name: 'OpenAI $id',
    baseUrl: 'https://api.openai.com/v1',
    secretKeyRef: 'novel_creator_secret_$id',
    selectedModelId: null,
    status: ProviderStatus.pendingConfig,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  group('InMemoryLlmProviderRepository', () {
    test('add then getAll returns the provider', () async {
      final repo = InMemoryLlmProviderRepository();
      await repo.add(_makeProvider('p1'));
      final result = await repo.getAll();
      expect(result, isA<AppSuccess<List<LlmProvider>>>());
      expect((result as AppSuccess<List<LlmProvider>>).value, hasLength(1));
    });

    test('update existing provider succeeds', () async {
      final repo = InMemoryLlmProviderRepository();
      final p = _makeProvider('p1');
      await repo.add(p);
      final updated = p.copyWith(name: 'Renamed');
      final result = await repo.update(updated);
      expect(result, isA<AppSuccess<LlmProvider>>());
      expect((result as AppSuccess<LlmProvider>).value.name, 'Renamed');
    });

    test('update missing provider returns failure', () async {
      final repo = InMemoryLlmProviderRepository();
      final result = await repo.update(_makeProvider('ghost'));
      expect(result, isA<AppFailure<LlmProvider>>());
      expect(
        (result as AppFailure<LlmProvider>).error.code,
        'llm_provider.not_found',
      );
    });

    test('remove deletes the provider', () async {
      final repo = InMemoryLlmProviderRepository();
      await repo.add(_makeProvider('p1'));
      await repo.remove('p1');
      final result = await repo.getAll();
      expect((result as AppSuccess<List<LlmProvider>>).value, isEmpty);
    });

    test('getById returns null when missing', () async {
      final repo = InMemoryLlmProviderRepository();
      final result = await repo.getById('ghost');
      expect(result, isA<AppSuccess<LlmProvider?>>());
      expect((result as AppSuccess<LlmProvider?>).value, isNull);
    });

    test('default settings start empty and can be saved', () async {
      final repo = InMemoryLlmProviderRepository();
      final initial = await repo.getDefaultSettings();
      expect(
        (initial as AppSuccess<LlmDefaultSettings>).value,
        LlmDefaultSettings.empty,
      );
      const updated = LlmDefaultSettings(
        writingProviderId: 'p1',
        writingModelId: 'm1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      );
      await repo.setDefaultSettings(updated);
      final after = await repo.getDefaultSettings();
      expect((after as AppSuccess<LlmDefaultSettings>).value, updated);
    });
  });
}
