import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import 'database_providers.dart';

/// 系列服务
/// 负责系列列表、系列详情、卷册排序、下一卷跳转
class SeriesService {
  const SeriesService({
    required SeriesRepository seriesRepository,
    required BookRepository bookRepository,
  })  : _seriesRepository = seriesRepository,
        _bookRepository = bookRepository;

  final SeriesRepository _seriesRepository;
  final BookRepository _bookRepository;

  /// 获取所有系列
  Future<List<Series>> getAllSeries() => _seriesRepository.getAllSeries();

  /// 获取系列详情（含卷册列表）
  Future<SeriesDetail> getSeriesDetail(int seriesId) async {
    final series = await _seriesRepository.getSeriesById(seriesId);
    if (series == null) {
      throw StateError('Series not found: $seriesId');
    }
    final books = await _bookRepository.getBooksBySeriesId(seriesId);
    books.sort((a, b) =>
        (a.volumeIndex ?? 0).compareTo(b.volumeIndex ?? 0));
    return SeriesDetail(series: series, books: books);
  }

  /// 获取当前阅读卷
  Future<Book?> getCurrentVolume(int seriesId) async {
    final detail = await getSeriesDetail(seriesId);
    for (final book in detail.books) {
      if (book.lastOpenedAt != null) {
        return book;
      }
    }
    return detail.books.isNotEmpty ? detail.books.first : null;
  }

  /// 获取下一卷
  Future<Book?> getNextVolume(int seriesId, int currentBookId) async {
    final detail = await getSeriesDetail(seriesId);
    final currentIndex =
        detail.books.indexWhere((b) => b.id == currentBookId);
    if (currentIndex >= 0 && currentIndex < detail.books.length - 1) {
      return detail.books[currentIndex + 1];
    }
    return null;
  }
}

/// 系列详情数据
class SeriesDetail {
  const SeriesDetail({
    required this.series,
    required this.books,
  });

  final Series series;
  final List<Book> books;

  int get totalVolumes => books.length;
}

/// 系列服务 Provider
final seriesServiceProvider = Provider<SeriesService>((ref) {
  return SeriesService(
    seriesRepository: ref.watch(seriesRepositoryProvider),
    bookRepository: ref.watch(bookRepositoryProvider),
  );
});

/// 系列列表 Provider
final seriesListProvider = FutureProvider<List<Series>>((ref) async {
  final service = ref.watch(seriesServiceProvider);
  return service.getAllSeries();
});

/// 系列详情 Provider
final seriesDetailProvider =
    FutureProvider.family<SeriesDetail, int>((ref, seriesId) async {
  final service = ref.watch(seriesServiceProvider);
  return service.getSeriesDetail(seriesId);
});
