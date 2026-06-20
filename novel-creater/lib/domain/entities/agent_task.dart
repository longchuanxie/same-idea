import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';

part 'agent_task.freezed.dart';
part 'agent_task.g.dart';

/// Valid state transitions for AgentTask.
///
/// ```
/// created → queued → running → succeeded
///                          |→ failed
///                          |→ cancelled
/// ```
///
/// Terminal states: succeeded, failed, cancelled.
/// Once a task reaches a terminal state, no further transitions are allowed.
const Map<AgentTaskStatus, Set<AgentTaskStatus>> _validTransitions =
    <AgentTaskStatus, Set<AgentTaskStatus>>{
  AgentTaskStatus.created: <AgentTaskStatus>{
    AgentTaskStatus.queued,
  },
  AgentTaskStatus.queued: <AgentTaskStatus>{
    AgentTaskStatus.running,
    AgentTaskStatus.cancelled,
  },
  AgentTaskStatus.running: <AgentTaskStatus>{
    AgentTaskStatus.succeeded,
    AgentTaskStatus.failed,
    AgentTaskStatus.cancelled,
  },
  AgentTaskStatus.succeeded: <AgentTaskStatus>{},
  AgentTaskStatus.failed: <AgentTaskStatus>{},
  AgentTaskStatus.cancelled: <AgentTaskStatus>{},
};

/// Checks whether transitioning from [from] to [to] is valid.
bool isValidAgentTaskTransition(AgentTaskStatus from, AgentTaskStatus to) {
  return _validTransitions[from]?.contains(to) ?? false;
}

@freezed
class AgentTask with _$AgentTask {
  const factory AgentTask({
    required String id,
    required String projectId,
    required String taskType,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(AgentTaskStatus.created) AgentTaskStatus status,
    @Default(1) int schemaVersion,
    String? chapterId,
    String? instruction,
    String? result,
    String? errorMessage,
  }) = _AgentTask;

  factory AgentTask.fromJson(Map<String, dynamic> json) =>
      _$AgentTaskFromJson(json);

  const AgentTask._();

  /// Whether this task is in a terminal state (no further transitions allowed).
  bool get isTerminal => status == AgentTaskStatus.succeeded ||
      status == AgentTaskStatus.failed ||
      status == AgentTaskStatus.cancelled;

  /// Validates that transitioning to [newStatus] is legal.
  /// Returns an error message if invalid, or null if valid.
  String? validateTransition(AgentTaskStatus newStatus) {
    if (status == newStatus) return null;
    if (!isValidAgentTaskTransition(status, newStatus)) {
      return 'Invalid transition from ${status.name} to ${newStatus.name}.';
    }
    return null;
  }
}
