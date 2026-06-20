part of 'editor_bloc.dart';

sealed class EditorEvent extends Equatable {
  const EditorEvent();

  @override
  List<Object?> get props => [];
}

final class EditorChapterLoaded extends EditorEvent {
  const EditorChapterLoaded({required this.chapter});

  final Chapter chapter;

  @override
  List<Object?> get props => [chapter];
}

final class EditorContentChanged extends EditorEvent {
  const EditorContentChanged({required this.content});

  final String content;

  @override
  List<Object?> get props => [content];
}

final class EditorTitleChanged extends EditorEvent {
  const EditorTitleChanged({required this.title});

  final String title;

  @override
  List<Object?> get props => [title];
}

final class EditorSaveRequested extends EditorEvent {
  const EditorSaveRequested({this.completer});

  final Completer<bool>? completer;

  @override
  List<Object?> get props => [completer];
}
