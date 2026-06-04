import 'dart:convert';

import 'package:novel_creator/agent/tools/result_interpreter.dart';
import 'package:novel_creator/agent/tools/writing_tool_models.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/llm/llm.dart';

abstract class WritingTool<I, O> {
  const WritingTool();

  WritingToolId get id;

  Future<WritingToolExecution<O>> execute(I input);
}

abstract class _LlmWritingTool<I, O> extends WritingTool<I, O> {
  const _LlmWritingTool({
    required LlmClient llmClient,
    required LlmProvider provider,
    required ResultInterpreter interpreter,
  })  : _llmClient = llmClient,
        _provider = provider,
        _interpreter = interpreter;

  final LlmClient _llmClient;
  final LlmProvider _provider;
  final ResultInterpreter _interpreter;

  @override
  Future<WritingToolExecution<O>> execute(I input) async {
    final validationError = validate(input);
    if (validationError != null) {
      return WritingToolExecution.failure(validationError);
    }

    final response = await _llmClient.complete(
      LlmRequest(
        provider: _provider,
        messages: [
          const LlmMessage(
            role: LlmMessageRole.system,
            content: 'Return only valid JSON for the requested writing tool.',
          ),
          LlmMessage(role: LlmMessageRole.user, content: prompt(input)),
        ],
      ),
    );
    if (response.isFailure) {
      return WritingToolExecution.failure(response.maybeFailure);
    }

    final content = response.maybeSuccess!.content;
    final json = _interpreter.parseObject(content);
    if (json == null) {
      return WritingToolExecution.plainSuggestion(content);
    }

    try {
      return WritingToolExecution.structured(
        parse(input, json, response.maybeSuccess!),
      );
    } on ToolOutputFormatException catch (error) {
      return WritingToolExecution.failure(error.error);
    }
  }

  AppError? validate(I input);

  String prompt(I input);

  O parse(I input, Map<String, Object?> json, LlmResponse response);

  String requiredString(Map<String, Object?> json, String key) =>
      _interpreter.requiredString(json, key);

  List<String> stringList(Map<String, Object?> json, String key) =>
      _interpreter.stringList(json, key);

  AppError validationError(String message) => AppError(
        code: 'TOOL_INPUT_INVALID',
        message: message,
        userMessage: message,
        source: AppErrorSource.llm,
      );

  WritingRevisionSuggestion replaceSuggestion({
    required String chapterId,
    required RevisionAnchor anchor,
    required String beforeText,
    required String afterText,
    required String prompt,
    required LlmResponse response,
    required String summary,
  }) =>
      WritingRevisionSuggestion(
        chapterId: chapterId,
        operation: RevisionOperation.replace,
        anchor: anchor,
        beforeText: beforeText,
        afterText: afterText,
        metadata: RevisionPatchMetadata(
          prompt: prompt,
          model: response.model,
          summary: summary,
        ),
      );

  WritingRevisionSuggestion insertSuggestion({
    required String chapterId,
    required RevisionAnchor anchor,
    required String afterText,
    required String prompt,
    required LlmResponse response,
    required String summary,
  }) =>
      WritingRevisionSuggestion(
        chapterId: chapterId,
        operation: RevisionOperation.insert,
        anchor: anchor,
        beforeText: '',
        afterText: afterText,
        metadata: RevisionPatchMetadata(
          prompt: prompt,
          model: response.model,
          summary: summary,
        ),
      );
}

class WriteTool extends _LlmWritingTool<WriteInput, WriteOutput> {
  const WriteTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.write;

  @override
  AppError? validate(WriteInput input) {
    if (input.instruction.trim().isEmpty) {
      return validationError('Instruction is required.');
    }
    if (input.targetLength <= 0) {
      return validationError('Target length must be greater than zero.');
    }
    return null;
  }

  @override
  String prompt(WriteInput input) => jsonEncode({
        'tool': 'write',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'instruction': input.instruction,
        'targetLength': input.targetLength,
        'contextScope': input.contextScope,
        'outputSchema': ['generatedText', 'summary', 'warnings'],
      });

  @override
  WriteOutput parse(
    WriteInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) =>
      WriteOutput(
        generatedText: requiredString(json, 'generatedText'),
        summary: requiredString(json, 'summary'),
        warnings: stringList(json, 'warnings'),
      );
}

class ContinueWriteTool
    extends _LlmWritingTool<ContinueWriteInput, ContinueWriteOutput> {
  const ContinueWriteTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.continueWrite;

  @override
  AppError? validate(ContinueWriteInput input) {
    if (input.cursorContext.trim().isEmpty) {
      return validationError('Cursor context is required.');
    }
    if (input.targetLength <= 0) {
      return validationError('Target length must be greater than zero.');
    }
    return null;
  }

  @override
  String prompt(ContinueWriteInput input) => jsonEncode({
        'tool': 'continue_write',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'cursorContext': input.cursorContext,
        'targetLength': input.targetLength,
        'outputSchema': ['continuedText', 'stopReason'],
      });

  @override
  ContinueWriteOutput parse(
    ContinueWriteInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) {
    final text = requiredString(json, 'continuedText');
    final stopReason = requiredString(json, 'stopReason');
    return ContinueWriteOutput(
      continuedText: text,
      stopReason: stopReason,
      suggestedRevisionPatch: insertSuggestion(
        chapterId: input.chapterId,
        anchor: input.anchor,
        afterText: text,
        prompt: prompt(input),
        response: response,
        summary: stopReason,
      ),
    );
  }
}

