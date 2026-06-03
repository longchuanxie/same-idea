import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/project_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';

void main() {
  late AppDatabase db;
  late ProjectRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repository = ProjectRepositoryImpl(db);
  });

  tearDown(() async {
    await db.close();
  });

  group('ProjectRepository', () {
    test('create and getById', () async {
      final now = DateTime.now();
      final project = Project(
        id: 'p1',
        title: 'Test Novel',
        author: 'Author',
        createdAt: now,
        updatedAt: now,
      );

      final createResult = await repository.create(project);
      expect(createResult.isSuccess, isTrue);

      final getResult = await repository.getById('p1');
      expect(getResult.isSuccess, isTrue);
      getResult.when(
        success: (p) {
          expect(p.id, 'p1');
          expect(p.title, 'Test Novel');
          expect(p.author, 'Author');
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('getAll returns all projects', () async {
      final now = DateTime.now();
      await repository.create(Project(
          id: 'p1', title: 'Novel 1', createdAt: now, updatedAt: now));
      await repository.create(Project(
          id: 'p2', title: 'Novel 2', createdAt: now, updatedAt: now));

      final result = await repository.getAll();
      expect(result.isSuccess, isTrue);
      result.when(
        success: (projects) => expect(projects.length, 2),
        failure: (_) => fail('Should not fail'),
      );
    });

    test('update persists changes', () async {
      final now = DateTime.now();
      await repository.create(Project(
          id: 'p1', title: 'Original', createdAt: now, updatedAt: now));

      final updated = Project(
          id: 'p1', title: 'Updated', createdAt: now, updatedAt: now);
      await repository.update(updated);

      final result = await repository.getById('p1');
      result.when(
        success: (p) => expect(p.title, 'Updated'),
        failure: (_) => fail('Should not fail'),
      );
    });

    test('delete removes project', () async {
      final now = DateTime.now();
      await repository.create(Project(
          id: 'p1', title: 'To Delete', createdAt: now, updatedAt: now));

      await repository.delete('p1');

      final result = await repository.getById('p1');
      expect(result.isFailure, isTrue);
    });

    test('getById returns failure for non-existent id', () async {
      final result = await repository.getById('nonexistent');
      expect(result.isFailure, isTrue);
      result.when(
        success: (_) => fail('Should not succeed'),
        failure: (error) => expect(error.code, 'NOT_FOUND'),
      );
    });
  });
}
