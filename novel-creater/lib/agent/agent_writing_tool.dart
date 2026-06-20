import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/agent/cancellation_token.dart';
import 'package:novel_creator/domain/results/app_result.dart';

part 'agent_writing_tool.freezed.dart';
part 'agent_writing_tool.g.dart';

// --- Result types for each writing tool ---

@freezed
class AgentContinueWriteResult with _$AgentContinueWriteResult {
  const factory AgentContinueWriteResult({
    required String continuedText,
    required String stopReason,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentContinueWriteResult;

  factory AgentContinueWriteResult.fromJson(Map<String, dynamic> json) =>
      _$AgentContinueWriteResultFromJson(json);
}

@freezed
class AgentGenerateResult with _$AgentGenerateResult {
  const factory AgentGenerateResult({
    required String generatedText,
    required String summary,
    @Default(<String>[]) List<String> warnings,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentGenerateResult;

  factory AgentGenerateResult.fromJson(Map<String, dynamic> json) =>
      _$AgentGenerateResultFromJson(json);
}

@freezed
class AgentRewriteResult with _$AgentRewriteResult {
  const factory AgentRewriteResult({
    required String revisedText,
    required String changeSummary,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentRewriteResult;

  factory AgentRewriteResult.fromJson(Map<String, dynamic> json) =>
      _$AgentRewriteResultFromJson(json);
}

@freezed
class AgentExpandResult with _$AgentExpandResult {
  const factory AgentExpandResult({
    required String expandedText,
    required String additionsSummary,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentExpandResult;

  factory AgentExpandResult.fromJson(Map<String, dynamic> json) =>
      _$AgentExpandResultFromJson(json);
}

@freezed
class AgentCondenseResult with _$AgentCondenseResult {
  const factory AgentCondenseResult({
    required String condensedText,
    @Default(<String>[]) List<String> removedPoints,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentCondenseResult;

  factory AgentCondenseResult.fromJson(Map<String, dynamic> json) =>
      _$AgentCondenseResultFromJson(json);
}

@freezed
class AgentPolishResult with _$AgentPolishResult {
  const factory AgentPolishResult({
    required String polishedText,
    required String styleNotes,
    required double temperature,
    String? usedProvider,
    String? usedModel,
  }) = _AgentPolishResult;

  factory AgentPolishResult.fromJson(Map<String, dynamic> json) =>
      _$AgentPolishResultFromJson(json);
}

// --- Context scope for write tool ---

enum ContextScope {
  chapterOnly,
  chapterAndOutline,
  fullProject,
}

// --- Abstract interface ---

abstract interface class AgentWritingTool {
  Future<AppResult<AgentContinueWriteResult>> continueWrite({
    required String chapterId,
    required String cursorContext,
    required int targetLength,
    CancellationToken? cancellationToken,
  });

  Future<AppResult<AgentGenerateResult>> write({
    required String projectId,
    required String chapterId,
    required String instruction,
    required int targetLength,
    ContextScope contextScope = ContextScope.chapterOnly,
    CancellationToken? cancellationToken,
  });

  Future<AppResult<AgentRewriteResult>> rewrite({
    required String selectedText,
    required String instruction,
    String? styleProfile,
    CancellationToken? cancellationToken,
  });

  Future<AppResult<AgentExpandResult>> expand({
    required String selectedText,
    required int targetLength,
    String? focus,
    CancellationToken? cancellationToken,
  });

  Future<AppResult<AgentCondenseResult>> condense({
    required String selectedText,
    required int targetLength,
    List<String>? keepPoints,
    CancellationToken? cancellationToken,
  });

  Future<AppResult<AgentPolishResult>> polish({
    required String selectedText,
    required String styleGoal,
    double strictness = 0.7,
    CancellationToken? cancellationToken,
  });
}
