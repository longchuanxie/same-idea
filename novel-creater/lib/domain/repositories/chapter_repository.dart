import 'package:novel_creator/domain/domain.dart';

abstract class ChapterRepository {
  Future<AppResult<Chapter>> getById(String id);
  Future<AppResult<List<Chapter>>> getByProjectId(String projectId);
  Future<AppResult<Chapter>> create(Chapter chapter);
  Future<AppResult<Chapter>> saveContent(String id, String content);
  Future<AppResult<Chapter>> update(Chapter chapter);
  Future<AppResult<void>> delete(String id);
  Stream<AppResult<Chapter>> watchById(String id);
  Stream<AppResult<List<Chapter>>> watchByProjectId(String projectId);
}
