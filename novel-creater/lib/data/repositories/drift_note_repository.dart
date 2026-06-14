import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/note_mapper.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftNoteRepository implements NoteRepository {
  DriftNoteRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    NoteMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const NoteMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final NoteMapper _mapper;

  @override
  Future<AppResult<Note>> create(Note note) => _errorMapper.wrapAsync(() async {
        await _db.into(_db.notes).insert(_mapper.toRow(note));
        return AppResult<Note>.success(note);
      });

  @override
  Future<AppResult<List<Note>>> list(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.notes)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
            .get();
        return AppResult<List<Note>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Note?>> get(String id) => _errorMapper.wrapAsync(() async {
        final row =
            await (_db.select(_db.notes)..where((t) => t.id.equals(id)))
                .getSingleOrNull();
        return AppResult<Note?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<Note>> update(Note note) => _errorMapper.wrapAsync(() async {
        final updated = note.copyWith(
          updatedAt: DateTime.now().toUtc(),
        );
        final count = await (_db.update(_db.notes)
              ..where((t) => t.id.equals(note.id)))
            .write(
          NotesCompanion(
            title: Value(updated.title),
            content: Value(updated.content),
            category: Value(updated.category.name),
            tagsJson: Value(jsonEncode(updated.tags)),
            updatedAt: Value(updated.updatedAt.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<Note>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Note not found.',
              userMessage: '未找到笔记。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return AppResult<Note>.success(updated);
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        final count =
            await (_db.delete(_db.notes)..where((t) => t.id.equals(id))).go();
        if (count == 0) {
          return const AppResult<void>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Note not found.',
              userMessage: '未找到笔记。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return const AppResult<void>.success(null);
      });
}
