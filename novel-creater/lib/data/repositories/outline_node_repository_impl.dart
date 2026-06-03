import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class OutlineNodeRepositoryImpl implements OutlineNodeRepository {
  OutlineNodeRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<OutlineNode>> getById(String id) async {
    try {
      final row = await (_db.select(_db.outlineNodesTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Outline node not found',
          userMessage: 'Outline node not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load outline node',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<OutlineNode>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.outlineNodesTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load outline nodes',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<OutlineNode>> create(OutlineNode node) async {
    try {
      await _db.into(_db.outlineNodesTable).insert(_toCompanion(node));
      return AppResult.success(node);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create outline node',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<OutlineNode>> update(OutlineNode node) async {
    try {
      await (_db.update(_db.outlineNodesTable)
            ..where((t) => t.id.equals(node.id)))
          .write(_toUpdateCompanion(node));
      return AppResult.success(node);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update outline node',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.outlineNodesTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete outline node',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> reorder(String projectId, List<String> orderedIds) async {
    try {
      await _db.transaction(() async {
        for (var i = 0; i < orderedIds.length; i++) {
          await (_db.update(_db.outlineNodesTable)
                ..where((t) => t.id.equals(orderedIds[i]) & t.projectId.equals(projectId)))
              .write(OutlineNodesTableCompanion(
            orderIndex: Value(i),
            updatedAt: Value(DateTime.now()),
          ));
        }
      });
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to reorder outline nodes',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  OutlineNode _toEntity(OutlineNodesTableData row) {
    return OutlineNode(
      id: row.id,
      projectId: row.projectId,
      parentId: row.parentId,
      order: row.orderIndex,
      title: row.title,
      nodeType: OutlineNodeType.values.byName(row.nodeType),
      summary: row.summary,
      linkedChapterId: row.linkedChapterId,
      status: OutlineNodeStatus.values.byName(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  OutlineNodesTableCompanion _toCompanion(OutlineNode n) {
    return OutlineNodesTableCompanion.insert(
      id: n.id,
      projectId: n.projectId,
      parentId: Value(n.parentId),
      orderIndex: n.order,
      title: n.title,
      nodeType: Value(n.nodeType.name),
      summary: Value(n.summary),
      linkedChapterId: Value(n.linkedChapterId),
      status: Value(n.status.name),
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      schemaVersion: Value(n.schemaVersion),
    );
  }

  OutlineNodesTableCompanion _toUpdateCompanion(OutlineNode n) {
    return OutlineNodesTableCompanion(
      parentId: Value(n.parentId),
      orderIndex: Value(n.order),
      title: Value(n.title),
      nodeType: Value(n.nodeType.name),
      summary: Value(n.summary),
      linkedChapterId: Value(n.linkedChapterId),
      status: Value(n.status.name),
      updatedAt: Value(n.updatedAt),
      schemaVersion: Value(n.schemaVersion),
    );
  }
}
