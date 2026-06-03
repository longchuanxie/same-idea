import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/session_stage.dart';

part 'session.freezed.dart';
part 'session.g.dart';

@Freezed(toJson: true, fromJson: true)
class SessionMessage with _$SessionMessage {
  const factory SessionMessage({
    required String id,
    required String role,
    required String content,
    DateTime? createdAt,
    String? agentTaskId,
  }) = _SessionMessage;

  factory SessionMessage.fromJson(Map<String, dynamic> json) =>
      _$SessionMessageFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class Session with _$Session {
  const factory Session({
    required String id,
    required String projectId,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(SessionStage.writing) SessionStage stage,
    String? parentSessionId,
    String? branchName,
    @Default([]) List<SessionMessage> messages,
    String? contextSnapshotId,
    @Default(false) bool archived,
    @Default(1) int schemaVersion,
  }) = _Session;

  factory Session.fromJson(Map<String, dynamic> json) =>
      _$SessionFromJson(json);
}
