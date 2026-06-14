import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';

void main() {
  group('LlmModel', () {
    test('serializes to JSON with default values', () {
      const model = LlmModel(
        id: 'm1',
        modelId: 'gpt-4o',
        name: 'GPT-4o',
      );
      final json = model.toJson();
      expect(json['id'], 'm1');
      expect(json['modelId'], 'gpt-4o');
      expect(json['name'], 'GPT-4o');
      expect(json['supportsStreaming'], true);
      expect(json['temperature'], isNull);
      expect(json['contextLength'], isNull);
    });

    test('roundtrips with per-model temperature override', () {
      const model = LlmModel(
        id: 'm2',
        modelId: 'gpt-4o-mini',
        name: 'GPT-4o-mini',
        contextLength: 128000,
        maxOutput: 16000,
        temperature: 0.3,
      );
      final restored = LlmModel.fromJson(model.toJson());
      expect(restored, model);
      expect(restored.temperature, 0.3);
    });
  });
}
