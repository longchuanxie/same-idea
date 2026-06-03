part of 'chapter_tree_bloc.dart';

class ChapterTreeState extends Equatable {
  const ChapterTreeState({
    this.chapters = const [],
    this.selectedChapterId,
    this.isLoading = false,
    this.error,
  });

  final List<Chapter> chapters;
  final String? selectedChapterId;
  final bool isLoading;
  final String? error;

  ChapterTreeState copyWith({
    List<Chapter>? chapters,
    String? selectedChapterId,
    bool? isLoading,
    String? error,
  }) =>
      ChapterTreeState(
        chapters: chapters ?? this.chapters,
        selectedChapterId: selectedChapterId,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  @override
  List<Object?> get props => [chapters, selectedChapterId, isLoading, error];
}
