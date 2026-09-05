import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:local_reader/domain/entities/entities.dart';
import 'package:local_reader/domain/services/book_detail_service.dart';
import 'package:local_reader/domain/services/import_scan_service.dart';
import 'package:local_reader/domain/services/metadata_service.dart';
import 'package:local_reader/domain/services/search_service.dart';
import 'package:local_reader/domain/services/series_service.dart';
import 'package:local_reader/domain/services/shelf_service.dart';
import 'package:local_reader/infrastructure/database/app_database.dart';
import 'package:local_reader/infrastructure/database/book_repository_impl.dart';
import 'package:local_reader/infrastructure/database/note_repository_impl.dart';
import 'package:local_reader/infrastructure/database/reading_progress_repository_impl.dart';
import 'package:local_reader/infrastructure/database/series_repository_impl.dart';
import 'package:local_reader/infrastructure/database/tag_repository_impl.dart';
import 'package:local_reader/infrastructure/parsers/file_format_detector.dart';

void main() {
  late AppDatabase database;
  late BookRepositoryImpl bookRepository;
  late ImportScanService importScanService;
  late MetadataService metadataService;
  late SearchService searchService;
  late ShelfService shelfService;
  late BookDetailService bookDetailService;
  late SeriesService seriesService;

  const testFilePath =
      r'C:\Users\15245\Downloads\《凡人修仙传》(精校版)_qinkan.net.epub';

  setUp(() {
    // 使用内存数据库，避免依赖 path_provider
    database = AppDatabase.forTesting(NativeDatabase.memory());
    bookRepository = BookRepositoryImpl(database);
    final noteRepository = NoteRepositoryImpl(database);
    final seriesRepository = SeriesRepositoryImpl(database);
    final tagRepository = TagRepositoryImpl(database);
    final progressRepository = ReadingProgressRepositoryImpl(database);

    importScanService = ImportScanService(bookRepository: bookRepository);
    metadataService = MetadataService(bookRepository: bookRepository);
    searchService = SearchService(
      bookRepository: bookRepository,
      noteRepository: noteRepository,
    );
    shelfService = ShelfService(
      bookRepository: bookRepository,
      seriesRepository: seriesRepository,
      tagRepository: tagRepository,
    );
    bookDetailService = BookDetailService(
      bookRepository: bookRepository,
      tagRepository: tagRepository,
      seriesRepository: seriesRepository,
      progressRepository: progressRepository,
    );
    seriesService = SeriesService(
      seriesRepository: seriesRepository,
      bookRepository: bookRepository,
    );
  });

  tearDown(() async {
    await database.close();
  });

  group('文件格式识别', () {
    test('识别EPUB文件格式', () {
      final format = FileFormatDetector.detectFromPath(testFilePath);
      expect(format, BookFormat.epub);
    });

    test('识别书籍类型分类', () {
      final format = FileFormatDetector.detectFromPath(testFilePath);
      final category = FileFormatDetector.categorize(format!);
      expect(category, BookTypeCategory.text);
    });
  });

  group('导入扫描功能', () {
    test('导入EPUB文件成功', () async {
      final events = <ScanEvent>[];
      await importScanService.importFiles([testFilePath]).forEach(events.add);

      expect(events.any((e) => e.type == ScanEventType.started), isTrue);
      expect(events.any((e) => e.type == ScanEventType.fileParsed), isTrue);
      expect(events.any((e) => e.type == ScanEventType.completed), isTrue);
      expect(events.any((e) => e.type == ScanEventType.fileFailed), isFalse);

      final completedEvent = events.firstWhere(
        (e) => e.type == ScanEventType.completed,
      );
      expect(completedEvent.addedCount, 1);
      expect(completedEvent.failedCount, 0);
    });

    test('重复导入应跳过', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final events = <ScanEvent>[];
      await importScanService.importFiles([testFilePath]).forEach(events.add);

      expect(events.any((e) => e.type == ScanEventType.fileSkipped), isTrue);
      final completedEvent = events.firstWhere(
        (e) => e.type == ScanEventType.completed,
      );
      expect(completedEvent.skippedCount, 1);
      expect(completedEvent.addedCount, 0);
    });
  });

  group('元数据提取', () {
    test('提取EPUB文件元数据', () async {
      final result = await metadataService.extractMetadata(testFilePath);
      expect(result.title, isNotNull);
      expect(result.title!.isNotEmpty, isTrue);
    });
  });

  group('书架功能', () {
    test('获取书架首页', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final page = await shelfService.getShelfPage(page: 1);
      expect(page.books.isNotEmpty, isTrue);
      expect(page.totalItems, greaterThan(0));
    });

    test('书架分页查询', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final page = await shelfService.getShelfPage(page: 1);
      expect(page.currentPage, 1);
    });
  });

  group('书籍详情功能', () {
    test('获取书籍详情', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final books = await bookRepository.getAllBooks();
      expect(books.isNotEmpty, isTrue);

      final detail = await bookDetailService.getBook(books.first.id);
      expect(detail, isNotNull);
      expect(detail!.title, isNotNull);
      expect(detail.format, BookFormat.epub);
    });

    test('获取书籍标签', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final books = await bookRepository.getAllBooks();
      final tags = await bookDetailService.getBookTags(books.first.id);
      expect(tags, isEmpty);
    });
  });

  group('搜索功能', () {
    test('搜索书名', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final results = await searchService.searchBooks('凡人');
      expect(results.isNotEmpty, isTrue);
      expect(results.first.title, contains('凡人'));
    });

    test('搜索命令', () {
      final results = searchService.searchCommands('导入');
      expect(results.isNotEmpty, isTrue);
      expect(results.first, isA<CommandSearchResult>());
    });

    test('综合搜索', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final results = await searchService.searchAll('凡人');
      expect(results.isNotEmpty, isTrue);
    });
  });

  group('系列功能', () {
    test('获取系列列表', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final seriesList = await seriesService.getAllSeries();
      expect(seriesList, isEmpty);
    });
  });

  group('文件丢失检测', () {
    test('检测丢失文件', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final missing = await importScanService.detectMissingFiles();
      expect(missing, isEmpty);
    });
  });

  group('数据库完整性', () {
    test('导入后数据库记录完整', () async {
      await importScanService.importFiles([testFilePath]).toList();

      final books = await bookRepository.getAllBooks();
      expect(books.length, 1);

      final book = books.first;
      expect(book.filePath, testFilePath);
      expect(book.format, BookFormat.epub);
      expect(book.fileSizeBytes, greaterThan(0));
      expect(book.addedAt, isNotNull);
    });
  });
}
