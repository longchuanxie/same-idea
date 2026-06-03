import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class AgentTaskRepositoryImpl implements AgentTaskRepository {
  AgentTaskRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<AgentTask>> getById(String id) async {
    try {
      final row = await (_db.select(_db.agentTasksTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Agent task not found',
          userMessage: 'Agent task not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load agent task',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<AgentTask>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.agentTasksTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load agent tasks',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<AgentTask>>> getActiveByProjectId(String projectId) async {
    try {
      final terminalStatuses = [
        AgentTaskStatus.succeeded.name,
        AgentTaskStatus.failed.name,
        AgentTaskStatus.cancelled.name,
      ];
      final rows = await (_db.select(_db.agentTasksTable)
            ..where((t) => t.projectId.equals(projectId) & t.status.isNotIn(terminalStatuses)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load active agent tasks',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<AgentTask>> create(AgentTask task) async {
    try {
      await _db.into(_db.agentTasksTable).insert(_toCompanion(task));
      return AppResult.success(task);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create agent task',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<AgentTask>> update(AgentTask task) async {
    try {
      await (_db.update(_db.agentTasksTable)
            ..where((t) => t.id.equals(task.id)))
          .write(_toUpdateCompanion(task));
      return AppResult.success(task);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update agent task',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.agentTasksTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete agent task',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  AgentTask _toEntity(AgentTasksTableData row) {
    return AgentTask(
      id: row.id,
      projectId: row.projectId,
      taskType: AgentTaskType.values.byName(row.taskType),
      status: AgentTaskStatus.values.byName(row.status),
      inputJson: row.inputJson,
      outputJson: row.outputJson,
      model: row.model,
      tokenUsage: row.tokenUsage != null
          ? TokenUsage.fromJson(jsonDecode(row.tokenUsage!) as Map<String, dynamic>)
          : null,
      error: row.error,
      sideEffects: List<String>.from(
        row.sideEffects.startsWith('[')
            ? jsonDecode(row.sideEffects) as List
            : <String>[],
      ),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  AgentTasksTableCompanion _toCompanion(AgentTask t) {
    return AgentTasksTableCompanion.insert(
      id: t.id,
      projectId: t.projectId,
      taskType: t.taskType.name,
      status: Value(t.status.name),
      inputJson: Value(t.inputJson),
      outputJson: Value(t.outputJson),
      model: Value(t.model),
      tokenUsage: Value(t.tokenUsage != null ? jsonEncode(t.tokenUsage!.toJson()) : null),
      error: Value(t.error),
      sideEffects: Value(jsonEncode(t.sideEffects)),
      startedAt: Value(t.startedAt),
      completedAt: Value(t.completedAt),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      schemaVersion: Value(t.schemaVersion),
    );
  }

  AgentTasksTableCompanion _toUpdateCompanion(AgentTask t) {
    return AgentTasksTableCompanion(
      status: Value(t.status.name),
      inputJson: Value(t.inputJson),
      outputJson: Value(t.outputJson),
      model: Value(t.model),
      tokenUsage: Value(t.tokenUsage != null ? jsonEncode(t.tokenUsage!.toJson()) : null),
      error: Value(t.error),
      sideEffects: Value(jsonEncode(t.sideEffects)),
      startedAt: Value(t.startedAt),
      completedAt: Value(t.completedAt),
      updatedAt: Value(t.updatedAt),
      schemaVersion: Value(t.schemaVersion),
    );
  }
}
