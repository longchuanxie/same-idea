import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryProjectRepository implements ProjectRepository {
  final Map<String, Project> _projects = <String, Project>{};

  @override
  Future<AppResult<Project>> create(Project project) async {
    _projects[project.id] = project;
    return AppResult<Project>.success(project);
  }

  @override
  Future<AppResult<Project?>> get(String id) async =>
      AppResult<Project?>.success(_projects[id]);

  @override
  Future<AppResult<List<Project>>> list() async =>
      AppResult<List<Project>>.success(
        List<Project>.unmodifiable(_projects.values),
      );

  @override
  Future<AppResult<Project>> saveContent(Project project) async {
    if (!_projects.containsKey(project.id)) {
      return const AppResult<Project>.failure(
        AppError(
          code: 'project.not_found',
          message: 'Project was not found.',
          userMessage: '未找到项目，无法保存。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新项目列表后重试。',
        ),
      );
    }

    final saved = project.copyWith(updatedAt: DateTime.now().toUtc());
    _projects[project.id] = saved;
    return AppResult<Project>.success(saved);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _projects.remove(id);
    return AppResult<void>.success(null);
  }
}
