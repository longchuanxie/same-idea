import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/navigation_menu.dart';

enum AgentSuggestionType {
  continueWrite,
  write,
  rewrite,
  expand,
  condense,
  polish,
}

final class WorkspaceState {
  const WorkspaceState({
    required this.isLoading,
    required this.saveStatusLabel,
    required this.chapters,
    required this.agentMode,
    required this.agentSuggestion,
    required this.agentSuggestionType,
    required this.agentSuggestionSummary,
    required this.pendingRevisions,
    required this.characters,
    required this.settingEntries,
    required this.notes,
    this.project,
    this.selectedChapter,
    this.selectedNavItem = SidebarNavItem.overview,
    this.chapterTreeExpanded = true,
    this.error,
    this.agentProviderName = '',
    this.agentModelId = '',
    this.agentIsGenerating = false,
  });

  const WorkspaceState.initial()
      : isLoading = false,
        saveStatusLabel = '未保存',
        project = null,
        chapters = const <Chapter>[],
        selectedChapter = null,
        selectedNavItem = SidebarNavItem.overview,
        chapterTreeExpanded = true,
        agentMode = AgentMode.brainstorm,
        agentSuggestion = '',
        agentSuggestionType = AgentSuggestionType.continueWrite,
        agentSuggestionSummary = '',
        pendingRevisions = const <Revision>[],
        characters = const <Character>[],
        settingEntries = const <SettingEntry>[],
        notes = const <Note>[],
        error = null,
        agentProviderName = '',
        agentModelId = '',
        agentIsGenerating = false;

  final bool isLoading;
  final String saveStatusLabel;
  final Project? project;
  final List<Chapter> chapters;
  final Chapter? selectedChapter;
  final AgentMode agentMode;
  final String agentSuggestion;
  final AgentSuggestionType agentSuggestionType;
  final String agentSuggestionSummary;
  final List<Revision> pendingRevisions;
  final List<Character> characters;
  final List<SettingEntry> settingEntries;
  final List<Note> notes;
  final SidebarNavItem selectedNavItem;
  final bool chapterTreeExpanded;
  final AppError? error;
  final String agentProviderName;
  final String agentModelId;
  final bool agentIsGenerating;

  WorkspaceState copyWith({
    bool? isLoading,
    String? saveStatusLabel,
    Project? project,
    List<Chapter>? chapters,
    Chapter? selectedChapter,
    AgentMode? agentMode,
    String? agentSuggestion,
    AgentSuggestionType? agentSuggestionType,
    String? agentSuggestionSummary,
    List<Revision>? pendingRevisions,
    List<Character>? characters,
    List<SettingEntry>? settingEntries,
    List<Note>? notes,
    SidebarNavItem? selectedNavItem,
    bool? chapterTreeExpanded,
    AppError? error,
    bool clearError = false,
    bool clearSelectedChapter = false,
    String? agentProviderName,
    String? agentModelId,
    bool? agentIsGenerating,
  }) =>
      WorkspaceState(
        isLoading: isLoading ?? this.isLoading,
        saveStatusLabel: saveStatusLabel ?? this.saveStatusLabel,
        project: project ?? this.project,
        chapters: chapters ?? this.chapters,
        selectedChapter: clearSelectedChapter ? null : selectedChapter ?? this.selectedChapter,
        agentMode: agentMode ?? this.agentMode,
        agentSuggestion: agentSuggestion ?? this.agentSuggestion,
        agentSuggestionType:
            agentSuggestionType ?? this.agentSuggestionType,
        agentSuggestionSummary:
            agentSuggestionSummary ?? this.agentSuggestionSummary,
        pendingRevisions: pendingRevisions ?? this.pendingRevisions,
        characters: characters ?? this.characters,
        settingEntries: settingEntries ?? this.settingEntries,
        notes: notes ?? this.notes,
        selectedNavItem: selectedNavItem ?? this.selectedNavItem,
        chapterTreeExpanded: chapterTreeExpanded ?? this.chapterTreeExpanded,
        error: clearError ? null : error ?? this.error,
        agentProviderName: agentProviderName ?? this.agentProviderName,
        agentModelId: agentModelId ?? this.agentModelId,
        agentIsGenerating: agentIsGenerating ?? this.agentIsGenerating,
      );
}
