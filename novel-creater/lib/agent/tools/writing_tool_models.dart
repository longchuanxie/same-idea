import 'package:novel_creator/domain/domain.dart';

enum WritingToolId {
  write,
  continueWrite,
  rewrite,
  expand,
  condense,
  polish,
}

enum WritingToolPermission {
  suggestionOnly,
  pendingRevision,
}

class WritingToolDescriptor {
  const WritingToolDescriptor({
    required this.id,
    required this.displayName,
    required this.permission,
  });

  final WritingToolId id;
  final String displayName;
  final WritingToolPermission permission;
}

class WritingToolExecution<T> {
  const WritingToolExecution.structured(this.output)
      : plainSuggestion = null,
        error = null;

  const WritingToolExecution.plainSuggestion(this.plainSuggestion)
      : output = null,
        error = null;

  const WritingToolExecution.failure(this.error)
      : output = null,
        plainSuggestion = null;

  final T? output;
  final String? plainSuggestion;
  final AppError? error;

  bool get isStructured => output != null;
  bool get isPlainSuggestion => plainSuggestion != null;
  bool get isFailure => error != null;
}

class WritingRevisionSuggestion {
  const WritingRevisionSuggestion({
    required this.chapterId,
    required this.operation,
    required this.anchor,
    required this.beforeText,
    required this.afterText,
    required this.metadata,
  });

  final String chapterId;
  final RevisionOperation operation;
  final RevisionAnchor anchor;
  final String beforeText;
  final String afterText;
  final RevisionPatchMetadata metadata;
}

class WriteInput {
  const WriteInput({
    required this.projectId,
    required this.chapterId,
    required this.instruction,
    required this.targetLength,
    this.contextScope = 'chapter',
  });

  final String projectId;
  final String chapterId;
  final String instruction;
  final int targetLength;
  final String contextScope;
}

class WriteOutput {
  const WriteOutput({
    required this.generatedText,
    required this.summary,
    this.warnings = const [],
  });

  final String generatedText;
  final String summary;
  final List<String> warnings;
}

class ContinueWriteInput {
  const ContinueWriteInput({
    required this.projectId,
    required this.chapterId,
    required this.cursorContext,
    required this.targetLength,
    required this.anchor,
  });

  final String projectId;
  final String chapterId;
  final String cursorContext;
  final int targetLength;
  final RevisionAnchor anchor;
}

class ContinueWriteOutput {
  const ContinueWriteOutput({
    required this.continuedText,
    required this.stopReason,
    this.suggestedRevisionPatch,
  });

  final String continuedText;
  final String stopReason;
  final WritingRevisionSuggestion? suggestedRevisionPatch;
}

class RewriteInput {
  const RewriteInput({
    required this.projectId,
    required this.chapterId,
    required this.selectedText,
    required this.instruction,
    required this.anchor,
    this.styleProfile = '',
  });

  final String projectId;
  final String chapterId;
  final String selectedText;
  final String instruction;
  final RevisionAnchor anchor;
  final String styleProfile;
}

class RewriteOutput {
  const RewriteOutput({
    required this.revisedText,
    required this.changeSummary,
    this.warnings = const [],
    this.suggestedRevisionPatch,
  });

  final String revisedText;
  final String changeSummary;
  final List<String> warnings;
  final WritingRevisionSuggestion? suggestedRevisionPatch;
}

class ExpandInput {
  const ExpandInput({
    required this.projectId,
    required this.chapterId,
    required this.selectedText,
    required this.targetLength,
    required this.focus,
    required this.anchor,
  });

  final String projectId;
  final String chapterId;
  final String selectedText;
  final int targetLength;
  final String focus;
  final RevisionAnchor anchor;
}

class ExpandOutput {
  const ExpandOutput({
    required this.expandedText,
    required this.additionsSummary,
    this.warnings = const [],
    this.suggestedRevisionPatch,
  });

  final String expandedText;
  final String additionsSummary;
  final List<String> warnings;
  final WritingRevisionSuggestion? suggestedRevisionPatch;
}

class CondenseInput {
  const CondenseInput({
    required this.projectId,
    required this.chapterId,
    required this.selectedText,
    required this.targetLength,
    required this.keepPoints,
    required this.anchor,
  });

  final String projectId;
  final String chapterId;
  final String selectedText;
  final int targetLength;
  final List<String> keepPoints;
  final RevisionAnchor anchor;
}

class CondenseOutput {
  const CondenseOutput({
    required this.condensedText,
    required this.removedPoints,
    this.warnings = const [],
    this.suggestedRevisionPatch,
  });

  final String condensedText;
  final List<String> removedPoints;
  final List<String> warnings;
  final WritingRevisionSuggestion? suggestedRevisionPatch;
}

class PolishInput {
  const PolishInput({
    required this.projectId,
    required this.chapterId,
    required this.selectedText,
    required this.styleGoal,
    required this.strictness,
    required this.anchor,
  });

  final String projectId;
  final String chapterId;
  final String selectedText;
  final String styleGoal;
  final int strictness;
  final RevisionAnchor anchor;
}

class PolishOutput {
  const PolishOutput({
    required this.polishedText,
    required this.styleNotes,
    this.warnings = const [],
    this.suggestedRevisionPatch,
  });

  final String polishedText;
  final String styleNotes;
  final List<String> warnings;
  final WritingRevisionSuggestion? suggestedRevisionPatch;
}
