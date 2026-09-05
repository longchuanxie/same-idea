/// 搜索结果基类
sealed class SearchResult {
  const SearchResult({
    required this.id,
    required this.title,
    required this.subtitle,
  });

  final String id;
  final String title;
  final String subtitle;
}

/// 书籍搜索结果
class BookSearchResult extends SearchResult {
  const BookSearchResult({
    required super.id,
    required super.title,
    required super.subtitle,
    required this.bookId,
    this.format,
  });

  final int bookId;
  final String? format;
}

/// 笔记搜索结果
class NoteSearchResult extends SearchResult {
  const NoteSearchResult({
    required super.id,
    required super.title,
    required super.subtitle,
    required this.noteId,
    required this.bookId,
  });

  final int noteId;
  final int bookId;
}

/// 命令搜索结果
class CommandSearchResult extends SearchResult {
  const CommandSearchResult({
    required super.id,
    required super.title,
    required super.subtitle,
    required this.routePath,
  });

  final String routePath;
}

/// 搜索状态
enum SearchState {
  empty,
  typing,
  loading,
  results,
  noResults,
  indexBuilding,
  error,
}

/// 搜索范围
enum SearchScope {
  all,
  books,
  notes,
  commands,
}
