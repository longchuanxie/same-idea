part of 'create_project_bloc.dart';

sealed class CreateProjectEvent extends Equatable {
  const CreateProjectEvent();

  @override
  List<Object?> get props => [];
}

final class CreateProjectTitleChanged extends CreateProjectEvent {
  const CreateProjectTitleChanged({required this.title});

  final String title;

  @override
  List<Object?> get props => [title];
}

final class CreateProjectAuthorChanged extends CreateProjectEvent {
  const CreateProjectAuthorChanged({required this.author});

  final String author;

  @override
  List<Object?> get props => [author];
}

final class CreateProjectGenreChanged extends CreateProjectEvent {
  const CreateProjectGenreChanged({required this.genre});

  final String genre;

  @override
  List<Object?> get props => [genre];
}

final class CreateProjectLanguageChanged extends CreateProjectEvent {
  const CreateProjectLanguageChanged({required this.language});

  final String language;

  @override
  List<Object?> get props => [language];
}

final class CreateProjectSubmitted extends CreateProjectEvent {}
