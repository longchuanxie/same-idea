import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import 'database_providers.dart';

/// 书籍详情服务
/// 负责获取书籍详情、关联标签、关联系列、收藏切换、删除等
class BookDetailService {
  const BookDetailService({
    required BookRepository bookRepository,
    required TagRepository tagRepository,
    required SeriesRepository seriesRepository,
    required ReadingProgressRepository progressRepository,
  })  : _bookRepository = bookRepository,
        _tagRepository = tagRepository,
        _seriesRepository = seriesRepository,
        _progressRepository = progressRepository;

  final BookRepository _bookRepository;
  final TagRepository _tagRepository;
  final SeriesRepository _seriesRepository;
  final ReadingProgressRepository _progressRepository;

  /// 获取书籍详情
  Future<Book?> getBook(int bookId) => _bookRepository.getBookById(bookId);

  /// 获取书籍标签
  Future<List<Tag>> getBookTags(int bookId) =>
      _tagRepository.getTagsForBook(bookId);

  /// 获取书籍所属系列
  Future<Series?> getBookSeries(int? seriesId) async {
    if (seriesId == null) return null;
    return _seriesRepository.getSeriesById(seriesId);
  }

  /// 获取阅读进度
  Future<ReadingProgress?> getReadingProgress(int bookId) async {
    return _progressRepository.getProgressForBook(bookId);
  }

  /// 切换收藏状态
  Future<void> toggleFavorite(int bookId) async {
    final book = await _bookRepository.getBookById(bookId);
    if (book == null) return;
    // TODO: Book 实体需要添加 favorite 字段后实现
  }

  /// 删除书籍（仅从书架移除，不删除原始文件）
  Future<void> removeBook(int bookId) async {
    await _bookRepository.deleteBook(bookId);
  }

  /// 为书籍添加标签
  Future<void> addTagToBook(int bookId, int tagId) async {
    await _tagRepository.addTagToBook(bookId, tagId);
  }

  /// 从书籍移除标签
  Future<void> removeTagFromBook(int bookId, int tagId) async {
    await _tagRepository.removeTagFromBook(bookId, tagId);
  }

  /// 创建新标签并关联到书籍
  Future<Tag> createAndAddTag(int bookId, String tagName) async {
    final tag = await _tagRepository.addTag(Tag(id: 0, name: tagName));
    await _tagRepository.addTagToBook(bookId, tag.id);
    return tag;
  }

  /// 更新书籍元数据
  Future<void> updateBookMetadata(Book book) async {
    await _bookRepository.updateBook(book);
  }
}

/// 书籍详情数据
class BookDetailData {
  const BookDetailData({
    required this.book,
    this.tags = const [],
    this.series,
    this.progress,
  });

  final Book book;
  final List<Tag> tags;
  final Series? series;
  final ReadingProgress? progress;
}

/// 书籍详情服务 Provider
final bookDetailServiceProvider = Provider<BookDetailService>((ref) {
  return BookDetailService(
    bookRepository: ref.watch(bookRepositoryProvider),
    tagRepository: ref.watch(tagRepositoryProvider),
    seriesRepository: ref.watch(seriesRepositoryProvider),
    progressRepository: ref.watch(readingProgressRepositoryProvider),
  );
});

/// 书籍详情数据 Provider
final bookDetailProvider =
    FutureProvider.family<BookDetailData, int>((ref, bookId) async {
  final service = ref.watch(bookDetailServiceProvider);
  final book = await service.getBook(bookId);
  if (book == null) {
    throw StateError('Book not found: $bookId');
  }
  final tags = await service.getBookTags(bookId);
  final series = await service.getBookSeries(book.seriesId);
  final progress = await service.getReadingProgress(bookId);
  return BookDetailData(
    book: book,
    tags: tags,
    series: series,
    progress: progress,
  );
});
