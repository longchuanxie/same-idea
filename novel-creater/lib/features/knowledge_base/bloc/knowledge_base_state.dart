part of 'knowledge_base_bloc.dart';

class KnowledgeBaseState extends Equatable {
  const KnowledgeBaseState({
    this.projectId,
    this.characters = const [],
    this.notes = const [],
    this.settingEntries = const [],
    this.outlineNodes = const [],
    this.query = '',
    this.isLoading = false,
    this.error,
    this.lastMessage,
  });

  final String? projectId;
  final List<Character> characters;
  final List<Note> notes;
  final List<SettingEntry> settingEntries;
  final List<OutlineNode> outlineNodes;
  final String query;
  final bool isLoading;
  final String? error;
  final String? lastMessage;

  List<Character> get filteredCharacters {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return characters;
    return characters
        .where(
          (character) =>
              character.name.toLowerCase().contains(normalized) ||
              character.description.toLowerCase().contains(normalized) ||
              character.tags
                  .any((tag) => tag.toLowerCase().contains(normalized)),
        )
        .toList();
  }

  List<Note> get filteredNotes {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return notes;
    return notes
        .where(
          (note) =>
              note.title.toLowerCase().contains(normalized) ||
              note.content.toLowerCase().contains(normalized) ||
              note.tags.any((tag) => tag.toLowerCase().contains(normalized)),
        )
        .toList();
  }

  List<OutlineNode> get filteredOutlineNodes {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return outlineNodes;
    return outlineNodes
        .where(
          (node) =>
              node.title.toLowerCase().contains(normalized) ||
              node.summary.toLowerCase().contains(normalized),
        )
        .toList();
  }

  List<SettingEntry> get filteredSettingEntries {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return settingEntries;
    return settingEntries
        .where(
          (entry) =>
              entry.category.toLowerCase().contains(normalized) ||
              entry.title.toLowerCase().contains(normalized) ||
              entry.content.toLowerCase().contains(normalized) ||
              entry.tags.any((tag) => tag.toLowerCase().contains(normalized)),
        )
        .toList();
  }

  KnowledgeBaseState copyWith({
    String? projectId,
    List<Character>? characters,
    List<Note>? notes,
    List<SettingEntry>? settingEntries,
    List<OutlineNode>? outlineNodes,
    String? query,
    bool? isLoading,
    String? error,
    String? lastMessage,
  }) =>
      KnowledgeBaseState(
        projectId: projectId ?? this.projectId,
        characters: characters ?? this.characters,
        notes: notes ?? this.notes,
        settingEntries: settingEntries ?? this.settingEntries,
        outlineNodes: outlineNodes ?? this.outlineNodes,
        query: query ?? this.query,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        lastMessage: lastMessage,
      );

  @override
  List<Object?> get props => [
        projectId,
        characters,
        notes,
        settingEntries,
        outlineNodes,
        query,
        isLoading,
        error,
        lastMessage,
      ];
}
