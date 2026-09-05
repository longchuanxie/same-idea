import '../entities/note.dart';

/// 笔记仓储接口
abstract class NoteRepository {
  Future<List<Note>> getNotesForBook(int bookId);
  Future<Note> addNote(Note note);
  Future<void> updateNote(Note note);
  Future<void> deleteNote(int id);
  Future<List<Note>> searchNotes(String query);
}
