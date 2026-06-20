import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/mock_writing_tool.dart';
import 'package:novel_creator/domain/results/app_result.dart';

void main() {
  group('MockWritingTool', () {
    const tool = MockWritingTool();

    test('continueWrite returns deterministic AppSuccess output', () async {
      final first = await tool.continueWrite(
        chapterId: 'chapter-1',
        cursorContext: 'The rain stopped.',
        targetLength: 120,
      );
      final second = await tool.continueWrite(
        chapterId: 'chapter-1',
        cursorContext: 'The rain stopped.',
        targetLength: 120,
      );

      expect(first, isA<AppSuccess<AgentContinueWriteResult>>());
      expect(second, isA<AppSuccess<AgentContinueWriteResult>>());
      final firstValue = (first as AppSuccess<AgentContinueWriteResult>).value;
      final secondValue = (second as AppSuccess<AgentContinueWriteResult>).value;
      expect(firstValue.continuedText, secondValue.continuedText);
      expect(firstValue.stopReason, secondValue.stopReason);
      expect(firstValue.continuedText, isNotEmpty);
      expect(firstValue.stopReason, 'mock_complete');
      expect(firstValue.usedProvider, 'mock');
      expect(firstValue.usedModel, 'mock');
    });

    test('continueWrite does not mutate chapter content', () async {
      const originalContent = 'Original content.';
      final result = await tool.continueWrite(
        chapterId: 'chapter-1',
        cursorContext: originalContent,
        targetLength: 120,
      );
      final value = (result as AppSuccess<AgentContinueWriteResult>).value;
      expect(value.continuedText, isNot(contains(originalContent)));
    });

    test('write returns AppSuccess with generated text and summary', () async {
      final result = await tool.write(
        projectId: 'project-1',
        chapterId: 'chapter-1',
        instruction: '写一段雨景',
        targetLength: 500,
      );
      expect(result, isA<AppSuccess<AgentGenerateResult>>());
      final value = (result as AppSuccess<AgentGenerateResult>).value;
      expect(value.generatedText, isNotEmpty);
      expect(value.summary, isNotEmpty);
      expect(value.warnings, isEmpty);
      expect(value.usedProvider, 'mock');
      expect(value.usedModel, 'mock');
    });

    test('write respects contextScope parameter', () async {
      final result = await tool.write(
        projectId: 'project-1',
        chapterId: 'chapter-1',
        instruction: 'test',
        targetLength: 500,
        contextScope: ContextScope.fullProject,
      );
      final value = (result as AppSuccess<AgentGenerateResult>).value;
      expect(value.generatedText, contains('fullProject'));
    });

    test('rewrite returns AppSuccess with revised text and change summary',
        () async {
      final result = await tool.rewrite(
        selectedText: '旧文本',
        instruction: '改为更正式的语气',
      );
      expect(result, isA<AppSuccess<AgentRewriteResult>>());
      final value = (result as AppSuccess<AgentRewriteResult>).value;
      expect(value.revisedText, isNotEmpty);
      expect(value.changeSummary, isNotEmpty);
      expect(value.revisedText, contains('旧文本'));
    });

    test('rewrite with styleProfile includes it in output', () async {
      final result = await tool.rewrite(
        selectedText: '文本',
        instruction: '改写',
        styleProfile: '古典风格',
      );
      final value = (result as AppSuccess<AgentRewriteResult>).value;
      expect(value.revisedText, isNotEmpty);
    });

    test('expand returns AppSuccess with expanded text and additions summary',
        () async {
      final result = await tool.expand(
        selectedText: '简短的描述',
        targetLength: 1200,
      );
      expect(result, isA<AppSuccess<AgentExpandResult>>());
      final value = (result as AppSuccess<AgentExpandResult>).value;
      expect(value.expandedText, isNotEmpty);
      expect(value.additionsSummary, isNotEmpty);
    });

    test('expand with focus includes it in output', () async {
      final result = await tool.expand(
        selectedText: '文本',
        targetLength: 1200,
        focus: '环境描写',
      );
      final value = (result as AppSuccess<AgentExpandResult>).value;
      expect(value.additionsSummary, contains('环境描写'));
    });

    test(
        'condense returns AppSuccess with condensed text and removed points',
        () async {
      final result = await tool.condense(
        selectedText: '冗长的文本',
        targetLength: 400,
      );
      expect(result, isA<AppSuccess<AgentCondenseResult>>());
      final value = (result as AppSuccess<AgentCondenseResult>).value;
      expect(value.condensedText, isNotEmpty);
      expect(value.removedPoints, isNotEmpty);
    });

    test('condense with keepPoints respects the parameter', () async {
      final result = await tool.condense(
        selectedText: '文本',
        targetLength: 400,
        keepPoints: <String>['关键要点1', '关键要点2'],
      );
      final value = (result as AppSuccess<AgentCondenseResult>).value;
      expect(value.condensedText, isNotEmpty);
    });

    test('polish returns AppSuccess with polished text and style notes',
        () async {
      final result = await tool.polish(
        selectedText: '粗糙的文本',
        styleGoal: '更加文学化',
      );
      expect(result, isA<AppSuccess<AgentPolishResult>>());
      final value = (result as AppSuccess<AgentPolishResult>).value;
      expect(value.polishedText, isNotEmpty);
      expect(value.styleNotes, isNotEmpty);
      expect(value.styleNotes, contains('更加文学化'));
    });

    test('polish with custom strictness', () async {
      final result = await tool.polish(
        selectedText: '文本',
        styleGoal: '简洁',
        strictness: 0.3,
      );
      final value = (result as AppSuccess<AgentPolishResult>).value;
      expect(value.polishedText, isNotEmpty);
      expect(value.styleNotes, contains('0.3'));
    });
  });
}
