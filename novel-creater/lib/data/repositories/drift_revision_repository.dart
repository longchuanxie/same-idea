import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/revision_mapper.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftRevisionRepository implements RevisionRepository {
  DriftRevisionRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    RevisionMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const RevisionMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final RevisionMapper _mapper;

  @override
  Future<AppResult<Revision>> create(Revision revision) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.revisions).insert(_mapper.toRow(revision));
        return AppResult<Revision>.success(revision);
      });

  @override
  Future<AppResult<List<Revision>>> listPending(String chapterId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.revisions)
              ..where((t) => t.chapterId.equals(chapterId) &
                  t.status.equals(RevisionStatus.pending.name))
              ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
            .get();
        return AppResult<List<Revision>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Revision>> updateStatus({
    required String id,
    required RevisionStatus status,
  }) =>
      _errorMapper.wrapAsync(() async {
        final currentRow = await (_db.select(_db.revisions)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (currentRow == null) {
          return const AppResult<Revision>.failure(
            AppError(
              code: 'revision.not_found',
              message: 'Revision not found.',
              userMessage: '未找到修订记录，无法更新状态。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }

        final currentRevision = _mapper.fromRow(currentRow);
        final validationError = currentRevision.validateTransition(status);
        if (validationError != null) {
          return AppResult<Revision>.failure(
            AppError(
              code: 'revision.invalid_transition',
              message: validationError,
              userMessage: '修订状态转换无效：$validationError',
              source: AppErrorSource.storage,
              recoverable: false,
            ),
          );
        }

        final now = DateTime.now().toUtc();
        await (_db.update(_db.revisions)..where((t) => t.id.equals(id))).write(
          RevisionsCompanion(
            status: Value(status.name),
            updatedAt: Value(now.millisecondsSinceEpoch),
          ),
        );

        final updatedRow = await (_db.select(_db.revisions)
              ..where((t) => t.id.equals(id)))
            .getSingle();
        return AppResult<Revision>.success(_mapper.fromRow(updatedRow));
      });
}
