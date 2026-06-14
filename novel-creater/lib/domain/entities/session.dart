import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/session_status.dart';

part 'session.freezed.dart';
part 'session.g.dart';

/// Valid state transitions for Session.
///
/// ```
/// active → paused → active (resume)
/// active → completed
/// paused → completed
/// active → archived
/// paused → archived
/// completed → archived
/// ```
///
/// Terminal state: archived.
const Map<SessionStatus, Set<SessionStatus>> _validTransitions =
    <SessionStatus, Set<SessionStatus>>{
  SessionStatus.active: <SessionStatus>{
    SessionStatus.paused,
    SessionStatus.completed,
    SessionStatus.archived,
  },
  SessionStatus.paused: <SessionStatus>{
    SessionStatus.active,
    SessionStatus.completed,
    SessionStatus.archived,
  },
  SessionStatus.completed: <SessionStatus>{
    SessionStatus.archived,
  },
  SessionStatus.archived: <SessionStatus>{},
};

/// Checks whether transitioning from [from] to [to] is valid.
bool isValidSessionTransition(SessionStatus from, SessionStatus to) {
  return _validTransitions[from]?.contains(to) ?? false;
}

@freezed
class Session with _$Session {
  const factory Session({
    required String id,
    required String projectId,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(SessionStatus.active) SessionStatus status,
    @Default(1) int schemaVersion,
    String? chapterId,
    String? agentMode,
    String? summary,
    DateTime? startedAt,
    DateTime? endedAt,
  }) = _Session;

  factory Session.fromJson(Map<String, dynamic> json) =>
      _$SessionFromJson(json);

  const Session._();

  /// Whether this session is in a terminal state (no further transitions allowed).
  bool get isTerminal => status == SessionStatus.archived;

  /// Validates that transitioning to [newStatus] is legal.
  /// Returns an error message if invalid, or null if valid.
  String? validateTransition(SessionStatus newStatus) {
    if (status == newStatus) return null;
    if (!isValidSessionTransition(status, newStatus)) {
      return 'Invalid transition from ${status.name} to ${newStatus.name}.';
    }
    return null;
  }
}
