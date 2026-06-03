import 'package:novel_creator/domain/domain.dart';

abstract class RevisionRepository {
  Future<AppResult<Revision>> getById(String id);
  Future<AppResult<List<Revision>>> getByChapterId(String chapterId);
  Future<AppResult<List<Revision>>> getPendingByProjectId(String projectId);
  Future<AppResult<Revision>> create(Revision revision);
  Future<AppResult<Revision>> update(Revision revision);
  Future<AppResult<void>> delete(String id);
}
