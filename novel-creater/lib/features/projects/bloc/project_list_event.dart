part of 'project_list_bloc.dart';

sealed class ProjectListEvent extends Equatable {
  const ProjectListEvent();

  @override
  List<Object?> get props => [];
}

final class ProjectListStarted extends ProjectListEvent {}

final class ProjectListRefreshed extends ProjectListEvent {}

final class ProjectListDeleteRequested extends ProjectListEvent {
  const ProjectListDeleteRequested({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}
