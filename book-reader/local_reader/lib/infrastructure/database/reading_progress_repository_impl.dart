import 'package:drift/drift.dart';

import '../../domain/entities/reading_progress.dart' as domain;
import '../../domain/repositories/reading_progress_repository.dart';
import '../database/app_database.dart' as db;

/// 阅读进度仓储的 drift 实现
class ReadingProgressRepositoryImpl implements ReadingProgressRepository {
  const ReadingProgressRepositoryImpl(this._db);

  final db.AppDatabase _db;

  @override
  Future<domain.ReadingProgress?> getProgressForBook(int bookId) async {
    final row = await (_db.select(_db.readingProgressTable)
          ..where((t) => t.bookId.equals(bookId)))
        .getSingleOrNull();
    return row != null ? _toEntity(row) : null;
  }

  @override
  Future<void> saveProgress(domain.ReadingProgress progress) async {
    await _db.into(_db.readingProgressTable).insertOnConflictUpdate(
          _toCompanion(progress),
        );
  }

  @override
  Future<void> deleteProgress(int id) async {
    await (_db.delete(_db.readingProgressTable)..where((t) => t.id.equals(id)))
        .go();
  }

  domain.ReadingProgress _toEntity(db.ReadingProgressTableData row) {
    return domain.ReadingProgress(
      id: row.id,
      bookId: row.bookId,
      position: row.position,
      percentage: row.percentage,
      chapterIndex: row.chapterIndex,
      chapterTitle: row.chapterTitle,
      scrollOffset: row.scrollOffset,
      updatedAt: row.updatedAt,
    );
  }

  db.ReadingProgressTableCompanion _toCompanion(
      domain.ReadingProgress progress) {
    return db.ReadingProgressTableCompanion(
      id: Value(progress.id),
      bookId: Value(progress.bookId),
      position: Value(progress.position),
      percentage: Value(progress.percentage),
      chapterIndex: Value(progress.chapterIndex),
      chapterTitle: Value(progress.chapterTitle),
      scrollOffset: Value(progress.scrollOffset),
      updatedAt: Value(progress.updatedAt),
    );
  }
}
