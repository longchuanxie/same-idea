import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/results/app_error.dart';

final class ProjectListState {
  const ProjectListState({
    required this.isLoading,
    required this.projects,
    this.error,
  });

  const ProjectListState.initial()
      : isLoading = false,
        projects = const <Project>[],
        error = null;

  final bool isLoading;
  final List<Project> projects;
  final AppError? error;

  ProjectListState copyWith({
    bool? isLoading,
    List<Project>? projects,
    AppError? error,
    bool clearError = false,
  }) =>
      ProjectListState(
        isLoading: isLoading ?? this.isLoading,
        projects: projects ?? this.projects,
        error: clearError ? null : error ?? this.error,
      );
}
