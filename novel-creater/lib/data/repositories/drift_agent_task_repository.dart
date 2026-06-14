import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/agent_task_mapper.dart';
import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/domain/repositories/agent_task_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftAgentTaskRepository implements AgentTaskRepository {
  DriftAgentTaskRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    AgentTaskMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const AgentTaskMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final AgentTaskMapper _mapper;

  @override
  Future<AppResult<AgentTask>> create(AgentTask task) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.agentTasks).insert(_mapper.toRow(task));
        return AppResult<AgentTask>.success(task);
      });

  @override
  Future<AppResult<AgentTask>> getById(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.agentTasks)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (row == null) {
          return const AppResult<AgentTask>.failure(
            AppError(
              code: 'database.not_found',
              message: 'AgentTask not found.',
              userMessage: '未找到任务记录。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        return AppResult<AgentTask>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<List<AgentTask>>> listByProject(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.agentTasks)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<AgentTask>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<AgentTask>>> listByStatus(
    String projectId,
    AgentTaskStatus status,
  ) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.agentTasks)
              ..where(
                (t) =>
                    t.projectId.equals(projectId) &
                    t.status.equals(status.name),
              )
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<AgentTask>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<AgentTask>> updateStatus({
    required String id,
    required AgentTaskStatus status,
    String? result,
    String? errorMessage,
  }) =>
      _errorMapper.wrapAsync(() async {
        // Fetch current task to validate transition.
        final currentRow = await (_db.select(_db.agentTasks)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (currentRow == null) {
          return const AppResult<AgentTask>.failure(
            AppError(
              code: 'database.not_found',
              message: 'AgentTask not found.',
              userMessage: '未找到任务记录，无法更新状态。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }

        final currentTask = _mapper.fromRow(currentRow);
        final validationError = currentTask.validateTransition(status);
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

        final now = DateTime.now().toUtc();
        final companion = AgentTasksCompanion(
          status: Value(status.name),
          result: Value(result),
          errorMessage: Value(errorMessage),
          updatedAt: Value(now.millisecondsSinceEpoch),
        );
        await (_db.update(_db.agentTasks)..where((t) => t.id.equals(id)))
            .write(companion);

        final updatedRow = await (_db.select(_db.agentTasks)
              ..where((t) => t.id.equals(id)))
            .getSingle();
        return AppResult<AgentTask>.success(_mapper.fromRow(updatedRow));
      });
}
