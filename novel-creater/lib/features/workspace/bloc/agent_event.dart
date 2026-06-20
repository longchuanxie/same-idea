part of 'agent_bloc.dart';

sealed class AgentEvent extends Equatable {
  const AgentEvent();

  @override
  List<Object?> get props => [];
}

class AgentStarted extends AgentEvent {
  const AgentStarted({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

class AgentModeChanged extends AgentEvent {
  const AgentModeChanged({required this.mode});

  final String mode;

  @override
  List<Object?> get props => [mode];
}

class AgentMessageSubmitted extends AgentEvent {
  const AgentMessageSubmitted({required this.content});

  final String content;

  @override
  List<Object?> get props => [content];
}

class AgentTaskCancelRequested extends AgentEvent {
  const AgentTaskCancelRequested();
}
