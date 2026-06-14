import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/results/app_error.dart';

enum KnowledgeBaseTab { characters, settings, notes }

final class KnowledgeBaseState {
  const KnowledgeBaseState({
    required this.isLoading,
    required this.characters,
    required this.settingEntries,
    required this.notes,
    required this.activeTab,
    this.error,
  });

  const KnowledgeBaseState.initial()
      : isLoading = false,
        characters = const <Character>[],
        settingEntries = const <SettingEntry>[],
        notes = const <Note>[],
        activeTab = KnowledgeBaseTab.characters,
        error = null;

  final bool isLoading;
  final List<Character> characters;
  final List<SettingEntry> settingEntries;
  final List<Note> notes;
  final KnowledgeBaseTab activeTab;
  final AppError? error;

  KnowledgeBaseState copyWith({
    bool? isLoading,
    List<Character>? characters,
    List<SettingEntry>? settingEntries,
    List<Note>? notes,
    KnowledgeBaseTab? activeTab,
    AppError? error,
    bool clearError = false,
  }) =>
      KnowledgeBaseState(
        isLoading: isLoading ?? this.isLoading,
        characters: characters ?? this.characters,
        settingEntries: settingEntries ?? this.settingEntries,
        notes: notes ?? this.notes,
        activeTab: activeTab ?? this.activeTab,
        error: clearError ? null : error ?? this.error,
      );
}
