import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/outline_node_mapper.dart';
import 'package:novel_creator/domain/entities/outline_node.dart';
import 'package:novel_creator/domain/repositories/outline_node_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftOutlineNodeRepository implements OutlineNodeRepository {
  DriftOutlineNodeRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    OutlineNodeMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const OutlineNodeMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final OutlineNodeMapper _mapper;

  @override
  Future<AppResult<OutlineNode>> create(OutlineNode node) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.outlineNodes).insert(_mapper.toRow(node));
        return AppResult<OutlineNode>.success(node);
      });

  @override
  Future<AppResult<List<OutlineNode>>> list(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.outlineNodes)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([
                (t) => OrderingTerm.asc(t.sortOrder),
                (t) => OrderingTerm.asc(t.createdAt),
              ]))
            .get();
        return AppResult<List<OutlineNode>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<OutlineNode?>> get(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.outlineNodes)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<OutlineNode?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<OutlineNode>> update(OutlineNode node) =>
      _errorMapper.wrapAsync(() async {
        final now = DateTime.now().toUtc();
        final count = await (_db.update(_db.outlineNodes)
              ..where((t) => t.id.equals(node.id)))
            .write(
          OutlineNodesCompanion(
            title: Value(node.title),
            summary: Value(node.summary),
            chapterId: Value(node.chapterId),
            parentId: Value(node.parentId),
            sortOrder: Value(node.sortOrder),
            tagsJson: Value(_mapper.toRow(node).tagsJson),
            updatedAt: Value(now.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<OutlineNode>.failure(
            AppError(
              code: 'outline_node.not_found',
              message: 'Outline node not found.',
              userMessage: '未找到大纲节点。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        final row = await (_db.select(_db.outlineNodes)
              ..where((t) => t.id.equals(node.id)))
            .getSingle();
        return AppResult<OutlineNode>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<void>> delete(String id) =>
      _errorMapper.wrapAsync(() async {
        await (_db.delete(_db.outlineNodes)
              ..where((t) => t.id.equals(id)))
            .go();
        return const AppResult<void>.success(null);
      });

  @override
  Future<AppResult<List<OutlineNode>>> listChildren(String parentId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.outlineNodes)
              ..where((t) => t.parentId.equals(parentId))
              ..orderBy([
                (t) => OrderingTerm.asc(t.sortOrder),
                (t) => OrderingTerm.asc(t.createdAt),
              ]))
            .get();
        return AppResult<List<OutlineNode>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });
}
