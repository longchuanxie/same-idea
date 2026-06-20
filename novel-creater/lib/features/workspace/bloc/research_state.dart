part of 'research_bloc.dart';

class ResearchState extends Equatable {
  const ResearchState({
    this.projectId,
    this.query = '',
    this.sources = const [],
    this.savedNoteIds = const {},
    this.hasConfirmedSearchRisk = false,
    this.isSearching = false,
    this.error,
    this.lastMessage,
  });

  final String? projectId;
  final String query;
  final List<SourceCard> sources;
  final Set<String> savedNoteIds;
  final bool hasConfirmedSearchRisk;
  final bool isSearching;
  final String? error;
  final String? lastMessage;

  ResearchState copyWith({
    String? projectId,
    String? query,
    List<SourceCard>? sources,
    Set<String>? savedNoteIds,
    bool? hasConfirmedSearchRisk,
    bool? isSearching,
    String? error,
    String? lastMessage,
  }) =>
      ResearchState(
        projectId: projectId ?? this.projectId,
        query: query ?? this.query,
        sources: sources ?? this.sources,
        savedNoteIds: savedNoteIds ?? this.savedNoteIds,
        hasConfirmedSearchRisk:
            hasConfirmedSearchRisk ?? this.hasConfirmedSearchRisk,
        isSearching: isSearching ?? this.isSearching,
        error: error,
        lastMessage: lastMessage,
      );

  @override
  List<Object?> get props => [
        projectId,
        query,
        sources,
        savedNoteIds,
        hasConfirmedSearchRisk,
        isSearching,
        error,
        lastMessage,
      ];
}
