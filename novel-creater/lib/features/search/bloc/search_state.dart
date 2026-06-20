import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/results/app_error.dart';

final class SearchState {
  const SearchState({
    required this.projectId,
    required this.isSearching,
    required this.query,
    required this.results,
    this.typeFilter,
    this.error,
  });

  const SearchState.initial(this.projectId)
      : isSearching = false,
        query = '',
        results = const <SearchResult>[],
        typeFilter = null,
        error = null;

  final String projectId;
  final bool isSearching;
  final String query;
  final List<SearchResult> results;
  final SearchEntityType? typeFilter;
  final AppError? error;

  SearchState copyWith({
    bool? isSearching,
    String? query,
    List<SearchResult>? results,
    SearchEntityType? typeFilter,
    AppError? error,
    bool clearError = false,
  }) =>
      SearchState(
        projectId: projectId,
        isSearching: isSearching ?? this.isSearching,
        query: query ?? this.query,
        results: results ?? this.results,
        typeFilter: typeFilter ?? this.typeFilter,
        error: clearError ? null : error ?? this.error,
      );
}
