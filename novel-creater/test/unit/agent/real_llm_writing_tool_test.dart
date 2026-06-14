import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/provider_resolver.dart';
import 'package:novel_creator/agent/real_llm_writing_tool.dart';
import 'package:novel_creator/data/repositories/in_memory_llm_provider_repository.dart';
import 'package:novel_creator/data/secure/in_memory_secret_storage.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';

class _StubLlmClient implements LlmClient {
  _StubLlmClient({
    this.streamChunks = const <LlmStreamChunk>[],
    this.completion,
  });

  final List<LlmStreamChunk> streamChunks;
  final AppResult<LlmResponse>? completion;
  LlmRequest? lastRequest;

  @override
  Stream<LlmStreamChunk> chatCompletionStream(LlmRequest request) async* {
    lastRequest = request;
    for (final chunk in streamChunks) {
      yield chunk;
    }
  }

  @override
  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request) async {
    lastRequest = request;
    return completion ??
        const AppResult<LlmResponse>.failure(
          AppError(
            code: 'stub.unconfigured',
            message: 'No completion configured.',
            userMessage: 'stub error',
            source: AppErrorSource.llm,
            recoverable: true,
          ),
        );
  }

  @override
  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  }) async =>
      const AppResult<List<LlmModel>>.success(<LlmModel>[]);

  @override
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  }) async =>
      const AppResult<void>.success(null);
}

