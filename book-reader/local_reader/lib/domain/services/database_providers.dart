import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../infrastructure/database/app_database.dart';
import '../../infrastructure/database/book_repository_impl.dart';
import '../../infrastructure/database/note_repository_impl.dart';
import '../../infrastructure/database/reading_progress_repository_impl.dart';
import '../../infrastructure/database/series_repository_impl.dart';
import '../../infrastructure/database/tag_repository_impl.dart';
import '../repositories/repositories.dart';

/// 数据库实例 Provider
final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

/// 书籍仓储 Provider
final bookRepositoryProvider = Provider<BookRepository>((ref) {
  return BookRepositoryImpl(ref.watch(databaseProvider));
});

/// 系列仓储 Provider
final seriesRepositoryProvider = Provider<SeriesRepository>((ref) {
  return SeriesRepositoryImpl(ref.watch(databaseProvider));
});

/// 标签仓储 Provider
final tagRepositoryProvider = Provider<TagRepository>((ref) {
  return TagRepositoryImpl(ref.watch(databaseProvider));
});

/// 阅读进度仓储 Provider
final readingProgressRepositoryProvider =
    Provider<ReadingProgressRepository>((ref) {
  return ReadingProgressRepositoryImpl(ref.watch(databaseProvider));
});

/// 笔记仓储 Provider
final noteRepositoryProvider = Provider<NoteRepository>((ref) {
  return NoteRepositoryImpl(ref.watch(databaseProvider));
});
