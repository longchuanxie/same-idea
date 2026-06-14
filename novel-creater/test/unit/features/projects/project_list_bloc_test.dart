import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';
import 'package:novel_creator/features/projects/bloc/project_list_event.dart';
import 'package:novel_creator/features/projects/bloc/project_list_state.dart';

void main() {
  late ProjectRepository repository;
  late ProjectListBloc bloc;

  setUp(() {
    repository = InMemoryProjectRepository();
    bloc = ProjectListBloc(projectRepository: repository);
  });

  tearDown(() async {
    await bloc.close();
  });

  Project _project(String id, {String name = 'Test Project'}) {
    final now = DateTime.utc(2026);
    return Project(
      id: id,
      name: name,
      createdAt: now,
      updatedAt: now,
    );
  }

  /// Wait for the bloc to emit a non-loading state after the current event.
  Future<ProjectListState> _waitForIdle(ProjectListBloc b) async {
    return b.stream.firstWhere((s) => !s.isLoading);
  }

  group('ProjectListStarted', () {
    test('emits empty list when no projects exist', () async {
      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      final state = await future;

      expect(state.isLoading, isFalse);
      expect(state.projects, isEmpty);
      expect(state.error, isNull);
    });

    test('emits existing projects', () async {
      await repository.create(_project('p1', name: 'Project A'));
      await repository.create(_project('p2', name: 'Project B'));

      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      final state = await future;

      expect(state.projects.length, 2);
      expect(state.projects[0].name, 'Project A');
      expect(state.projects[1].name, 'Project B');
    });
  });

  group('ProjectListRefreshed', () {
    test('refreshes project list', () async {
      final initFuture = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      await initFuture;

      await repository.create(_project('p1', name: 'New Project'));

      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListRefreshed());
      final state = await future;

      expect(state.projects.length, 1);
      expect(state.projects[0].name, 'New Project');
    });
  });

  group('ProjectListCreated', () {
    test('adds project to list', () async {
      final initFuture = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      await initFuture;

      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListCreated(name: 'My Novel'));
      final state = await future;

      expect(state.projects.length, 1);
      expect(state.projects[0].name, 'My Novel');
      expect(state.error, isNull);
    });

    test('adds project with description', () async {
      final initFuture = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      await initFuture;

      final future = _waitForIdle(bloc);
      bloc.add(
        const ProjectListCreated(name: 'My Novel', description: 'A great story'),
      );
      final state = await future;

      expect(state.projects.length, 1);
      expect(state.projects[0].description, 'A great story');
    });
  });

  group('ProjectListDeleted', () {
    test('removes project from list', () async {
      await repository.create(_project('p1', name: 'To Delete'));
      await repository.create(_project('p2', name: 'To Keep'));

      final initFuture = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      await initFuture;

      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListDeleted('p1'));
      final state = await future;

      expect(state.projects.length, 1);
      expect(state.projects[0].name, 'To Keep');
      expect(state.error, isNull);
    });

    test('handles deleting non-existent project gracefully', () async {
      final initFuture = _waitForIdle(bloc);
      bloc.add(const ProjectListStarted());
      await initFuture;

      final future = _waitForIdle(bloc);
      bloc.add(const ProjectListDeleted('nonexistent'));
      final state = await future;

      expect(state.projects, isEmpty);
      expect(state.error, isNull);
    });
  });
}
