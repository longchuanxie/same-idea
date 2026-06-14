import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/llm_default_settings_mapper.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';

void main() {
  const mapper = LlmDefaultSettingsMapper();

  group('LlmDefaultSettingsMapper', () {
    test('roundtrips empty settings', () {
      const entity = LlmDefaultSettings.empty;
      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.writingProviderId, isNull);
      expect(restored.writingModelId, isNull);
      expect(restored.reasoningProviderId, isNull);
      expect(restored.reasoningModelId, isNull);
      expect(restored.embeddingProviderId, isNull);
      expect(restored.embeddingModelId, isNull);
      expect(restored.defaultTemperature, 0.7);
      expect(restored.defaultTopP, 0.9);
      expect(restored.streamingEnabled, true);
    });

    test('roundtrips fully configured settings', () {
      const entity = LlmDefaultSettings(
        writingProviderId: 'prov1',
        writingModelId: 'model1',
        reasoningProviderId: 'prov2',
        reasoningModelId: 'model2',
        embeddingProviderId: 'prov3',
        embeddingModelId: 'model3',
        defaultTemperature: 0.5,
        defaultTopP: 0.95,
        streamingEnabled: false,
      );
      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.writingProviderId, 'prov1');
      expect(restored.writingModelId, 'model1');
      expect(restored.reasoningProviderId, 'prov2');
      expect(restored.reasoningModelId, 'model2');
      expect(restored.embeddingProviderId, 'prov3');
      expect(restored.embeddingModelId, 'model3');
      expect(restored.defaultTemperature, 0.5);
      expect(restored.defaultTopP, 0.95);
      expect(restored.streamingEnabled, false);
    });

    test('row always has id=1', () {
      const entity = LlmDefaultSettings.empty;
      final row = mapper.toRow(entity);
      expect(row.id, 1);
    });

    test('roundtrips partial configuration', () {
      const entity = LlmDefaultSettings(
        writingProviderId: 'only-writing',
        writingModelId: 'only-model',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      );
      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.writingProviderId, 'only-writing');
      expect(restored.writingModelId, 'only-model');
      expect(restored.reasoningProviderId, isNull);
      expect(restored.defaultTemperature, 0.7); // default preserved
    });
  });
}
