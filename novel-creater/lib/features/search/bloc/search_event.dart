import 'package:novel_creator/domain/entities/search_result.dart';

sealed class SearchEvent {
  const SearchEvent();
}

final class SearchQueryChanged extends SearchEvent {
  const SearchQueryChanged(this.query);

  final String query;
}

final class SearchTypeFilterChanged extends SearchEvent {
  const SearchTypeFilterChanged(this.filter);

  final SearchEntityType? filter;
}

final class SearchResultSelected extends SearchEvent {
  const SearchResultSelected(this.result);

  final SearchResult result;
}
