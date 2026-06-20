part of 'editor_bloc.dart';

class EditorState extends Equatable {
  const EditorState({
    this.chapter,
    this.title = '',
    this.content = '',
    this.isSaving = false,
    this.saveError,
    this.lastSavedAt,
  });

  final Chapter? chapter;
  final String title;
  final String content;
  final bool isSaving;
  final String? saveError;
  final DateTime? lastSavedAt;

  int get wordCount => countWritingUnits(content);

  bool get hasUnsavedChanges =>
      chapter != null &&
      (content != chapter!.content || title != chapter!.title);

  EditorState copyWith({
    Chapter? chapter,
    String? title,
    String? content,
    bool? isSaving,
    String? saveError,
    DateTime? lastSavedAt,
  }) =>
      EditorState(
        chapter: chapter ?? this.chapter,
        title: title ?? this.title,
        content: content ?? this.content,
        isSaving: isSaving ?? this.isSaving,
        saveError: saveError,
        lastSavedAt: lastSavedAt ?? this.lastSavedAt,
      );

  @override
  List<Object?> get props => [
        chapter,
        title,
        content,
        isSaving,
        saveError,
        lastSavedAt,
      ];
}
