import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/snapshot_mapper.dart';
import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';
import 'package:novel_creator/domain/repositories/snapshot_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftSnapshotRepository implements SnapshotRepository {
  DriftSnapshotRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    SnapshotMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const SnapshotMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final SnapshotMapper _mapper;

  @override
  Future<AppResult<Snapshot>> create(Snapshot snapshot) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.snapshots).insert(_mapper.toRow(snapshot));
        return AppResult<Snapshot>.success(snapshot);
      });

  @override
  Future<AppResult<Snapshot>> getById(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.snapshots)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (row == null) {
          return const AppResult<Snapshot>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Snapshot not found.',
              userMessage: '未找到快照记录。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        return AppResult<Snapshot>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<List<Snapshot>>> listByProject(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.snapshots)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Snapshot>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<Snapshot>>> listByType(
    String projectId,
    SnapshotType type,
  ) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.snapshots)
              ..where(
                (t) =>
                    t.projectId.equals(projectId) &
                    t.type.equals(type.name),
              )
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Snapshot>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<Snapshot>>> listByChapter(
    String projectId,
    String chapterId,
  ) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.snapshots)
              ..where(
                (t) =>
                    t.projectId.equals(projectId) &
                    t.chapterId.equals(chapterId),
              )
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Snapshot>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        await (_db.delete(_db.snapshots)..where((t) => t.id.equals(id))).go();
        return AppResult<void>.success(null);
      });
}
