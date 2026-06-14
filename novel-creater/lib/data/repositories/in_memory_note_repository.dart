import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryNoteRepository implements NoteRepository {
  final Map<String, Note> _notes = <String, Note>{};

  @override
  Future<AppResult<Note>> create(Note note) async {
    _notes[note.id] = note;
    return AppResult<Note>.success(note);
  }

  @override
  Future<AppResult<List<Note>>> list(String projectId) async {
    final notes = _notes.values
        .where((note) => note.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<Note>>.success(
      List<Note>.unmodifiable(notes),
    );
  }

  @override
  Future<AppResult<Note?>> get(String id) async =>
      AppResult<Note?>.success(_notes[id]);

  @override
  Future<AppResult<Note>> update(Note note) async {
    if (!_notes.containsKey(note.id)) {
      return const AppResult<Note>.failure(
        AppError(
          code: 'note.not_found',
          message: 'Note was not found.',
          userMessage: '未找到笔记，无法更新。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新笔记列表后重试。',
        ),
      );
    }

    final updated = note.copyWith(
      updatedAt: DateTime.now().toUtc(),
    );
    _notes[note.id] = updated;
    return AppResult<Note>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _notes.remove(id);
    return AppResult<void>.success(null);
  }
}