class RewriteTool extends _LlmWritingTool<RewriteInput, RewriteOutput> {
  const RewriteTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.rewrite;

  @override
  AppError? validate(RewriteInput input) {
    if (input.selectedText.trim().isEmpty) {
      return validationError('Selected text is required.');
    }
    if (input.instruction.trim().isEmpty) {
      return validationError('Instruction is required.');
    }
    return null;
  }

  @override
  String prompt(RewriteInput input) => jsonEncode({
        'tool': 'rewrite',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'selectedText': input.selectedText,
        'instruction': input.instruction,
        'styleProfile': input.styleProfile,
        'outputSchema': ['revisedText', 'changeSummary', 'warnings'],
      });

  @override
  RewriteOutput parse(
    RewriteInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) {
    final text = requiredString(json, 'revisedText');
    final summary = requiredString(json, 'changeSummary');
    return RewriteOutput(
      revisedText: text,
      changeSummary: summary,
      warnings: stringList(json, 'warnings'),
      suggestedRevisionPatch: replaceSuggestion(
        chapterId: input.chapterId,
        anchor: input.anchor,
        beforeText: input.selectedText,
        afterText: text,
        prompt: prompt(input),
        response: response,
        summary: summary,
      ),
    );
  }
}

class ExpandTool extends _LlmWritingTool<ExpandInput, ExpandOutput> {
  const ExpandTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.expand;

  @override
  AppError? validate(ExpandInput input) {
    if (input.selectedText.trim().isEmpty) {
      return validationError('Selected text is required.');
    }
    if (input.targetLength <= input.selectedText.length) {
      return validationError('Target length must exceed selected text length.');
    }
    return null;
  }

  @override
  String prompt(ExpandInput input) => jsonEncode({
        'tool': 'expand',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'selectedText': input.selectedText,
        'targetLength': input.targetLength,
        'focus': input.focus,
        'outputSchema': ['expandedText', 'additionsSummary', 'warnings'],
      });

  @override
  ExpandOutput parse(
    ExpandInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) {
    final text = requiredString(json, 'expandedText');
    final summary = requiredString(json, 'additionsSummary');
    return ExpandOutput(
      expandedText: text,
      additionsSummary: summary,
      warnings: stringList(json, 'warnings'),
      suggestedRevisionPatch: replaceSuggestion(
        chapterId: input.chapterId,
        anchor: input.anchor,
        beforeText: input.selectedText,
        afterText: text,
        prompt: prompt(input),
        response: response,
        summary: summary,
      ),
    );
  }
}

class CondenseTool extends _LlmWritingTool<CondenseInput, CondenseOutput> {
  const CondenseTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.condense;

  @override
  AppError? validate(CondenseInput input) {
    if (input.selectedText.trim().isEmpty) {
      return validationError('Selected text is required.');
    }
    if (input.targetLength <= 0) {
      return validationError('Target length must be greater than zero.');
    }
    return null;
  }

  @override
  String prompt(CondenseInput input) => jsonEncode({
        'tool': 'condense',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'selectedText': input.selectedText,
        'targetLength': input.targetLength,
        'keepPoints': input.keepPoints,
        'outputSchema': ['condensedText', 'removedPoints', 'warnings'],
      });

  @override
  CondenseOutput parse(
    CondenseInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) {
    final text = requiredString(json, 'condensedText');
    final removed = stringList(json, 'removedPoints');
    return CondenseOutput(
      condensedText: text,
      removedPoints: removed,
      warnings: stringList(json, 'warnings'),
      suggestedRevisionPatch: replaceSuggestion(
        chapterId: input.chapterId,
        anchor: input.anchor,
        beforeText: input.selectedText,
        afterText: text,
        prompt: prompt(input),
        response: response,
        summary: removed.join('; '),
      ),
    );
  }
}

class PolishTool extends _LlmWritingTool<PolishInput, PolishOutput> {
  const PolishTool({
    required super.llmClient,
    required super.provider,
    required super.interpreter,
  });

  @override
  WritingToolId get id => WritingToolId.polish;

  @override
  AppError? validate(PolishInput input) {
    if (input.selectedText.trim().isEmpty) {
      return validationError('Selected text is required.');
    }
    if (input.strictness < 1 || input.strictness > 5) {
      return validationError('Strictness must be between 1 and 5.');
    }
    return null;
  }

  @override
  String prompt(PolishInput input) => jsonEncode({
        'tool': 'polish',
        'projectId': input.projectId,
        'chapterId': input.chapterId,
        'selectedText': input.selectedText,
        'styleGoal': input.styleGoal,
        'strictness': input.strictness,
        'outputSchema': ['polishedText', 'styleNotes', 'warnings'],
      });

  @override
  PolishOutput parse(
    PolishInput input,
    Map<String, Object?> json,
    LlmResponse response,
  ) {
    final text = requiredString(json, 'polishedText');
    final notes = requiredString(json, 'styleNotes');
    return PolishOutput(
      polishedText: text,
      styleNotes: notes,
      warnings: stringList(json, 'warnings'),
      suggestedRevisionPatch: replaceSuggestion(
        chapterId: input.chapterId,
        anchor: input.anchor,
        beforeText: input.selectedText,
        afterText: text,
        prompt: prompt(input),
        response: response,
        summary: notes,
      ),
    );
  }
}
