import 'package:freezed_annotation/freezed_annotation.dart';

part 'domain_event.freezed.dart';

@Freezed(toJson: false, fromJson: false)
sealed class DomainEvent with _$DomainEvent {
  const factory DomainEvent.projectCreated({
    required String projectId,
    required DateTime occurredAt,
  }) = ProjectCreated;

  const factory DomainEvent.chapterContentChanged({
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = ChapterContentChanged;

  const factory DomainEvent.revisionCreated({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionCreated;

  const factory DomainEvent.revisionAccepted({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionAccepted;

  const factory DomainEvent.revisionRejected({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionRejected;

  const factory DomainEvent.characterUpdated({
    required String characterId,
    required String projectId,
    required DateTime occurredAt,
  }) = CharacterUpdated;

  const factory DomainEvent.noteCreated({
    required String noteId,
    required String projectId,
    required DateTime occurredAt,
  }) = NoteCreated;

  const factory DomainEvent.agentTaskStarted({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskStarted;

  const factory DomainEvent.agentTaskCompleted({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskCompleted;

  const factory DomainEvent.agentTaskFailed({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskFailed;

  const factory DomainEvent.snapshotCreated({
    required String snapshotId,
    required String projectId,
    required DateTime occurredAt,
  }) = SnapshotCreated;

  const factory DomainEvent.exportCompleted({
    required String projectId,
    required String format,
    required DateTime occurredAt,
  }) = ExportCompleted;
}
