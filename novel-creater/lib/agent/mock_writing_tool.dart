import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/cancellation_token.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

class MockWritingTool implements AgentWritingTool {
  const MockWritingTool();

  static const _cancelledError = AppError(
    code: 'agent.cancelled',
    message: 'Operation was cancelled by user.',
    userMessage: '操作已取消。',
    source: AppErrorSource.llm,
    recoverable: true,
  );

  @override
  Future<AppResult<AgentContinueWriteResult>> continueWrite({
    required String chapterId,
    required String cursorContext,
    required int targetLength,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentContinueWriteResult>.failure(_cancelledError);
    }
    final isOpening = cursorContext.trim().isEmpty;
    final contextKind = isOpening ? 'opening' : 'continuation';
    return AppResult<AgentContinueWriteResult>.success(
      AgentContinueWriteResult(
        continuedText: 'Mock $contextKind for $chapterId '
            'with target length $targetLength.',
        stopReason: 'mock_complete',
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }

  @override
  Future<AppResult<AgentGenerateResult>> write({
    required String projectId,
    required String chapterId,
    required String instruction,
    required int targetLength,
    ContextScope contextScope = ContextScope.chapterOnly,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentGenerateResult>.failure(_cancelledError);
    }
    return AppResult<AgentGenerateResult>.success(
      AgentGenerateResult(
        generatedText: 'Mock generated text for chapter $chapterId '
            'with instruction: $instruction, '
            'target length $targetLength, '
            'scope ${contextScope.name}.',
        summary: 'Mock generation summary',
        warnings: <String>[],
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }

  @override
  Future<AppResult<AgentRewriteResult>> rewrite({
    required String selectedText,
    required String instruction,
    String? styleProfile,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentRewriteResult>.failure(_cancelledError);
    }
    return AppResult<AgentRewriteResult>.success(
      AgentRewriteResult(
        revisedText: 'Mock rewritten: $selectedText',
        changeSummary: 'Mock rewrite per instruction: $instruction',
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }

  @override
  Future<AppResult<AgentExpandResult>> expand({
    required String selectedText,
    required int targetLength,
    String? focus,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentExpandResult>.failure(_cancelledError);
    }
    return AppResult<AgentExpandResult>.success(
      AgentExpandResult(
        expandedText: 'Mock expanded: $selectedText',
        additionsSummary: 'Mock expansion to $targetLength chars'
            '${focus != null ? ', focus: $focus' : ''}',
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }

  @override
  Future<AppResult<AgentCondenseResult>> condense({
    required String selectedText,
    required int targetLength,
    List<String>? keepPoints,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentCondenseResult>.failure(_cancelledError);
    }
    return AppResult<AgentCondenseResult>.success(
      AgentCondenseResult(
        condensedText: 'Mock condensed: $selectedText',
        removedPoints: <String>['mock removed point'],
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }

  @override
  Future<AppResult<AgentPolishResult>> polish({
    required String selectedText,
    required String styleGoal,
    double strictness = 0.7,
    CancellationToken? cancellationToken,
  }) async {
    if (cancellationToken?.isCancelled ?? false) {
      return const AppResult<AgentPolishResult>.failure(_cancelledError);
    }
    return AppResult<AgentPolishResult>.success(
      AgentPolishResult(
        polishedText: 'Mock polished: $selectedText',
        styleNotes: 'Mock polish for style "$styleGoal" '
            'with strictness $strictness',
        temperature: 0.7,
        usedProvider: 'mock',
        usedModel: 'mock',
      ),
    );
  }
}
