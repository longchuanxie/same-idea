import 'package:novel_creator/domain/domain.dart';

abstract class NoteRepository {
  Future<AppResult<Note>> getById(String id);
  Future<AppResult<List<Note>>> getByProjectId(String projectId);
  Future<AppResult<List<Note>>> getByType(String projectId, NoteType type);
  Future<AppResult<Note>> create(Note note);
  Future<AppResult<Note>> update(Note note);
  Future<AppResult<void>> delete(String id);
}
