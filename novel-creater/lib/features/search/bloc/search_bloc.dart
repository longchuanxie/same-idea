import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/domain/repositories/search_repository.dart';
import 'package:novel_creator/features/search/bloc/search_event.dart';
import 'package:novel_creator/features/search/bloc/search_state.dart';

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc({
    required SearchRepository searchRepository,
    required String projectId,
  })  : _searchRepository = searchRepository,
        super(SearchState.initial(projectId)) {
    on<SearchQueryChanged>(_onQueryChanged);
    on<SearchTypeFilterChanged>(_onTypeFilterChanged);
    on<SearchResultSelected>(_onResultSelected);
  }

  final SearchRepository _searchRepository;

  Future<void> _onQueryChanged(
    SearchQueryChanged event,
    Emitter<SearchState> emit,
  ) async {
    final query = event.query.trim();
    emit(state.copyWith(query: query, isSearching: true, clearError: true));

    if (query.isEmpty) {
      emit(state.copyWith(isSearching: false, results: []));
      return;
    }

    try {
      final result = await _searchRepository.search(
        projectId: state.projectId,
        query: query,
        typeFilter: state.typeFilter,
      );

      if (result.isSuccess) {
        emit(state.copyWith(isSearching: false, results: result.valueOrNull ?? []));
      } else {
        emit(state.copyWith(
          isSearching: false,
          error: result.errorOrNull,
        ));
      }
    } catch (e) {
      emit(state.copyWith(isSearching: false));
    }
  }

  void _onTypeFilterChanged(
    SearchTypeFilterChanged event,
    Emitter<SearchState> emit,
  ) {
    emit(state.copyWith(typeFilter: event.filter));
    if (state.query.isNotEmpty) {
      add(SearchQueryChanged(state.query));
    }
  }

  void _onResultSelected(
    SearchResultSelected event,
    Emitter<SearchState> emit,
  ) {}
}
