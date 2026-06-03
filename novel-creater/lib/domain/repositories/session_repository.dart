import 'package:novel_creator/domain/domain.dart';

abstract class SessionRepository {
  Future<AppResult<Session>> getById(String id);
  Future<AppResult<List<Session>>> getByProjectId(String projectId);
  Future<AppResult<Session>> create(Session session);
  Future<AppResult<Session>> update(Session session);
  Future<AppResult<void>> delete(String id);
}
