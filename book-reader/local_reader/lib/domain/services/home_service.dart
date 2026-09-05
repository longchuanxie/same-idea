import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import 'database_providers.dart';

/// 书库统计
class LibraryStats {
  const LibraryStats({
    required this.totalBooks,
    required this.totalSeries,
    required this.totalNotes,
  });

  final int totalBooks;
  final int totalSeries;
  final int totalNotes;
}

/// 首页数据
class HomeData {
  const HomeData({
    required this.continueReading,
    required this.stats,
    required this.recentBooks,
  });

  final List<Book> continueReading;
  final LibraryStats stats;
  final List<Book> recentBooks;
}

/// 首页服务
class HomeService {
  const HomeService({
    required BookRepository bookRepository,
    required SeriesRepository seriesRepository,
    required NoteRepository noteRepository,
    // ignore: unused_field
    required ReadingProgressRepository progressRepository,
  })  : _bookRepository = bookRepository,
        _seriesRepository = seriesRepository,
        _noteRepository = noteRepository,
        _progressRepository = progressRepository;

  final BookRepository _bookRepository;
  final SeriesRepository _seriesRepository;
  final NoteRepository _noteRepository;
  // ignore: unused_field
  final ReadingProgressRepository _progressRepository;

  /// 继续阅读（最近打开且有进度的书，最多 5 本）
  static const int continueReadingLimit = 5;

  Future<List<Book>> getContinueReading() async {
    final allBooks = await _bookRepository.getAllBooks();
    final booksWithProgress = <Book>[];
    for (final book in allBooks) {
      if (book.lastOpenedAt != null) {
        booksWithProgress.add(book);
      }
    }
    booksWithProgress.sort(
      (a, b) => b.lastOpenedAt!.compareTo(a.lastOpenedAt!),
    );
    return booksWithProgress.take(continueReadingLimit).toList();
  }

  /// 书库统计
  Future<LibraryStats> getStats() async {
    final books = await _bookRepository.getAllBooks();
    final series = await _seriesRepository.getAllSeries();
    final notes = await _noteRepository.searchNotes('');
    return LibraryStats(
      totalBooks: books.length,
      totalSeries: series.length,
      totalNotes: notes.length,
    );
  }

  /// 最近添加的书（最多 10 本）
  static const int recentBooksLimit = 10;

  Future<List<Book>> getRecentBooks() async {
    final allBooks = await _bookRepository.getAllBooks();
    allBooks.sort((a, b) => b.addedAt!.compareTo(a.addedAt!));
    return allBooks.take(recentBooksLimit).toList();
  }

  /// 获取完整首页数据
  Future<HomeData> getHomeData() async {
    final continueReading = await getContinueReading();
    final stats = await getStats();
    final recentBooks = await getRecentBooks();
    return HomeData(
      continueReading: continueReading,
      stats: stats,
      recentBooks: recentBooks,
    );
  }
}

/// 首页服务 Provider
final homeServiceProvider = Provider<HomeService>((ref) {
  return HomeService(
    bookRepository: ref.watch(bookRepositoryProvider),
    seriesRepository: ref.watch(seriesRepositoryProvider),
    noteRepository: ref.watch(noteRepositoryProvider),
    progressRepository: ref.watch(readingProgressRepositoryProvider),
  );
});

/// 首页数据 Provider
final homeDataProvider = FutureProvider<HomeData>((ref) async {
  final service = ref.watch(homeServiceProvider);
  return service.getHomeData();
});
