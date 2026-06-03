part of 'editor_bloc.dart';

class EditorState extends Equatable {
  const EditorState({
    this.chapter,
    this.content = '',
    this.isSaving = false,
    this.saveError,
    this.lastSavedAt,
  });

  final Chapter? chapter;
  final String content;
  final bool isSaving;
  final String? saveError;
  final DateTime? lastSavedAt;

  int get wordCount {
    if (content.isEmpty) return 0;
    return content.replaceAll(RegExp(r'\s+'), ' ').trim().split(' ').where((w) => w.isNotEmpty).length;
  }

  bool get hasUnsavedChanges =>
      chapter != null && content != chapter!.content;

  EditorState copyWith({
    Chapter? chapter,
    String? content,
    bool? isSaving,
    String? saveError,
    DateTime? lastSavedAt,
  }) =>
      EditorState(
        chapter: chapter ?? this.chapter,
        content: content ?? this.content,
        isSaving: isSaving ?? this.isSaving,
        saveError: saveError,
        lastSavedAt: lastSavedAt ?? this.lastSavedAt,
      );

  @override
  List<Object?> get props => [
        chapter,
        content,
        isSaving,
        saveError,
        lastSavedAt,
      ];
}
