part of 'project_list_bloc.dart';

class ProjectListState extends Equatable {
  const ProjectListState({
    this.projects = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Project> projects;
  final bool isLoading;
  final String? error;

  ProjectListState copyWith({
    List<Project>? projects,
    bool? isLoading,
    String? error,
  }) =>
      ProjectListState(
        projects: projects ?? this.projects,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  @override
  List<Object?> get props => [projects, isLoading, error];
}