Future<({InMemoryLlmProviderRepository repo, InMemorySecretStorage secret})>
    _seedConnectedProvider({
  bool streaming = true,
  String? selectedModelId = 'gpt-4o',
}) async {
  final repo = InMemoryLlmProviderRepository();
  final secret = InMemorySecretStorage();
  final now = DateTime.utc(2026, 6, 6);
  const model = LlmModel(
    id: 'm1',
    modelId: 'gpt-4o',
    name: 'GPT-4o',
  );
  final provider = LlmProvider(
    id: 'p1',
    projectId: 'global',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    secretKeyRef: 'novel_creator.llm.p1',
    selectedModelId: selectedModelId,
    status: ProviderStatus.connected,
    createdAt: now,
    updatedAt: now,
    cachedModels: <LlmModel>[model],
    streamingEnabled: streaming,
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
  await secret.write(ref: provider.secretKeyRef, value: 'sk-test');
  return (repo: repo, secret: secret);
}

void main() {
  group('RealLlmWritingTool.continueWrite', () {
    test('streaming path assembles text from chunks', () async {
      final seed = await _seedConnectedProvider();
      final client = _StubLlmClient(
        streamChunks: const <LlmStreamChunk>[
          LlmStreamChunk.textDelta('Hel'),
          LlmStreamChunk.textDelta('lo, '),
          LlmStreamChunk.textDelta('world.'),
          LlmStreamChunk.done('stop'),
        ],
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.continueWrite(
        chapterId: 'c1',
        cursorContext: 'Once upon a time',
        targetLength: 200,
      );
      expect(result, isA<AppSuccess<AgentContinueWriteResult>>());
      final value = (result as AppSuccess<AgentContinueWriteResult>).value;
      expect(value.continuedText, 'Hello, world.');
      expect(value.stopReason, 'stop');
      expect(value.usedProvider, 'OpenAI');
      expect(value.usedModel, 'gpt-4o');
      expect(client.lastRequest?.stream, true);
      expect(client.lastRequest?.model, 'gpt-4o');
    });

    test('non-streaming path returns response content', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(content: 'Quiet night.', finishReason: 'stop'),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.continueWrite(
        chapterId: 'c1',
        cursorContext: 'Night fell.',
        targetLength: 100,
      );
      expect(result, isA<AppSuccess<AgentContinueWriteResult>>());
      final value = (result as AppSuccess<AgentContinueWriteResult>).value;
      expect(value.continuedText, 'Quiet night.');
      expect(value.stopReason, 'stop');
      expect(client.lastRequest?.stream, false);
    });

    test('resolver failure short-circuits without calling client', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final client = _StubLlmClient();
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(repository: repo, secretStorage: secret),
      );
      final result = await tool.continueWrite(
        chapterId: 'c1',
        cursorContext: '',
        targetLength: 100,
      );
      expect(result, isA<AppFailure<AgentContinueWriteResult>>());
      // Error comes from ProviderResolver when no provider is configured
      final errorCode =
          (result as AppFailure<AgentContinueWriteResult>).error.code;
      expect(errorCode, anyOf('llm.model_not_selected', 'llm.model_id_empty'));
      expect(client.lastRequest, isNull);
    });
  });

  group('RealLlmWritingTool.write', () {
    test('non-streaming returns parsed generate result', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '雨丝如织，笼罩着小镇。\n\n【摘要】描写了雨中的小镇景象\n【警告】\n- 未涉及人物',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.write(
        projectId: 'p1',
        chapterId: 'c1',
        instruction: '写一段雨景',
        targetLength: 500,
      );
      expect(result, isA<AppSuccess<AgentGenerateResult>>());
      final value = (result as AppSuccess<AgentGenerateResult>).value;
      expect(value.generatedText, '雨丝如织，笼罩着小镇。');
      expect(value.summary, '描写了雨中的小镇景象');
      expect(value.warnings, <String>['未涉及人物']);
      expect(value.usedProvider, 'OpenAI');
      expect(value.usedModel, 'gpt-4o');
    });

    test('streaming returns parsed generate result', () async {
      final seed = await _seedConnectedProvider(streaming: true);
      final client = _StubLlmClient(
        streamChunks: const <LlmStreamChunk>[
          LlmStreamChunk.textDelta('正文内容\n\n【摘要】生成摘要'),
          LlmStreamChunk.done('stop'),
        ],
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.write(
        projectId: 'p1',
        chapterId: 'c1',
        instruction: 'test',
        targetLength: 500,
      );
      expect(result, isA<AppSuccess<AgentGenerateResult>>());
      final value = (result as AppSuccess<AgentGenerateResult>).value;
      expect(value.generatedText, '正文内容');
      expect(value.summary, '生成摘要');
    });

    test('resolver failure returns AppFailure', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final client = _StubLlmClient();
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(repository: repo, secretStorage: secret),
      );
      final result = await tool.write(
        projectId: 'p1',
        chapterId: 'c1',
        instruction: 'test',
        targetLength: 500,
      );
      expect(result, isA<AppFailure<AgentGenerateResult>>());
      expect(client.lastRequest, isNull);
    });
  });

  group('RealLlmWritingTool.rewrite', () {
    test('non-streaming returns parsed rewrite result', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '改写后的文本\n\n【改动说明】调整了语气',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.rewrite(
        selectedText: '旧文本',
        instruction: '更正式',
      );
      expect(result, isA<AppSuccess<AgentRewriteResult>>());
      final value = (result as AppSuccess<AgentRewriteResult>).value;
      expect(value.revisedText, '改写后的文本');
      expect(value.changeSummary, '调整了语气');
    });

    test('streaming error returns AppFailure', () async {
      final seed = await _seedConnectedProvider(streaming: true);
      final client = _StubLlmClient(
        streamChunks: const <LlmStreamChunk>[
          LlmStreamChunk.error(
            AppError(
              code: 'llm.stream_error',
              message: 'Stream failed',
              userMessage: '流式输出失败',
              source: AppErrorSource.llm,
              recoverable: true,
            ),
          ),
        ],
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.rewrite(
        selectedText: 'text',
        instruction: 'test',
      );
      expect(result, isA<AppFailure<AgentRewriteResult>>());
    });
  });

  group('RealLlmWritingTool.expand', () {
    test('non-streaming returns parsed expand result', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '扩写后的文本\n\n【新增说明】增加了环境描写',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.expand(
        selectedText: '简短文本',
        targetLength: 1200,
        focus: '环境',
      );
      expect(result, isA<AppSuccess<AgentExpandResult>>());
      final value = (result as AppSuccess<AgentExpandResult>).value;
      expect(value.expandedText, '扩写后的文本');
      expect(value.additionsSummary, '增加了环境描写');
    });
  });

  group('RealLlmWritingTool.condense', () {
    test('non-streaming returns parsed condense result', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '精简后的文本\n\n【删除要点】\n- 冗余描述\n- 重复段落',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.condense(
        selectedText: '冗长文本',
        targetLength: 400,
      );
      expect(result, isA<AppSuccess<AgentCondenseResult>>());
      final value = (result as AppSuccess<AgentCondenseResult>).value;
      expect(value.condensedText, '精简后的文本');
      expect(value.removedPoints, <String>['冗余描述', '重复段落']);
    });

    test('condense with keepPoints includes them in prompt', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '精简文本\n\n【删除要点】\n- 次要细节',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      await tool.condense(
        selectedText: '文本',
        targetLength: 400,
        keepPoints: <String>['关键要点'],
      );
      expect(client.lastRequest, isNotNull);
      final userMsg = client.lastRequest!.messages
          .where((m) => m.role == 'user')
          .first
          .content;
      expect(userMsg, contains('关键要点'));
    });
  });

  group('RealLlmWritingTool.polish', () {
    test('non-streaming returns parsed polish result', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '润色后的文本\n\n【风格说明】优化了句式节奏',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.polish(
        selectedText: '粗糙文本',
        styleGoal: '文学化',
      );
      expect(result, isA<AppSuccess<AgentPolishResult>>());
      final value = (result as AppSuccess<AgentPolishResult>).value;
      expect(value.polishedText, '润色后的文本');
      expect(value.styleNotes, '优化了句式节奏');
    });

    test('polish with high strictness includes strict mode in prompt',
        () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '润色文本\n\n【风格说明】微调',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      await tool.polish(
        selectedText: '文本',
        styleGoal: '简洁',
        strictness: 0.9,
      );
      final userMsg = client.lastRequest!.messages
          .where((m) => m.role == 'user')
          .first
          .content;
      expect(userMsg, contains('严格模式'));
    });

    test('polish with low strictness includes loose mode in prompt',
        () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '润色文本\n\n【风格说明】大幅调整',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      await tool.polish(
        selectedText: '文本',
        styleGoal: '简洁',
        strictness: 0.3,
      );
      final userMsg = client.lastRequest!.messages
          .where((m) => m.role == 'user')
          .first
          .content;
      expect(userMsg, contains('宽松模式'));
    });
  });

  group('RealLlmWritingTool structured output parsing', () {
    test('output without tags puts everything in body', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '纯文本无标签',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.rewrite(
        selectedText: 'text',
        instruction: 'test',
      );
      final value = (result as AppSuccess<AgentRewriteResult>).value;
      expect(value.revisedText, '纯文本无标签');
      expect(value.changeSummary, isEmpty);
    });

    test('output with multiple tags parses correctly', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.success(
          LlmResponse(
            content: '正文\n\n【摘要】摘要内容\n【警告】\n- 警告1\n- 警告2',
            finishReason: 'stop',
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.write(
        projectId: 'p1',
        chapterId: 'c1',
        instruction: 'test',
        targetLength: 500,
      );
      final value = (result as AppSuccess<AgentGenerateResult>).value;
      expect(value.generatedText, '正文');
      expect(value.summary, '摘要内容');
      expect(value.warnings, <String>['警告1', '警告2']);
    });
  });

  group('RealLlmWritingTool error handling', () {
    test('non-streaming LLM error returns AppFailure', () async {
      final seed = await _seedConnectedProvider(streaming: false);
      final client = _StubLlmClient(
        completion: const AppResult<LlmResponse>.failure(
          AppError(
            code: 'llm.rate_limit',
            message: 'Rate limit exceeded',
            userMessage: '请求过于频繁',
            source: AppErrorSource.llm,
            recoverable: true,
          ),
        ),
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.expand(
        selectedText: 'text',
        targetLength: 1200,
      );
      expect(result, isA<AppFailure<AgentExpandResult>>());
      expect(
        (result as AppFailure<AgentExpandResult>).error.code,
        'llm.rate_limit',
      );
    });

    test('streaming error chunk returns AppFailure', () async {
      final seed = await _seedConnectedProvider(streaming: true);
      final client = _StubLlmClient(
        streamChunks: const <LlmStreamChunk>[
          LlmStreamChunk.textDelta('partial'),
          LlmStreamChunk.error(
            AppError(
              code: 'llm.stream_error',
              message: 'Stream interrupted',
              userMessage: '流式输出中断',
              source: AppErrorSource.llm,
              recoverable: true,
            ),
          ),
        ],
      );
      final tool = RealLlmWritingTool(
        client: client,
        resolver: ProviderResolver(
          repository: seed.repo,
          secretStorage: seed.secret,
        ),
      );
      final result = await tool.polish(
        selectedText: 'text',
        styleGoal: '简洁',
      );
      expect(result, isA<AppFailure<AgentPolishResult>>());
      expect(
        (result as AppFailure<AgentPolishResult>).error.code,
        'llm.stream_error',
      );
    });
  });
}
