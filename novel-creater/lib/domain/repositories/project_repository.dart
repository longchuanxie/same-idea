import 'package:novel_creator/domain/domain.dart';

abstract class ProjectRepository {
  Future<AppResult<Project>> getById(String id);
  Future<AppResult<List<Project>>> getAll();
  Future<AppResult<Project>> create(Project project);
  Future<AppResult<Project>> update(Project project);
  Future<AppResult<void>> delete(String id);
  Stream<AppResult<Project>> watchById(String id);
}
