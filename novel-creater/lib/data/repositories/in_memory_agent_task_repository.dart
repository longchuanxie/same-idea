import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/domain/repositories/agent_task_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryAgentTaskRepository implements AgentTaskRepository {
  final Map<String, AgentTask> _tasks = <String, AgentTask>{};

  @override
  Future<AppResult<AgentTask>> create(AgentTask task) async {
    _tasks[task.id] = task;
    return AppResult<AgentTask>.success(task);
  }

  @override
  Future<AppResult<AgentTask>> getById(String id) async {
    final task = _tasks[id];
    if (task == null) {
      return const AppResult<AgentTask>.failure(
        AppError(
          code: 'agent_task.not_found',
          message: 'AgentTask was not found.',
          userMessage: '未找到任务记录。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新任务列表后重试。',
        ),
      );
    }
    return AppResult<AgentTask>.success(task);
  }

  @override
  Future<AppResult<List<AgentTask>>> listByProject(String projectId) async {
    final tasks = _tasks.values
        .where((task) => task.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<AgentTask>>.success(
      List<AgentTask>.unmodifiable(tasks),
    );
  }

  @override
  Future<AppResult<List<AgentTask>>> listByStatus(
    String projectId,
    AgentTaskStatus status,
  ) async {
    final tasks = _tasks.values
        .where(
          (task) => task.projectId == projectId && task.status == status,
        )
        .toList(growable: false);
    return AppResult<List<AgentTask>>.success(
      List<AgentTask>.unmodifiable(tasks),
    );
  }

  @override
  Future<AppResult<AgentTask>> updateStatus({
    required String id,
    required AgentTaskStatus status,
    String? result,
    String? errorMessage,
  }) async {
    final task = _tasks[id];
    if (task == null) {
      return const AppResult<AgentTask>.failure(
        AppError(
          code: 'agent_task.not_found',
          message: 'AgentTask was not found.',
          userMessage: '未找到任务记录，无法更新状态。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新任务列表后重试。',
        ),
      );
    }

    final validationError = task.validateTransition(status);
    if (validationError != null) {
      return AppResult<AgentTask>.failure(
        AppError(
          code: 'agent_task.invalid_transition',
          message: validationError,
          userMessage: '任务状态转换无效：$validationError',
          source: AppErrorSource.storage,
          recoverable: false,
        ),
      );
    }

    final updated = task.copyWith(
      status: status,
      result: result,
      errorMessage: errorMessage,
      updatedAt: DateTime.now().toUtc(),
    );
    _tasks[id] = updated;
    return AppResult<AgentTask>.success(updated);
  }
}
