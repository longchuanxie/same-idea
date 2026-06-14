import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/session_mapper.dart';
import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';
import 'package:novel_creator/domain/repositories/session_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftSessionRepository implements SessionRepository {
  DriftSessionRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    SessionMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const SessionMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final SessionMapper _mapper;

  @override
  Future<AppResult<Session>> create(Session session) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.sessions).insert(_mapper.toRow(session));
        return AppResult<Session>.success(session);
      });

  @override
  Future<AppResult<Session>> getById(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.sessions)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (row == null) {
          return const AppResult<Session>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Session not found.',
              userMessage: '未找到会话记录。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        return AppResult<Session>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<List<Session>>> listByProject(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.sessions)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Session>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<Session>>> listByStatus(
    String projectId,
    SessionStatus status,
  ) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.sessions)
              ..where(
                (t) =>
                    t.projectId.equals(projectId) &
                    t.status.equals(status.name),
              )
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Session>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Session>> updateStatus({
    required String id,
    required SessionStatus status,
    String? summary,
  }) =>
      _errorMapper.wrapAsync(() async {
        final currentRow = await (_db.select(_db.sessions)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (currentRow == null) {
          return const AppResult<Session>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Session not found.',
              userMessage: '未找到会话记录，无法更新状态。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }

        final currentSession = _mapper.fromRow(currentRow);
        final validationError = currentSession.validateTransition(status);
        if (validationError != null) {
          return AppResult<Session>.failure(
            AppError(
              code: 'session.invalid_transition',
              message: validationError,
              userMessage: '会话状态转换无效：$validationError',
              source: AppErrorSource.storage,
              recoverable: false,
            ),
          );
        }

        final now = DateTime.now().toUtc();
        final companion = SessionsCompanion(
          status: Value(status.name),
          summary: Value(summary),
          updatedAt: Value(now.millisecondsSinceEpoch),
        );
        await (_db.update(_db.sessions)..where((t) => t.id.equals(id)))
            .write(companion);

        final updatedRow = await (_db.select(_db.sessions)
              ..where((t) => t.id.equals(id)))
            .getSingle();
        return AppResult<Session>.success(_mapper.fromRow(updatedRow));
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        await (_db.delete(_db.sessions)..where((t) => t.id.equals(id))).go();
        return AppResult<void>.success(null);
      });
}
