import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import 'database_providers.dart';

/// 书架分页结果
class ShelfPageResult {
  const ShelfPageResult({
    required this.books,
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
  });

  final List<Book> books;
  final int currentPage;
  final int totalPages;
  final int totalItems;
}

/// 书架排序方式
enum ShelfSortBy {
  title,
  addedAt,
  lastOpenedAt,
  author,
}

/// 书架服务
class ShelfService {
  const ShelfService({
    required BookRepository bookRepository,
    required SeriesRepository seriesRepository,
    required TagRepository tagRepository,
  })  : _bookRepository = bookRepository,
        _seriesRepository = seriesRepository,
        _tagRepository = tagRepository;

  final BookRepository _bookRepository;
  final SeriesRepository _seriesRepository;
  final TagRepository _tagRepository;

  /// 每页书籍数量
  static const int pageSize = 20;

  /// 获取书架分页
  Future<ShelfPageResult> getShelfPage({
    required int page,
    ShelfSortBy sortBy = ShelfSortBy.addedAt,
    bool sortAscending = false,
    BookFormat? filterFormat,
    int? filterSeriesId,
    int? filterTagId,
  }) async {
    var books = await _bookRepository.getAllBooks();

    // 筛选
    if (filterFormat != null) {
      books = books.where((b) => b.format == filterFormat).toList();
    }
    if (filterSeriesId != null) {
      books = books.where((b) => b.seriesId == filterSeriesId).toList();
    }
    if (filterTagId != null) {
      final tagBooks = <int>[];
      // 当前实现遍历所有书检查标签
      for (final book in await _bookRepository.getAllBooks()) {
        final bookTags = await _tagRepository.getTagsForBook(book.id);
        if (bookTags.any((t) => t.id == filterTagId)) {
          tagBooks.add(book.id);
        }
      }
      books = books.where((b) => tagBooks.contains(b.id)).toList();
    }

    // 排序
    books.sort((a, b) {
      int result;
      switch (sortBy) {
        case ShelfSortBy.title:
          result = a.title.compareTo(b.title);
        case ShelfSortBy.addedAt:
          result = (a.addedAt ?? DateTime.now())
              .compareTo(b.addedAt ?? DateTime.now());
        case ShelfSortBy.lastOpenedAt:
          result = (a.lastOpenedAt ?? DateTime.fromMillisecondsSinceEpoch(0))
              .compareTo(
                  b.lastOpenedAt ?? DateTime.fromMillisecondsSinceEpoch(0));
        case ShelfSortBy.author:
          result = (a.author ?? '').compareTo(b.author ?? '');
      }
      return sortAscending ? result : -result;
    });

    // 分页
    final totalItems = books.length;
    final totalPages = (totalItems / pageSize).ceil();
    final startIndex = (page - 1) * pageSize;
    final endIndex = startIndex + pageSize;
    final pageBooks = books.sublist(
      startIndex,
      endIndex > totalItems ? totalItems : endIndex,
    );

    return ShelfPageResult(
      books: pageBooks,
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
    );
  }

  /// 获取所有系列
  Future<List<Series>> getAllSeries() async {
    return _seriesRepository.getAllSeries();
  }

  /// 获取所有标签
  Future<List<Tag>> getAllTags() async {
    return _tagRepository.getAllTags();
  }
}

/// 书架服务 Provider
final shelfServiceProvider = Provider<ShelfService>((ref) {
  return ShelfService(
    bookRepository: ref.watch(bookRepositoryProvider),
    seriesRepository: ref.watch(seriesRepositoryProvider),
    tagRepository: ref.watch(tagRepositoryProvider),
  );
});

/// 书架当前页码 Provider
final shelfCurrentPageProvider = StateProvider<int>((ref) => 1);

/// 书架排序方式 Provider
final shelfSortByProvider = StateProvider<ShelfSortBy>((ref) => ShelfSortBy.addedAt);

/// 书架排序方向 Provider
final shelfSortAscendingProvider = StateProvider<bool>((ref) => false);

/// 书架分页数据 Provider
final shelfPageProvider = FutureProvider<ShelfPageResult>((ref) async {
  final service = ref.watch(shelfServiceProvider);
  final page = ref.watch(shelfCurrentPageProvider);
  final sortBy = ref.watch(shelfSortByProvider);
  final sortAscending = ref.watch(shelfSortAscendingProvider);
  return service.getShelfPage(
    page: page,
    sortBy: sortBy,
    sortAscending: sortAscending,
  );
});
