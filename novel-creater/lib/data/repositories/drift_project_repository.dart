import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/project_mapper.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftProjectRepository implements ProjectRepository {
  DriftProjectRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    ProjectMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const ProjectMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final ProjectMapper _mapper;

  @override
  Future<AppResult<Project>> create(Project project) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.projects).insert(_mapper.toRow(project));
        return AppResult<Project>.success(project);
      });

  @override
  Future<AppResult<List<Project>>> list() => _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.projects)
              ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
            .get();
        return AppResult<List<Project>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Project?>> get(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.projects)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<Project?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<Project>> saveContent(Project project) =>
      _errorMapper.wrapAsync(() async {
        final updated = project.copyWith(
          updatedAt: DateTime.now().toUtc(),
        );
        final count = await (_db.update(_db.projects)
              ..where((t) => t.id.equals(project.id)))
            .write(
          ProjectsCompanion(
            name: Value(updated.name),
            description: Value(updated.description),
            updatedAt: Value(updated.updatedAt.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<Project>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Project not found.',
              userMessage: '未找到项目。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return AppResult<Project>.success(updated);
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        await (_db.delete(_db.projects)..where((t) => t.id.equals(id))).go();
        return AppResult<void>.success(null);
      });
}
