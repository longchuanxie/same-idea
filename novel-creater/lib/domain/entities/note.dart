import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:novel_creator/domain/enums/note_category.dart';

part 'note.freezed.dart';
part 'note.g.dart';

@freezed
class Note with _$Note {
  const factory Note({
    required String id,
    required String projectId,
    required String title,
    required String content,
    @Default(NoteCategory.misc) NoteCategory category,
    @Default([]) List<String> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Note;

  factory Note.fromJson(Map<String, dynamic> json) => _$NoteFromJson(json);
}
