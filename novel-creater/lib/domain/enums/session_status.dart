/// Session status following the state machine:
///
/// ```
/// active → paused → active (resume)
/// active → completed
/// paused → completed
/// active → archived
/// paused → archived
/// completed → archived
/// ```
enum SessionStatus {
  active,
  paused,
  completed,
  archived,
}
