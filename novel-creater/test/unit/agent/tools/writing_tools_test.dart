import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/tools/tools.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/llm/llm.dart';

void main() {
  late LlmProvider provider;
  late ResultInterpreter interpreter;

  setUp(() {
    final now = DateTime(2026, 6, 4);
    provider = LlmProvider(
      id: 'mock',
      displayName: 'Mock',
      baseUrl: 'mock://local',
      createdAt: now,
      updatedAt: now,
    );
    interpreter = const ResultInterpreter();
  });

  group('ToolRegistry', () {
    test('registers all six writing tools with permissions', () {
      final registry = ToolRegistry();

      expect(registry.all.length, 6);
      expect(registry.requiresPendingRevision(WritingToolId.write), isFalse);
      expect(
        registry.requiresPendingRevision(WritingToolId.rewrite),
        isTrue,
      );
    });
  });

  group('Writing tools', () {
    test('write returns structured suggestion without revision patch',
        () async {
      final tool = WriteTool(
        llmClient: const _StaticLlmClient(
          '{"generatedText":"开场文字","summary":"新开场","warnings":[]}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        const WriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          instruction: '写一个开场',
          targetLength: 500,
        ),
      );

      expect(result.isStructured, isTrue);
      expect(result.output?.generatedText, '开场文字');
      expect(result.output?.summary, '新开场');
    });

    test('continue_write returns insert revision suggestion', () async {
      final tool = ContinueWriteTool(
        llmClient: const _StaticLlmClient(
          '{"continuedText":"继续的文字","stopReason":"达到长度"}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        ContinueWriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          cursorContext: '上一句',
          targetLength: 300,
          anchor: _anchor(),
        ),
      );

      final patch = result.output?.suggestedRevisionPatch;
      expect(patch?.operation, RevisionOperation.insert);
      expect(patch?.beforeText, isEmpty);
      expect(patch?.afterText, '继续的文字');
    });

    test('rewrite returns replace revision suggestion', () async {
      final tool = RewriteTool(
        llmClient: const _StaticLlmClient(
          '{"revisedText":"改写后","changeSummary":"更紧凑","warnings":[]}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        RewriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '原文',
          instruction: '更紧凑',
          anchor: _anchor(),
        ),
      );

      final patch = result.output?.suggestedRevisionPatch;
      expect(result.output?.revisedText, '改写后');
      expect(patch?.operation, RevisionOperation.replace);
      expect(patch?.beforeText, '原文');
      expect(patch?.afterText, '改写后');
    });

    test('expand returns replace revision suggestion', () async {
      final tool = ExpandTool(
        llmClient: const _StaticLlmClient(
          '{"expandedText":"原文加细节","additionsSummary":"增加感官","warnings":[]}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        ExpandInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '原文',
          targetLength: 20,
          focus: '感官',
          anchor: _anchor(),
        ),
      );

      expect(result.output?.expandedText, '原文加细节');
      expect(
        result.output?.suggestedRevisionPatch?.operation,
        RevisionOperation.replace,
      );
    });

    test('condense returns removed points and replace suggestion', () async {
      final tool = CondenseTool(
        llmClient: const _StaticLlmClient(
          '{"condensedText":"短文","removedPoints":["重复"],"warnings":[]}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        CondenseInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '很长很长的原文',
          targetLength: 4,
          keepPoints: const ['关键事实'],
          anchor: _anchor(),
        ),
      );

      expect(result.output?.condensedText, '短文');
      expect(result.output?.removedPoints, ['重复']);
      expect(result.output?.suggestedRevisionPatch?.beforeText, '很长很长的原文');
    });

    test('polish returns style notes and replace suggestion', () async {
      final tool = PolishTool(
        llmClient: const _StaticLlmClient(
          '{"polishedText":"润色后","styleNotes":"语气更稳定","warnings":[]}',
        ),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        PolishInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '原文',
          styleGoal: '克制',
          strictness: 3,
          anchor: _anchor(),
        ),
      );

      expect(result.output?.polishedText, '润色后');
      expect(result.output?.styleNotes, '语气更稳定');
      expect(result.output?.suggestedRevisionPatch?.afterText, '润色后');
    });

    test('plain text output downgrades to ordinary suggestion', () async {
      final tool = RewriteTool(
        llmClient: const _StaticLlmClient('这是一段纯文本建议'),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        RewriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '原文',
          instruction: '改写',
          anchor: _anchor(),
        ),
      );

      expect(result.isPlainSuggestion, isTrue);
      expect(result.plainSuggestion, '这是一段纯文本建议');
      expect(result.output, isNull);
    });

    test('llm failure returns tool failure', () async {
      final tool = WriteTool(
        llmClient: const _FailingLlmClient(),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        const WriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          instruction: '写',
          targetLength: 100,
        ),
      );

      expect(result.isFailure, isTrue);
      expect(result.error?.source, AppErrorSource.llm);
    });

    test('boundary input fails before calling llm', () async {
      final client = _CountingLlmClient();
      final tool = PolishTool(
        llmClient: client,
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        PolishInput(
          projectId: 'p1',
          chapterId: 'c1',
          selectedText: '',
          styleGoal: '克制',
          strictness: 9,
          anchor: _anchor(),
        ),
      );

      expect(result.isFailure, isTrue);
      expect(result.error?.code, 'TOOL_INPUT_INVALID');
      expect(client.calls, 0);
    });

    test('all tools validate boundary input before calling llm', () async {
      final client = _CountingLlmClient();
      final tools = <Future<WritingToolExecution<Object?>> Function()>[
        () => WriteTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              const WriteInput(
                projectId: 'p1',
                chapterId: 'c1',
                instruction: '',
                targetLength: 100,
              ),
            ),
        () => ContinueWriteTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              ContinueWriteInput(
                projectId: 'p1',
                chapterId: 'c1',
                cursorContext: '',
                targetLength: 100,
                anchor: _anchor(),
              ),
            ),
        () => RewriteTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              RewriteInput(
                projectId: 'p1',
                chapterId: 'c1',
                selectedText: '',
                instruction: '改写',
                anchor: _anchor(),
              ),
            ),
        () => ExpandTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              ExpandInput(
                projectId: 'p1',
                chapterId: 'c1',
                selectedText: '原文',
                targetLength: 1,
                focus: '细节',
                anchor: _anchor(),
              ),
            ),
        () => CondenseTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              CondenseInput(
                projectId: 'p1',
                chapterId: 'c1',
                selectedText: '',
                targetLength: 1,
                keepPoints: const [],
                anchor: _anchor(),
              ),
            ),
        () => PolishTool(
              llmClient: client,
              provider: provider,
              interpreter: interpreter,
            ).execute(
              PolishInput(
                projectId: 'p1',
                chapterId: 'c1',
                selectedText: '原文',
                styleGoal: '克制',
                strictness: 0,
                anchor: _anchor(),
              ),
            ),
      ];

      for (final execute in tools) {
        final result = await execute();
        expect(result.isFailure, isTrue);
        expect(result.error?.code, 'TOOL_INPUT_INVALID');
      }
      expect(client.calls, 0);
    });

    test('missing required structured field returns failure', () async {
      final tool = WriteTool(
        llmClient: const _StaticLlmClient('{"summary":"缺少正文"}'),
        provider: provider,
        interpreter: interpreter,
      );

      final result = await tool.execute(
        const WriteInput(
          projectId: 'p1',
          chapterId: 'c1',
          instruction: '写',
          targetLength: 100,
        ),
      );

      expect(result.isFailure, isTrue);
      expect(result.error?.code, 'TOOL_OUTPUT_MISSING_FIELD');
      expect(result.output, isNull);
    });
  });
}

