import '../entities/reading_progress.dart';

/// 阅读进度仓储接口
abstract class ReadingProgressRepository {
  Future<ReadingProgress?> getProgressForBook(int bookId);
  Future<void> saveProgress(ReadingProgress progress);
  Future<void> deleteProgress(int id);
}
