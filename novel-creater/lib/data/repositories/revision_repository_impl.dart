import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class RevisionRepositoryImpl implements RevisionRepository {
  RevisionRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Revision>> getById(String id) async {
    try {
      final row = await (_db.select(_db.revisionsTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Revision not found',
          userMessage: 'Revision not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load revision',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Revision>>> getByChapterId(String chapterId) async {
    try {
      final rows = await (_db.select(_db.revisionsTable)
            ..where((t) => t.chapterId.equals(chapterId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load revisions',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Revision>>> getPendingByProjectId(
      String projectId) async {
    try {
      final rows = await (_db.select(_db.revisionsTable)
            ..where((t) =>
                t.projectId.equals(projectId) & t.status.equals('pending')))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load pending revisions',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Revision>> create(Revision revision) async {
    try {
      await _db.into(_db.revisionsTable).insert(_toCompanion(revision));
      return AppResult.success(revision);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create revision',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Revision>> update(Revision revision) async {
    try {
      await (_db.update(_db.revisionsTable)
            ..where((t) => t.id.equals(revision.id)))
          .write(_toUpdateCompanion(revision));
      return AppResult.success(revision);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update revision',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.revisionsTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete revision',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  Revision _toEntity(RevisionsTableData row) {
    return Revision(
      id: row.id,
      projectId: row.projectId,
      chapterId: row.chapterId,
      operation: RevisionOperation.values.byName(row.operation),
      anchor: RevisionAnchor.fromJson(
          jsonDecode(row.anchor) as Map<String, dynamic>),
      beforeText: row.beforeText,
      afterText: row.afterText,
      source: RevisionSource.values.byName(row.source),
      status: RevisionStatus.values.byName(row.status),
      metadata: row.metadata != null
          ? RevisionPatchMetadata.fromJson(
              jsonDecode(row.metadata!) as Map<String, dynamic>)
          : null,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  RevisionsTableCompanion _toCompanion(Revision r) {
    return RevisionsTableCompanion.insert(
      id: r.id,
      projectId: r.projectId,
      chapterId: r.chapterId,
      operation: r.operation.name,
      anchor: jsonEncode(r.anchor.toJson()),
      beforeText: r.beforeText,
      afterText: r.afterText,
      source: Value(r.source.name),
      status: Value(r.status.name),
      metadata: Value(
          r.metadata != null ? jsonEncode(r.metadata!.toJson()) : null),
      resolvedAt: Value(r.resolvedAt),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      schemaVersion: Value(r.schemaVersion),
    );
  }

  RevisionsTableCompanion _toUpdateCompanion(Revision r) {
    return RevisionsTableCompanion(
      projectId: Value(r.projectId),
      chapterId: Value(r.chapterId),
      operation: Value(r.operation.name),
      anchor: Value(jsonEncode(r.anchor.toJson())),
      beforeText: Value(r.beforeText),
      afterText: Value(r.afterText),
      source: Value(r.source.name),
      status: Value(r.status.name),
      metadata: Value(
          r.metadata != null ? jsonEncode(r.metadata!.toJson()) : null),
      resolvedAt: Value(r.resolvedAt),
      updatedAt: Value(r.updatedAt),
      schemaVersion: Value(r.schemaVersion),
    );
  }
}
