import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_llm_provider_repository.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

LlmProvider _makeProvider(String id) {
  final now = DateTime.utc(2026, 6, 6);
  return LlmProvider(
    id: id,
    projectId: '__global__',
    name: 'Provider $id',
    baseUrl: 'https://api.$id.com/v1',
    secretKeyRef: 'secret_$id',
    selectedModelId: null,
    status: ProviderStatus.connected,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  late AppDatabase db;
  late DriftLlmProviderRepository repo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    repo = DriftLlmProviderRepository(db);
  });

  tearDown(() async => await db.close());

  group('DriftLlmProviderRepository', () {
    test('add then getAll returns provider with cached models', () async {
      final provider = _makeProvider('p1').copyWith(
        cachedModels: [
          const LlmModel(
            id: 'm1',
            modelId: 'gpt-4o',
            name: 'GPT-4o',
            temperature: 0.3,
          ),
          const LlmModel(
            id: 'm2',
            modelId: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            temperature: 0.5,
          ),
        ],
      );
      await repo.add(provider);

      final result = await repo.getAll();
      expect(result.isSuccess, true);
      expect(result.valueOrNull, hasLength(1));
      final restored = result.valueOrNull!.single;
      expect(restored.cachedModels, hasLength(2));
      expect(restored.cachedModels[0].temperature, 0.3);
      expect(restored.cachedModels[1].temperature, 0.5);
    });

    test('getById returns null when missing', () async {
      final result = await repo.getById('ghost');
      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('update missing provider returns failure', () async {
      final result = await repo.update(_makeProvider('ghost'));
      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });

    test('remove deletes provider', () async {
      await repo.add(_makeProvider('p1'));
      await repo.remove('p1');

      final all = await repo.getAll();
      expect(all.valueOrNull, isEmpty);
    });

    test('getDefaultSettings returns empty on fresh DB', () async {
      final result = await repo.getDefaultSettings();
      expect(result.isSuccess, true);
      expect(result.valueOrNull, LlmDefaultSettings.empty);
    });

    test('setDefaultSettings then getDefaultSettings roundtrips', () async {
      const settings = LlmDefaultSettings(
        writingProviderId: 'prov1',
        writingModelId: 'model1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      );
      await repo.setDefaultSettings(settings);

      final result = await repo.getDefaultSettings();
      expect(result.valueOrNull?.writingProviderId, 'prov1');
      expect(result.valueOrNull?.writingModelId, 'model1');
    });

    test('setDefaultSettings twice overwrites', () async {
      await repo.setDefaultSettings(const LlmDefaultSettings(
        writingProviderId: 'first',
        writingModelId: 'm1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      ));
      await repo.setDefaultSettings(const LlmDefaultSettings(
        writingProviderId: 'second',
        writingModelId: 'm2',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      ));

      final result = await repo.getDefaultSettings();
      expect(result.valueOrNull?.writingProviderId, 'second');
    });
  });
}
