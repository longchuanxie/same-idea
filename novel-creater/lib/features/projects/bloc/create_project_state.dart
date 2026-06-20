part of 'create_project_bloc.dart';

class CreateProjectState extends Equatable {
  const CreateProjectState({
    this.title = '',
    this.author = '',
    this.genre = '',
    this.language = 'zh',
    this.isSubmitting = false,
    this.error,
    this.createdProjectId,
  });

  final String title;
  final String author;
  final String genre;
  final String language;
  final bool isSubmitting;
  final String? error;
  final String? createdProjectId;

  bool get isTitleValid => title.trim().isNotEmpty;

  CreateProjectState copyWith({
    String? title,
    String? author,
    String? genre,
    String? language,
    bool? isSubmitting,
    String? error,
    String? createdProjectId,
  }) =>
      CreateProjectState(
        title: title ?? this.title,
        author: author ?? this.author,
        genre: genre ?? this.genre,
        language: language ?? this.language,
        isSubmitting: isSubmitting ?? this.isSubmitting,
        error: error,
        createdProjectId: createdProjectId,
      );

  @override
  List<Object?> get props => [
        title,
        author,
        genre,
        language,
        isSubmitting,
        error,
        createdProjectId,
      ];
}
