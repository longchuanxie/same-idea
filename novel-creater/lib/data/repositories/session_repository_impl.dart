import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class SessionRepositoryImpl implements SessionRepository {
  SessionRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Session>> getById(String id) async {
    try {
      final row = await (_db.select(_db.sessionsTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Session not found',
          userMessage: 'Session not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load session',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Session>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.sessionsTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load sessions',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Session>> create(Session session) async {
    try {
      await _db.into(_db.sessionsTable).insert(_toCompanion(session));
      return AppResult.success(session);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create session',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Session>> update(Session session) async {
    try {
      await (_db.update(_db.sessionsTable)
            ..where((t) => t.id.equals(session.id)))
          .write(_toUpdateCompanion(session));
      return AppResult.success(session);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update session',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.sessionsTable)..where((t) => t.id.equals(id))).go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete session',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  Session _toEntity(SessionsTableData row) {
    return Session(
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      stage: SessionStage.values.byName(row.stage),
      parentSessionId: row.parentSessionId,
      branchName: row.branchName,
      messages: List<SessionMessage>.from(
        row.messages.startsWith('[')
            ? (jsonDecode(row.messages) as List)
                .map((e) => SessionMessage.fromJson(e as Map<String, dynamic>))
            : <SessionMessage>[],
      ),
      contextSnapshotId: row.contextSnapshotId,
      archived: row.archived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  SessionsTableCompanion _toCompanion(Session s) {
    return SessionsTableCompanion.insert(
      id: s.id,
      projectId: s.projectId,
      title: s.title,
      stage: Value(s.stage.name),
      parentSessionId: Value(s.parentSessionId),
      branchName: Value(s.branchName),
      messages: Value(jsonEncode(s.messages.map((m) => m.toJson()).toList())),
      contextSnapshotId: Value(s.contextSnapshotId),
      archived: Value(s.archived),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      schemaVersion: Value(s.schemaVersion),
    );
  }

  SessionsTableCompanion _toUpdateCompanion(Session s) {
    return SessionsTableCompanion(
      title: Value(s.title),
      stage: Value(s.stage.name),
      parentSessionId: Value(s.parentSessionId),
      branchName: Value(s.branchName),
      messages: Value(jsonEncode(s.messages.map((m) => m.toJson()).toList())),
      contextSnapshotId: Value(s.contextSnapshotId),
      archived: Value(s.archived),
      updatedAt: Value(s.updatedAt),
      schemaVersion: Value(s.schemaVersion),
    );
  }
}
