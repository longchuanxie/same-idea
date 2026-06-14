/// Cross-module domain events for decoupling.
/// Events describe facts only; they do not execute business logic.
sealed class DomainEvent {
  const DomainEvent({required this.projectId});

  final String projectId;
}

// Project events
final class ProjectCreated extends DomainEvent {
  const ProjectCreated({required super.projectId, required this.projectName});
  final String projectName;
}

// Chapter events
final class ChapterContentChanged extends DomainEvent {
  const ChapterContentChanged({
    required super.projectId,
    required this.chapterId,
    required this.chapterTitle,
  });
  final String chapterId;
  final String chapterTitle;
}

// Revision events
final class RevisionCreated extends DomainEvent {
  const RevisionCreated({
    required super.projectId,
    required this.revisionId,
    required this.chapterId,
  });
  final String revisionId;
  final String chapterId;
}

final class RevisionAccepted extends DomainEvent {
  const RevisionAccepted({
    required super.projectId,
    required this.revisionId,
    required this.chapterId,
  });
  final String revisionId;
  final String chapterId;
}

final class RevisionRejected extends DomainEvent {
  const RevisionRejected({
    required super.projectId,
    required this.revisionId,
    required this.chapterId,
  });
  final String revisionId;
  final String chapterId;
}

// Knowledge base events
final class CharacterUpdated extends DomainEvent {
  const CharacterUpdated({
    required super.projectId,
    required this.characterId,
    required this.characterName,
  });
  final String characterId;
  final String characterName;
}

final class NoteCreated extends DomainEvent {
  const NoteCreated({
    required super.projectId,
    required this.noteId,
    required this.noteTitle,
  });
  final String noteId;
  final String noteTitle;
}

// Agent events
final class AgentTaskStarted extends DomainEvent {
  const AgentTaskStarted({
    required super.projectId,
    required this.taskId,
    required this.taskType,
  });
  final String taskId;
  final String taskType;
}

final class AgentTaskCompleted extends DomainEvent {
  const AgentTaskCompleted({
    required super.projectId,
    required this.taskId,
    required this.taskType,
  });
  final String taskId;
  final String taskType;
}

final class AgentTaskFailed extends DomainEvent {
  const AgentTaskFailed({
    required super.projectId,
    required this.taskId,
    required this.taskType,
    required this.errorMessage,
  });
  final String taskId;
  final String taskType;
  final String errorMessage;
}

// Session events
final class SessionCreated extends DomainEvent {
  const SessionCreated({
    required super.projectId,
    required this.sessionId,
    required this.sessionTitle,
  });
  final String sessionId;
  final String sessionTitle;
}

// Snapshot events
final class SnapshotCreated extends DomainEvent {
  const SnapshotCreated({
    required super.projectId,
    required this.snapshotId,
  });
  final String snapshotId;
}

// Export events
final class ExportCompleted extends DomainEvent {
  const ExportCompleted({
    required super.projectId,
    required this.format,
    required this.filePath,
  });
  final String format;
  final String filePath;
}
