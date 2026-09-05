import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import 'database_providers.dart';

/// 搜索服务
/// 负责书库搜索、笔记搜索、命令搜索
class SearchService {
  const SearchService({
    required BookRepository bookRepository,
    required NoteRepository noteRepository,
  })  : _bookRepository = bookRepository,
        _noteRepository = noteRepository;

  final BookRepository _bookRepository;
  final NoteRepository _noteRepository;

  /// 搜索书库（按书名和作者）
  Future<List<BookSearchResult>> searchBooks(String keyword) async {
    if (keyword.trim().isEmpty) return [];
    final books = await _bookRepository.searchBooks(keyword);
    return books.map((book) => BookSearchResult(
      id: 'book_${book.id}',
      title: book.title,
      subtitle: book.author ?? '',
      bookId: book.id,
      format: book.format.name,
    )).toList();
  }

  /// 搜索笔记
  Future<List<NoteSearchResult>> searchNotes(String keyword) async {
    if (keyword.trim().isEmpty) return [];
    final notes = await _noteRepository.searchNotes(keyword);
    return notes.map((note) => NoteSearchResult(
      id: 'note_${note.id}',
      title: note.content ?? '',
      subtitle: note.highlightText ?? '',
      noteId: note.id,
      bookId: note.bookId,
    )).toList();
  }

  /// 搜索命令
  List<CommandSearchResult> searchCommands(String keyword) {
    if (keyword.trim().isEmpty) return [];
    final lowerKeyword = keyword.toLowerCase();
    return _commands
        .where((cmd) =>
            cmd.title.toLowerCase().contains(lowerKeyword) ||
            cmd.subtitle.toLowerCase().contains(lowerKeyword))
        .toList();
  }

  /// 综合搜索
  Future<List<SearchResult>> searchAll(String keyword) async {
    if (keyword.trim().isEmpty) return [];
    final results = <SearchResult>[];
    results.addAll(await searchBooks(keyword));
    results.addAll(await searchNotes(keyword));
    results.addAll(searchCommands(keyword));
    return results;
  }

  /// 内置命令列表
  static const List<CommandSearchResult> _commands = [
    CommandSearchResult(
      id: 'cmd_import_files',
      title: '导入文件',
      subtitle: '选择本地文件导入书库',
      routePath: '/import',
    ),
    CommandSearchResult(
      id: 'cmd_scan_directory',
      title: '扫描目录',
      subtitle: '扫描本地目录批量导入',
      routePath: '/import',
    ),
    CommandSearchResult(
      id: 'cmd_open_settings',
      title: '打开设置',
      subtitle: '应用偏好设置',
      routePath: '/settings',
    ),
    CommandSearchResult(
      id: 'cmd_view_series',
      title: '查看系列',
      subtitle: '浏览所有系列',
      routePath: '/series',
    ),
  ];
}

/// 搜索服务 Provider
final searchServiceProvider = Provider<SearchService>((ref) {
  return SearchService(
    bookRepository: ref.watch(bookRepositoryProvider),
    noteRepository: ref.watch(noteRepositoryProvider),
  );
});

/// 搜索查询 Provider
final searchQueryProvider = StateProvider<String>((ref) => '');

/// 搜索结果 Provider
final searchResultsProvider = FutureProvider<List<SearchResult>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.trim().isEmpty) return [];
  final service = ref.watch(searchServiceProvider);
  return service.searchAll(query);
});
