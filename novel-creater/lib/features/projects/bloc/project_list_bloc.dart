import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/features/projects/bloc/project_list_event.dart';
import 'package:novel_creator/features/projects/bloc/project_list_state.dart';

export 'package:novel_creator/features/projects/bloc/project_list_state.dart';

final class ProjectListBloc extends Bloc<ProjectListEvent, ProjectListState> {
  ProjectListBloc({required ProjectRepository projectRepository})
      : _projectRepository = projectRepository,
        super(const ProjectListState.initial()) {
    on<ProjectListStarted>(_onStarted);
    on<ProjectListRefreshed>(_onRefreshed);
    on<ProjectListCreated>(_onCreated);
    on<ProjectListDeleted>(_onDeleted);
  }

  final ProjectRepository _projectRepository;

  Future<void> _onStarted(
    ProjectListStarted event,
    Emitter<ProjectListState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));
    final result = await _projectRepository.list();
    switch (result) {
      case AppSuccess<List<Project>>(:final value):
        emit(state.copyWith(isLoading: false, projects: value));
      case AppFailure<List<Project>>(:final error):
        emit(state.copyWith(isLoading: false, error: error));
    }
  }

  Future<void> _onRefreshed(
    ProjectListRefreshed event,
    Emitter<ProjectListState> emit,
  ) async {
    final result = await _projectRepository.list();
    switch (result) {
      case AppSuccess<List<Project>>(:final value):
        emit(state.copyWith(projects: value, clearError: true));
      case AppFailure<List<Project>>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  Future<void> _onCreated(
    ProjectListCreated event,
    Emitter<ProjectListState> emit,
  ) async {
    final now = DateTime.now().toUtc();
    final project = Project(
      id: IdGenerator.create('project'),
      name: event.name,
      description: event.description,
      createdAt: now,
      updatedAt: now,
    );
    final result = await _projectRepository.create(project);
    switch (result) {
      case AppSuccess<Project>(:final value):
        emit(
          state.copyWith(
            projects: <Project>[...state.projects, value],
            clearError: true,
          ),
        );
      case AppFailure<Project>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  Future<void> _onDeleted(
    ProjectListDeleted event,
    Emitter<ProjectListState> emit,
  ) async {
    final result = await _projectRepository.delete(event.projectId);
    switch (result) {
      case AppSuccess<void>():
        emit(
          state.copyWith(
            projects: state.projects
                .where((p) => p.id != event.projectId)
                .toList(),
            clearError: true,
          ),
        );
      case AppFailure<void>(:final error):
        emit(state.copyWith(error: error));
    }
  }
}
