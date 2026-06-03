enum AgentTaskStatus {
  created,
  queued,
  running,
  succeeded,
  failed,
  cancelled;

  bool canTransitionTo(AgentTaskStatus target) => switch (this) {
    AgentTaskStatus.created => target == AgentTaskStatus.queued,
    AgentTaskStatus.queued =>
      target == AgentTaskStatus.running ||
          target == AgentTaskStatus.cancelled,
    AgentTaskStatus.running =>
      target == AgentTaskStatus.succeeded ||
          target == AgentTaskStatus.failed ||
          target == AgentTaskStatus.cancelled,
    AgentTaskStatus.succeeded => false,
    AgentTaskStatus.failed => false,
    AgentTaskStatus.cancelled => false,
  };

  bool get isTerminal =>
      this == AgentTaskStatus.succeeded ||
      this == AgentTaskStatus.failed ||
      this == AgentTaskStatus.cancelled;
}