RevisionAnchor _anchor() => const RevisionAnchor(
      type: AnchorType.selection,
      offset: 0,
      length: 2,
    );

class _StaticLlmClient implements LlmClient {
  const _StaticLlmClient(this.content);

  final String content;

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) async =>
      AppResult.success(
        LlmResponse(
          content: content,
          model: request.effectiveModel,
          tokenUsage: const LlmTokenUsage(
            promptTokens: 4,
            completionTokens: 6,
          ),
        ),
      );

  @override
  Stream<AppResult<String>> streamComplete(LlmRequest request) async* {
    yield AppResult.success(content);
  }

  @override
  Future<AppResult<void>> testConnection(
    LlmProvider provider, {
    String? apiKey,
  }) async =>
      const AppResult.success(null);
}

class _FailingLlmClient extends _StaticLlmClient {
  const _FailingLlmClient() : super('');

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) async =>
      const AppResult.failure(
        AppError(
          code: 'LLM_FAILED',
          message: 'failed',
          userMessage: 'LLM failed',
          source: AppErrorSource.llm,
        ),
      );
}

class _CountingLlmClient extends _StaticLlmClient {
  _CountingLlmClient() : super('{}');

  int calls = 0;

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) {
    calls += 1;
    return super.complete(request);
  }
}
