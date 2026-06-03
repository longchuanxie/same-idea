import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/domain/domain.dart';

part 'project_list_event.dart';
part 'project_list_state.dart';

class ProjectListBloc extends Bloc<ProjectListEvent, ProjectListState> {
  ProjectListBloc({
    required ProjectRepository projectRepository,
  })  : _projectRepository = projectRepository,
        super(const ProjectListState()) {
    on<ProjectListStarted>(_onStarted);
    on<ProjectListRefreshed>(_onRefreshed);
    on<ProjectListDeleteRequested>(_onDeleteRequested);
  }

  final ProjectRepository _projectRepository;

  Future<void> _onStarted(
    ProjectListStarted event,
    Emitter<ProjectListState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _projectRepository.getAll();
    if (result.isSuccess) {
      emit(state.copyWith(
        projects: result.maybeSuccess!,
        isLoading: false,
      ));
    } else {
      emit(state.copyWith(
        isLoading: false,
        error: result.maybeFailure?.userMessage ?? 'Failed to load projects',
      ));
    }
  }

  Future<void> _onRefreshed(
    ProjectListRefreshed event,
    Emitter<ProjectListState> emit,
  ) async {
    final result = await _projectRepository.getAll();
    if (result.isSuccess) {
      emit(state.copyWith(
        projects: result.maybeSuccess!,
        isLoading: false,
        error: null,
      ));
    } else {
      emit(state.copyWith(
        isLoading: false,
        error: result.maybeFailure?.userMessage ?? 'Failed to refresh projects',
      ));
    }
  }

  Future<void> _onDeleteRequested(
    ProjectListDeleteRequested event,
    Emitter<ProjectListState> emit,
  ) async {
    final result = await _projectRepository.delete(event.projectId);
    if (result.isSuccess) {
      final updatedProjects = state.projects
          .where((p) => p.id != event.projectId)
          .toList();
      emit(state.copyWith(projects: updatedProjects));
    } else {
      emit(state.copyWith(
        error: result.maybeFailure?.userMessage ?? 'Failed to delete project',
      ));
    }
  }
}
