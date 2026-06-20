import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/llm_provider_mapper.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

void main() {
  const mapper = LlmProviderMapper();

  LlmProvider _makeProvider({
    List<LlmModel> models = const <LlmModel>[],
    ProviderStatus status = ProviderStatus.connected,
  }) {
    final now = DateTime.utc(2026, 6, 6);
    return LlmProvider(
      id: 'lp1',
      projectId: '__global__',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      secretKeyRef: 'novel_secret_lp1',
      selectedModelId: models.isNotEmpty ? models.first.id : null,
      status: status,
      cachedModels: models,
      createdAt: now,
      updatedAt: now,
    );
  }

  group('LlmProviderMapper', () {
    test('roundtrips provider without cached models', () {
      final entity = _makeProvider();
      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, entity.id);
      expect(restored.name, 'OpenAI');
      expect(restored.baseUrl, 'https://api.openai.com/v1');
      expect(restored.secretKeyRef, 'novel_secret_lp1');
      expect(restored.selectedModelId, isNull);
      expect(restored.cachedModels, isEmpty);
      expect(restored.status, ProviderStatus.connected);
      expect(restored.temperature, 0.7);
      expect(restored.topP, 0.9);
      expect(restored.streamingEnabled, true);
    });

    test('roundtrips provider with multiple cached models', () {
      final models = <LlmModel>[
        const LlmModel(
          id: 'm1',
          modelId: 'gpt-4o',
          name: 'GPT-4o',
          contextLength: 128000,
          temperature: 0.3,
        ),
        const LlmModel(
          id: 'm2',
          modelId: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          contextLength: 128000,
          maxOutput: 16000,
          temperature: 0.5,
        ),
      ];
      final entity = _makeProvider(models: models);
      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.cachedModels, hasLength(2));
      expect(restored.cachedModels[0].modelId, 'gpt-4o');
      expect(restored.cachedModels[0].temperature, 0.3);
      expect(restored.cachedModels[1].modelId, 'gpt-4o-mini');
      expect(restored.cachedModels[1].temperature, 0.5);
      expect(restored.cachedModels[1].maxOutput, 16000);
    });

    test('roundtrips local provider status', () {
      final entity = _makeProvider(status: ProviderStatus.local);
      final restored = mapper.fromRow(mapper.toRow(entity));
      expect(restored.status, ProviderStatus.local);
    });

    test('roundtrips custom temperature and topP', () {
      final now = DateTime.utc(2026, 6, 6);
      final entity = LlmProvider(
        id: 'lp_custom',
        projectId: '__global__',
        name: 'Custom',
        baseUrl: 'http://localhost:11434/v1',
        secretKeyRef: '',
        selectedModelId: null,
        status: ProviderStatus.local,
        temperature: 1.2,
        topP: 0.8,
        streamingEnabled: false,
        createdAt: now,
        updatedAt: now,
      );
      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.temperature, 1.2);
      expect(restored.topP, 0.8);
      expect(restored.streamingEnabled, false);
    });

    test('roundtrips all provider statuses', () {
      for (final status in ProviderStatus.values) {
        final entity = _makeProvider(status: status);
        final restored = mapper.fromRow(mapper.toRow(entity));
        expect(restored.status, status, reason: 'Failed for $status');
      }
    });
  });
}
