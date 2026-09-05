import 'package:drift/drift.dart';

import '../../domain/entities/note.dart' as domain;
import '../../domain/repositories/note_repository.dart';
import '../database/app_database.dart' as db;

/// 笔记仓储的 drift 实现
class NoteRepositoryImpl implements NoteRepository {
  const NoteRepositoryImpl(this._db);

  final db.AppDatabase _db;

  @override
  Future<List<domain.Note>> getNotesForBook(int bookId) async {
    final rows = await (_db.select(_db.notes)
          ..where((t) => t.bookId.equals(bookId))
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
        .get();
    return rows.map(_toEntity).toList();
  }

  @override
  Future<domain.Note> addNote(domain.Note note) async {
    await _db.into(_db.notes).insert(_toCompanion(note));
    return note;
  }

  @override
  Future<void> updateNote(domain.Note note) async {
    await _db.update(_db.notes).replace(_toCompanion(note));
  }

  @override
  Future<void> deleteNote(int id) async {
    await (_db.delete(_db.notes)..where((t) => t.id.equals(id))).go();
  }

  @override
  Future<List<domain.Note>> searchNotes(String query) async {
    final pattern = '%$query%';
    final rows = await (_db.select(_db.notes)
          ..where((t) =>
              t.content.like(pattern) | t.highlightText.like(pattern)))
        .get();
    return rows.map(_toEntity).toList();
  }

  domain.Note _toEntity(db.Note row) {
    return domain.Note(
      id: row.id,
      bookId: row.bookId,
      type: domain.NoteType.values.firstWhere(
        (t) => t.name == row.type,
        orElse: () => domain.NoteType.annotation,
      ),
      content: row.content,
      highlightText: row.highlightText,
      position: row.position,
      chapterIndex: row.chapterIndex,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    );
  }

  db.NotesCompanion _toCompanion(domain.Note note) {
    return db.NotesCompanion(
      id: Value(note.id),
      bookId: Value(note.bookId),
      type: Value(note.type.name),
      content: Value(note.content),
      highlightText: Value(note.highlightText),
      position: Value(note.position),
      chapterIndex: Value(note.chapterIndex),
      createdAt: Value(note.createdAt ?? DateTime.now()),
      updatedAt: Value(note.updatedAt),
    );
  }
}
