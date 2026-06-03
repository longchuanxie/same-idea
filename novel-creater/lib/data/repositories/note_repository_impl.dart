import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class NoteRepositoryImpl implements NoteRepository {
  NoteRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Note>> getById(String id) async {
    try {
      final row = await (_db.select(_db.notesTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Note not found',
          userMessage: 'Note not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load note',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Note>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.notesTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load notes',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Note>>> getByType(String projectId, NoteType type) async {
    try {
      final rows = await (_db.select(_db.notesTable)
            ..where((t) => t.projectId.equals(projectId) & t.type.equals(type.name)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load notes',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Note>> create(Note note) async {
    try {
      await _db.into(_db.notesTable).insert(_toCompanion(note));
      return AppResult.success(note);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create note',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Note>> update(Note note) async {
    try {
      await (_db.update(_db.notesTable)
            ..where((t) => t.id.equals(note.id)))
          .write(_toUpdateCompanion(note));
      return AppResult.success(note);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update note',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.notesTable)..where((t) => t.id.equals(id))).go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete note',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  Note _toEntity(NotesTableData row) {
    return Note(
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      content: row.content,
      type: NoteType.values.byName(row.type),
      sourceUrl: row.sourceUrl,
      agentTaskId: row.agentTaskId,
      tags: List<String>.from(
        row.tags.startsWith('[')
            ? jsonDecode(row.tags) as List
            : <String>[],
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  NotesTableCompanion _toCompanion(Note n) {
    return NotesTableCompanion.insert(
      id: n.id,
      projectId: n.projectId,
      title: n.title,
      content: Value(n.content),
      type: Value(n.type.name),
      sourceUrl: Value(n.sourceUrl),
      agentTaskId: Value(n.agentTaskId),
      tags: Value(jsonEncode(n.tags)),
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      schemaVersion: Value(n.schemaVersion),
    );
  }

  NotesTableCompanion _toUpdateCompanion(Note n) {
    return NotesTableCompanion(
      title: Value(n.title),
      content: Value(n.content),
      type: Value(n.type.name),
      sourceUrl: Value(n.sourceUrl),
      agentTaskId: Value(n.agentTaskId),
      tags: Value(jsonEncode(n.tags)),
      updatedAt: Value(n.updatedAt),
      schemaVersion: Value(n.schemaVersion),
    );
  }
}
