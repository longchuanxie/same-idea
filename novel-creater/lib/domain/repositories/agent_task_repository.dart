import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class AgentTaskRepository {
  Future<AppResult<AgentTask>> create(AgentTask task);

  Future<AppResult<AgentTask>> getById(String id);

  Future<AppResult<List<AgentTask>>> listByProject(String projectId);

  Future<AppResult<List<AgentTask>>> listByStatus(
    String projectId,
    AgentTaskStatus status,
  );

  Future<AppResult<AgentTask>> updateStatus({
    required String id,
    required AgentTaskStatus status,
    String? result,
    String? errorMessage,
  });
}
