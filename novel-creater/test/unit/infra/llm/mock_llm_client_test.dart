import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/llm/llm.dart';

void main() {
  group('MockLlmClient', () {
    test('complete returns deterministic response and token usage', () async {
      const client = MockLlmClient();
      final request = LlmRequest(
        provider: _provider(),
        messages: const [
          LlmMessage(
            role: LlmMessageRole.system,
            content: 'You are a writing assistant.',
          ),
          LlmMessage(
            role: LlmMessageRole.user,
            content: 'Write an opening scene.',
          ),
        ],
      );

      final result = await client.complete(request);

      expect(result.isSuccess, isTrue);
      result.when(
        success: (response) {
          expect(response.content, contains('Write an opening scene.'));
          expect(response.model, 'mock-model');
          expect(response.tokenUsage.promptTokens, greaterThan(0));
          expect(response.tokenUsage.completionTokens, greaterThan(0));
          expect(response.rawJson?['mock'], isTrue);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('streamComplete yields chunks that reconstruct the response',
        () async {
      const client = MockLlmClient();
      final request = LlmRequest(
        provider: _provider(),
        messages: const [
          LlmMessage(
            role: LlmMessageRole.user,
            content: 'Continue the chapter.',
          ),
        ],
      );

      final chunks = await client.streamComplete(request).toList();

      expect(chunks.every((chunk) => chunk.isSuccess), isTrue);
      final content = chunks.map((chunk) => chunk.maybeSuccess).join();
      expect(content, contains('Continue the chapter.'));
    });

    test('complete fails when provider is disabled', () async {
      const client = MockLlmClient();
      final request = LlmRequest(
        provider: _provider(enabled: false),
        messages: const [
          LlmMessage(
            role: LlmMessageRole.user,
            content: 'Draft a scene.',
          ),
        ],
      );

      final result = await client.complete(request);

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'LLM_PROVIDER_DISABLED');
      expect(result.maybeFailure?.source, AppErrorSource.llm);
    });

    test('complete fails for empty messages', () async {
      const client = MockLlmClient();
      final request = LlmRequest(
        provider: _provider(),
        messages: const [],
      );

      final result = await client.complete(request);

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'LLM_PROMPT_EMPTY');
    });
  });
}

LlmProvider _provider({bool enabled = true}) {
  final now = DateTime(2026, 6, 4);
  return LlmProvider(
    id: 'provider-1',
    displayName: 'Mock Provider',
    baseUrl: 'mock://local',
    createdAt: now,
    updatedAt: now,
    defaultModel: 'mock-model',
    temperature: 0.4,
    maxTokens: 1024,
    enabled: enabled,
  );
}
