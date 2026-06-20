import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class ProjectRepositoryImpl implements ProjectRepository {
  ProjectRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Project>> getById(String id) async {
    try {
      final row = await (_db.select(_db.projectsTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Project not found',
          userMessage: 'Project not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load project',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Project>>> getAll() async {
    try {
      final rows = await _db.select(_db.projectsTable).get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load projects',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Project>> create(Project project) async {
    try {
      await _db.into(_db.projectsTable).insert(_toCompanion(project));
      return AppResult.success(project);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create project',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Project>> update(Project project) async {
    try {
      await (_db.update(_db.projectsTable)
            ..where((t) => t.id.equals(project.id)))
          .write(_toUpdateCompanion(project));
      return AppResult.success(project);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update project',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.projectsTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete project',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Stream<AppResult<Project>> watchById(String id) {
    return (_db.select(_db.projectsTable)..where((t) => t.id.equals(id)))
        .watchSingleOrNull()
        .map((row) {
      if (row == null) {
        return AppResult<Project>.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Project not found',
          userMessage: 'Project not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    });
  }

  Project _toEntity(ProjectsTableData row) {
    return Project(
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description,
      language: row.language,
      genre: row.genre,
      tags: List<String>.from(
        row.tags.startsWith('[')
            ? const JsonDecoder().convert(row.tags) as List
            : <String>[],
      ),
      defaultStyleProfileId: row.defaultStyleProfileId,
      activeChapterId: row.activeChapterId,
      localEncryptionEnabled: row.localEncryptionEnabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  ProjectsTableCompanion _toCompanion(Project p) {
    return ProjectsTableCompanion.insert(
      id: p.id,
      title: p.title,
      author: Value(p.author),
      description: Value(p.description),
      language: Value(p.language),
      genre: Value(p.genre),
      tags: Value(jsonEncode(p.tags)),
      defaultStyleProfileId: Value(p.defaultStyleProfileId),
      activeChapterId: Value(p.activeChapterId),
      localEncryptionEnabled: Value(p.localEncryptionEnabled),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      schemaVersion: Value(p.schemaVersion),
    );
  }

  ProjectsTableCompanion _toUpdateCompanion(Project p) {
    return ProjectsTableCompanion(
      title: Value(p.title),
      author: Value(p.author),
      description: Value(p.description),
      language: Value(p.language),
      genre: Value(p.genre),
      tags: Value(jsonEncode(p.tags)),
      defaultStyleProfileId: Value(p.defaultStyleProfileId),
      activeChapterId: Value(p.activeChapterId),
      localEncryptionEnabled: Value(p.localEncryptionEnabled),
      updatedAt: Value(p.updatedAt),
      schemaVersion: Value(p.schemaVersion),
    );
  }
}
