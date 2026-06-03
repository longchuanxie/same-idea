part of 'chapter_tree_bloc.dart';

sealed class ChapterTreeEvent extends Equatable {
  const ChapterTreeEvent();

  @override
  List<Object?> get props => [];
}

final class ChapterTreeStarted extends ChapterTreeEvent {
  const ChapterTreeStarted({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

final class ChapterTreeChapterSelected extends ChapterTreeEvent {
  const ChapterTreeChapterSelected({required this.chapterId});

  final String chapterId;

  @override
  List<Object?> get props => [chapterId];
}

final class ChapterTreeChapterAdded extends ChapterTreeEvent {
  const ChapterTreeChapterAdded({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

final class ChapterTreeChapterRenamed extends ChapterTreeEvent {
  const ChapterTreeChapterRenamed({
    required this.chapterId,
    required this.newTitle,
  });

  final String chapterId;
  final String newTitle;

  @override
  List<Object?> get props => [chapterId, newTitle];
}

final class ChapterTreeChapterDeleted extends ChapterTreeEvent {
  const ChapterTreeChapterDeleted({required this.chapterId});

  final String chapterId;

  @override
  List<Object?> get props => [chapterId];
}
