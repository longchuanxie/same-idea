part of 'chapter_tree_bloc.dart';

class ChapterTreeState extends Equatable {
  const ChapterTreeState({
    this.chapters = const [],
    this.selectedChapterId,
    this.isLoading = false,
    this.error,
    this.projectTitle,
    this.projectId,
  });

  final List<Chapter> chapters;
  final String? selectedChapterId;
  final bool isLoading;
  final String? error;
  final String? projectTitle;
  final String? projectId;

  ChapterTreeState copyWith({
    List<Chapter>? chapters,
    String? selectedChapterId,
    bool? isLoading,
    String? error,
    String? projectTitle,
    String? projectId,
  }) =>
      ChapterTreeState(
        chapters: chapters ?? this.chapters,
        selectedChapterId: selectedChapterId,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        projectTitle: projectTitle ?? this.projectTitle,
        projectId: projectId ?? this.projectId,
      );

  @override
  List<Object?> get props => [
        chapters,
        selectedChapterId,
        isLoading,
        error,
        projectTitle,
        projectId,
      ];
}
