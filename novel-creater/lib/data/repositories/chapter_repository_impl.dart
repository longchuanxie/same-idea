import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class ChapterRepositoryImpl implements ChapterRepository {
  ChapterRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Chapter>> getById(String id) async {
    try {
      final row = await (_db.select(_db.chaptersTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Chapter not found',
          userMessage: 'Chapter not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load chapter',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Chapter>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.chaptersTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load chapters',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) async {
    try {
      await _db.into(_db.chaptersTable).insert(_toCompanion(chapter));
      return AppResult.success(chapter);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create chapter',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Chapter>> saveContent(String id, String content) async {
    try {
      final plainText = content
          .replaceAll(RegExp(r'<[^>]*>'), '')
          .replaceAll(RegExp(r'[#*_\[\]()!]'), '');
      final wordCount = plainText.length;
      await (_db.update(_db.chaptersTable)..where((t) => t.id.equals(id)))
          .write(ChaptersTableCompanion(
        content: Value(content),
        plainTextCache: Value(plainText),
        wordCount: Value(wordCount),
        updatedAt: Value(DateTime.now()),
      ));
      final result = await getById(id);
      return result;
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to save content',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Chapter>> update(Chapter chapter) async {
    try {
      await (_db.update(_db.chaptersTable)
            ..where((t) => t.id.equals(chapter.id)))
          .write(_toUpdateCompanion(chapter));
      return AppResult.success(chapter);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update chapter',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.chaptersTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete chapter',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Stream<AppResult<Chapter>> watchById(String id) {
    return (_db.select(_db.chaptersTable)..where((t) => t.id.equals(id)))
        .watchSingleOrNull()
        .map((row) {
      if (row == null) {
        return AppResult<Chapter>.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Chapter not found',
          userMessage: 'Chapter not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    });
  }

  @override
  Stream<AppResult<List<Chapter>>> watchByProjectId(String projectId) {
    return (_db.select(_db.chaptersTable)
            ..where((t) => t.projectId.equals(projectId)))
        .watch()
        .map((rows) => AppResult.success(rows.map(_toEntity).toList()));
  }

  Chapter _toEntity(ChaptersTableData row) {
    return Chapter(
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      order: row.orderIndex,
      outlineNodeId: row.outlineNodeId,
      contentFormat: ContentFormat.values.byName(row.contentFormat),
      content: row.content,
      plainTextCache: row.plainTextCache,
      wordCount: row.wordCount,
      status: ChapterStatus.values.byName(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  ChaptersTableCompanion _toCompanion(Chapter c) {
    return ChaptersTableCompanion.insert(
      id: c.id,
      projectId: c.projectId,
      title: c.title,
      orderIndex: c.order,
      outlineNodeId: Value(c.outlineNodeId),
      contentFormat: Value(c.contentFormat.name),
      content: Value(c.content),
      plainTextCache: Value(c.plainTextCache),
      wordCount: Value(c.wordCount),
      status: Value(c.status.name),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      schemaVersion: Value(c.schemaVersion),
    );
  }

  ChaptersTableCompanion _toUpdateCompanion(Chapter c) {
    return ChaptersTableCompanion(
      projectId: Value(c.projectId),
      title: Value(c.title),
      orderIndex: Value(c.order),
      outlineNodeId: Value(c.outlineNodeId),
      contentFormat: Value(c.contentFormat.name),
      content: Value(c.content),
      plainTextCache: Value(c.plainTextCache),
      wordCount: Value(c.wordCount),
      status: Value(c.status.name),
      updatedAt: Value(c.updatedAt),
      schemaVersion: Value(c.schemaVersion),
    );
  }
}
