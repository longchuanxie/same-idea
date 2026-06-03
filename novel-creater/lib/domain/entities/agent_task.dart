import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/domain/enums/agent_task_type.dart';

part 'agent_task.freezed.dart';
part 'agent_task.g.dart';

@Freezed(toJson: true, fromJson: true)
class TokenUsage with _$TokenUsage {
  const factory TokenUsage({
    @Default(0) int promptTokens,
    @Default(0) int completionTokens,
    @Default(false) bool isEstimated,
  }) = _TokenUsage;

  factory TokenUsage.fromJson(Map<String, dynamic> json) =>
      _$TokenUsageFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class AgentTask with _$AgentTask {
  const AgentTask._();

  const factory AgentTask({
    required String id,
    required String projectId,
    required AgentTaskType taskType,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(AgentTaskStatus.created) AgentTaskStatus status,
    @Default('') String inputJson,
    @Default('') String outputJson,
    String? model,
    TokenUsage? tokenUsage,
    String? error,
    @Default([]) List<String> sideEffects,
    DateTime? startedAt,
    DateTime? completedAt,
    @Default(1) int schemaVersion,
  }) = _AgentTask;

  factory AgentTask.fromJson(Map<String, dynamic> json) =>
      _$AgentTaskFromJson(json);

  bool get isTerminal => status.isTerminal;
}
