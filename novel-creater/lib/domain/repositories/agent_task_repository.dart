import 'package:novel_creator/domain/domain.dart';

abstract class AgentTaskRepository {
  Future<AppResult<AgentTask>> getById(String id);
  Future<AppResult<List<AgentTask>>> getByProjectId(String projectId);
  Future<AppResult<List<AgentTask>>> getActiveByProjectId(String projectId);
  Future<AppResult<AgentTask>> create(AgentTask task);
  Future<AppResult<AgentTask>> update(AgentTask task);
  Future<AppResult<void>> delete(String id);
}
