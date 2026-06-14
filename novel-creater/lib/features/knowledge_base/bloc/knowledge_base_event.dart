import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_state.dart';

sealed class KnowledgeBaseEvent {
  const KnowledgeBaseEvent();
}

final class KnowledgeBaseLoaded extends KnowledgeBaseEvent {
  const KnowledgeBaseLoaded(this.projectId);

  final String projectId;
}

final class CharacterCreated extends KnowledgeBaseEvent {
  const CharacterCreated(this.character);

  final Character character;
}

final class CharacterUpdated extends KnowledgeBaseEvent {
  const CharacterUpdated(this.character);

  final Character character;
}

final class CharacterDeleted extends KnowledgeBaseEvent {
  const CharacterDeleted(this.id);

  final String id;
}

final class SettingEntryCreated extends KnowledgeBaseEvent {
  const SettingEntryCreated(this.entry);

  final SettingEntry entry;
}

final class SettingEntryUpdated extends KnowledgeBaseEvent {
  const SettingEntryUpdated(this.entry);

  final SettingEntry entry;
}

final class SettingEntryDeleted extends KnowledgeBaseEvent {
  const SettingEntryDeleted(this.id);

  final String id;
}

final class NoteCreated extends KnowledgeBaseEvent {
  const NoteCreated(this.note);

  final Note note;
}

final class NoteUpdated extends KnowledgeBaseEvent {
  const NoteUpdated(this.note);

  final Note note;
}

final class NoteDeleted extends KnowledgeBaseEvent {
  const NoteDeleted(this.id);

  final String id;
}

final class TabChanged extends KnowledgeBaseEvent {
  const TabChanged(this.tab);

  final KnowledgeBaseTab tab;
}
