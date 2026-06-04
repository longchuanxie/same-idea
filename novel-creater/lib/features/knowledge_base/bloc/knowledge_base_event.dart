part of 'knowledge_base_bloc.dart';

sealed class KnowledgeBaseEvent extends Equatable {
  const KnowledgeBaseEvent();

  @override
  List<Object?> get props => [];
}

final class KnowledgeBaseStarted extends KnowledgeBaseEvent {
  const KnowledgeBaseStarted({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

final class KnowledgeBaseQueryChanged extends KnowledgeBaseEvent {
  const KnowledgeBaseQueryChanged({required this.query});

  final String query;

  @override
  List<Object?> get props => [query];
}

final class KnowledgeCharacterCreated extends KnowledgeBaseEvent {
  const KnowledgeCharacterCreated({
    required this.name,
    this.description = '',
    this.tags = '',
  });

  final String name;
  final String description;
  final String tags;

  @override
  List<Object?> get props => [name, description, tags];
}

final class KnowledgeCharacterUpdated extends KnowledgeBaseEvent {
  const KnowledgeCharacterUpdated({
    required this.character,
    required this.name,
    this.description = '',
    this.tags = '',
  });

  final Character character;
  final String name;
  final String description;
  final String tags;

  @override
  List<Object?> get props => [character, name, description, tags];
}

final class KnowledgeCharacterDeleted extends KnowledgeBaseEvent {
  const KnowledgeCharacterDeleted({required this.characterId});

  final String characterId;

  @override
  List<Object?> get props => [characterId];
}

final class KnowledgeNoteCreated extends KnowledgeBaseEvent {
  const KnowledgeNoteCreated({
    required this.title,
    this.content = '',
    this.type = NoteType.idea,
    this.sourceUrl = '',
    this.tags = '',
  });

  final String title;
  final String content;
  final NoteType type;
  final String sourceUrl;
  final String tags;

  @override
  List<Object?> get props => [title, content, type, sourceUrl, tags];
}

final class KnowledgeNoteUpdated extends KnowledgeBaseEvent {
  const KnowledgeNoteUpdated({
    required this.note,
    required this.title,
    this.content = '',
    this.type = NoteType.idea,
    this.sourceUrl = '',
    this.tags = '',
  });

  final Note note;
  final String title;
  final String content;
  final NoteType type;
  final String sourceUrl;
  final String tags;

  @override
  List<Object?> get props => [note, title, content, type, sourceUrl, tags];
}

final class KnowledgeNoteDeleted extends KnowledgeBaseEvent {
  const KnowledgeNoteDeleted({required this.noteId});

  final String noteId;

  @override
  List<Object?> get props => [noteId];
}

final class KnowledgeSettingEntryCreated extends KnowledgeBaseEvent {
  const KnowledgeSettingEntryCreated({
    required this.category,
    required this.title,
    this.content = '',
    this.tags = '',
  });

  final String category;
  final String title;
  final String content;
  final String tags;

  @override
  List<Object?> get props => [category, title, content, tags];
}

final class KnowledgeSettingEntryUpdated extends KnowledgeBaseEvent {
  const KnowledgeSettingEntryUpdated({
    required this.entry,
    required this.category,
    required this.title,
    this.content = '',
    this.tags = '',
  });

  final SettingEntry entry;
  final String category;
  final String title;
  final String content;
  final String tags;

  @override
  List<Object?> get props => [entry, category, title, content, tags];
}

final class KnowledgeSettingEntryDeleted extends KnowledgeBaseEvent {
  const KnowledgeSettingEntryDeleted({required this.entryId});

  final String entryId;

  @override
  List<Object?> get props => [entryId];
}

final class KnowledgeOutlineNodeCreated extends KnowledgeBaseEvent {
  const KnowledgeOutlineNodeCreated({
    required this.title,
    this.summary = '',
    this.nodeType = OutlineNodeType.chapter,
    this.status = OutlineNodeStatus.planned,
  });

  final String title;
  final String summary;
  final OutlineNodeType nodeType;
  final OutlineNodeStatus status;

  @override
  List<Object?> get props => [title, summary, nodeType, status];
}

final class KnowledgeOutlineNodeUpdated extends KnowledgeBaseEvent {
  const KnowledgeOutlineNodeUpdated({
    required this.node,
    required this.title,
    this.summary = '',
    this.nodeType = OutlineNodeType.chapter,
    this.status = OutlineNodeStatus.planned,
  });

  final OutlineNode node;
  final String title;
  final String summary;
  final OutlineNodeType nodeType;
  final OutlineNodeStatus status;

  @override
  List<Object?> get props => [node, title, summary, nodeType, status];
}

final class KnowledgeOutlineNodeDeleted extends KnowledgeBaseEvent {
  const KnowledgeOutlineNodeDeleted({required this.nodeId});

  final String nodeId;

  @override
  List<Object?> get props => [nodeId];
}
