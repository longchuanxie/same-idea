import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class SnapshotRepositoryImpl implements SnapshotRepository {
  SnapshotRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Snapshot>> getById(String id) async {
    try {
      final row = await (_db.select(_db.snapshotsTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Snapshot not found',
          userMessage: 'Snapshot not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load snapshot',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Snapshot>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.snapshotsTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load snapshots',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Snapshot>> create(Snapshot snapshot) async {
    try {
      await _db.into(_db.snapshotsTable).insert(_toCompanion(snapshot));
      return AppResult.success(snapshot);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create snapshot',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.snapshotsTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete snapshot',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  Snapshot _toEntity(SnapshotsTableData row) {
    return Snapshot(
      id: row.id,
      projectId: row.projectId,
      description: row.description,
      trigger: SnapshotTrigger.values.byName(row.trigger),
      dataSnapshot: row.dataSnapshot,
      createdAt: row.createdAt,
      schemaVersion: row.schemaVersion,
    );
  }

  SnapshotsTableCompanion _toCompanion(Snapshot s) {
    return SnapshotsTableCompanion.insert(
      id: s.id,
      projectId: s.projectId,
      description: s.description,
      trigger: Value(s.trigger.name),
      dataSnapshot: Value(s.dataSnapshot),
      createdAt: s.createdAt,
      schemaVersion: Value(s.schemaVersion),
    );
  }
}
