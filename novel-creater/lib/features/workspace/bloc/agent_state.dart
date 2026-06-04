part of 'agent_bloc.dart';

class AgentState extends Equatable {
  const AgentState({
    this.projectId,
    this.session,
    this.tasks = const [],
    this.mode = 'writing',
    this.isLoading = false,
    this.isRunning = false,
    this.activeTaskId,
    this.error,
  });

  final String? projectId;
  final Session? session;
  final List<AgentTask> tasks;
  final String mode;
  final bool isLoading;
  final bool isRunning;
  final String? activeTaskId;
  final String? error;

  List<SessionMessage> get messages => session?.messages ?? const [];

  AgentTask? get activeTask => activeTaskId == null
      ? null
      : tasks.where((task) => task.id == activeTaskId).firstOrNull;

  AgentState copyWith({
    String? projectId,
    Session? session,
    List<AgentTask>? tasks,
    String? mode,
    bool? isLoading,
    bool? isRunning,
    String? activeTaskId,
    bool clearActiveTaskId = false,
    String? error,
    bool clearError = false,
  }) =>
      AgentState(
        projectId: projectId ?? this.projectId,
        session: session ?? this.session,
        tasks: tasks ?? this.tasks,
        mode: mode ?? this.mode,
        isLoading: isLoading ?? this.isLoading,
        isRunning: isRunning ?? this.isRunning,
        activeTaskId:
            clearActiveTaskId ? null : activeTaskId ?? this.activeTaskId,
        error: clearError ? null : error ?? this.error,
      );

  @override
  List<Object?> get props => [
        projectId,
        session,
        tasks,
        mode,
        isLoading,
        isRunning,
        activeTaskId,
        error,
      ];
}
