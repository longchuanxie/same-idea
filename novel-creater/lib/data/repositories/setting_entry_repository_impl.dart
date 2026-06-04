import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class SettingEntryRepositoryImpl implements SettingEntryRepository {
  SettingEntryRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<SettingEntry>> getById(String id) async {
    try {
      final row = await (_db.select(_db.settingEntriesTable)
            ..where((table) => table.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return const AppResult.failure(
          AppError(
            code: 'NOT_FOUND',
            message: 'Setting entry not found',
            userMessage: 'Setting entry not found',
            recoverable: false,
            source: AppErrorSource.storage,
          ),
        );
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(
        _storageError(e, 'Failed to load setting entry'),
      );
    }
  }

  @override
  Future<AppResult<List<SettingEntry>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.settingEntriesTable)
            ..where((table) => table.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(_storageError(e, 'Failed to load settings'));
    }
  }

  @override
  Future<AppResult<List<SettingEntry>>> getByCategory(
    String projectId,
    String category,
  ) async {
    try {
      final rows = await (_db.select(_db.settingEntriesTable)
            ..where(
              (table) =>
                  table.projectId.equals(projectId) &
                  table.category.equals(category),
            ))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(_storageError(e, 'Failed to load settings'));
    }
  }

  @override
  Future<AppResult<SettingEntry>> create(SettingEntry entry) async {
    try {
      await _db.into(_db.settingEntriesTable).insert(_toCompanion(entry));
      return AppResult.success(entry);
    } catch (e) {
      return AppResult.failure(_storageError(e, 'Failed to create setting'));
    }
  }

  @override
  Future<AppResult<SettingEntry>> update(SettingEntry entry) async {
    try {
      await (_db.update(_db.settingEntriesTable)
            ..where((table) => table.id.equals(entry.id)))
          .write(_toUpdateCompanion(entry));
      return AppResult.success(entry);
    } catch (e) {
      return AppResult.failure(_storageError(e, 'Failed to update setting'));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.settingEntriesTable)
            ..where((table) => table.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(_storageError(e, 'Failed to delete setting'));
    }
  }

  SettingEntry _toEntity(SettingEntriesTableData row) => SettingEntry(
        id: row.id,
        projectId: row.projectId,
        category: row.category,
        title: row.title,
        content: row.content,
        tags: List<String>.from(
          row.tags.startsWith('[') ? jsonDecode(row.tags) as List : <String>[],
        ),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        schemaVersion: row.schemaVersion,
      );

  SettingEntriesTableCompanion _toCompanion(SettingEntry entry) =>
      SettingEntriesTableCompanion.insert(
        id: entry.id,
        projectId: entry.projectId,
        category: entry.category,
        title: entry.title,
        content: Value(entry.content),
        tags: Value(jsonEncode(entry.tags)),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        schemaVersion: Value(entry.schemaVersion),
      );

  SettingEntriesTableCompanion _toUpdateCompanion(SettingEntry entry) =>
      SettingEntriesTableCompanion(
        category: Value(entry.category),
        title: Value(entry.title),
        content: Value(entry.content),
        tags: Value(jsonEncode(entry.tags)),
        updatedAt: Value(entry.updatedAt),
        schemaVersion: Value(entry.schemaVersion),
      );

  AppError _storageError(Object error, String userMessage) => AppError(
        code: 'STORAGE_ERROR',
        message: error.toString(),
        userMessage: userMessage,
        source: AppErrorSource.storage,
      );
}
