import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

void main() {
  group('LlmProvider', () {
    test('roundtrips through JSON with cached models', () {
      final now = DateTime.utc(2026, 6, 6);
      final provider = LlmProvider(
        id: 'p1',
        projectId: 'global',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        secretKeyRef: 'novel_creator_secret_p1',
        selectedModelId: 'm1',
        cachedModels: const <LlmModel>[
          LlmModel(id: 'm1', modelId: 'gpt-4o', name: 'GPT-4o'),
        ],
        status: ProviderStatus.connected,
        createdAt: now,
        updatedAt: now,
      );
      final restored = LlmProvider.fromJson(provider.toJson());
      expect(restored, provider);
      expect(restored.cachedModels, hasLength(1));
      expect(restored.temperature, 0.7);
    });

    test('defaults streamingEnabled true and schemaVersion 1', () {
      final now = DateTime.utc(2026, 6, 6);
      final provider = LlmProvider(
        id: 'p2',
        projectId: 'global',
        name: 'Local',
        baseUrl: 'http://localhost:11434/v1',
        secretKeyRef: '',
        selectedModelId: null,
        status: ProviderStatus.local,
        createdAt: now,
        updatedAt: now,
      );
      expect(provider.streamingEnabled, true);
      expect(provider.schemaVersion, 1);
      expect(provider.cachedModels, isEmpty);
    });
  });
}
