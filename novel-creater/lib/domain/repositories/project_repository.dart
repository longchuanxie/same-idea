import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class ProjectRepository {
  Future<AppResult<Project>> create(Project project);

  Future<AppResult<List<Project>>> list();

  Future<AppResult<Project?>> get(String id);

  Future<AppResult<Project>> saveContent(Project project);

  Future<AppResult<void>> delete(String id);
}
