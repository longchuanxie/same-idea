import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class NoteRepository {
  Future<AppResult<Note>> create(Note note);

  Future<AppResult<List<Note>>> list(String projectId);

  Future<AppResult<Note?>> get(String id);

  Future<AppResult<Note>> update(Note note);

  Future<AppResult<void>> delete(String id);
}
