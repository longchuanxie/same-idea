/// AgentTask status following the state machine:
///
/// ```
/// created → queued → running → succeeded
///                          |→ failed
///                          |→ cancelled
/// ```
enum AgentTaskStatus {
  created,
  queued,
  running,
  succeeded,
  failed,
  cancelled,
}
