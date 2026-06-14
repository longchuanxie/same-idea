import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';

void main() {
  group('LlmDefaultSettings', () {
    test('empty constant has all nullable provider/model ids null', () {
      const settings = LlmDefaultSettings.empty;
      expect(settings.writingProviderId, isNull);
      expect(settings.writingModelId, isNull);
      expect(settings.reasoningProviderId, isNull);
      expect(settings.reasoningModelId, isNull);
      expect(settings.embeddingProviderId, isNull);
      expect(settings.embeddingModelId, isNull);
      expect(settings.defaultTemperature, 0.7);
      expect(settings.defaultTopP, 0.9);
      expect(settings.streamingEnabled, true);
    });

    test('roundtrips through JSON', () {
      const settings = LlmDefaultSettings(
        writingProviderId: 'p1',
        writingModelId: 'm1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
        defaultTemperature: 0.5,
        defaultTopP: 0.95,
        streamingEnabled: false,
      );
      final restored = LlmDefaultSettings.fromJson(settings.toJson());
      expect(restored, settings);
    });
  });
}
