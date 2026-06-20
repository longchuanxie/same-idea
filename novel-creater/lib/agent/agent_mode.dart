import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';

enum AgentMode {
  brainstorm,
  writing,
  revision,
  knowledge,
  review,
}

class AgentContext {
  const AgentContext({
    this.projectId,
    this.chapterId,
    this.selectedText,
    this.manualMode,
    this.characters = const [],
    this.settingEntries = const [],
    this.notes = const [],
  });

  final String? projectId;
  final String? chapterId;
  final String? selectedText;
  final AgentMode? manualMode;
  final List<Character> characters;
  final List<SettingEntry> settingEntries;
  final List<Note> notes;
}
