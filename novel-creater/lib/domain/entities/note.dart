import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/note_type.dart';

part 'note.freezed.dart';
part 'note.g.dart';

@Freezed(toJson: true, fromJson: true)
class Note with _$Note {
  const factory Note({
    required String id,
    required String projectId,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default('') String content,
    @Default(NoteType.idea) NoteType type,
    String? sourceUrl,
    String? agentTaskId,
    @Default([]) List<String> tags,
    @Default(1) int schemaVersion,
  }) = _Note;

  factory Note.fromJson(Map<String, dynamic> json) =>
      _$NoteFromJson(json);
}
