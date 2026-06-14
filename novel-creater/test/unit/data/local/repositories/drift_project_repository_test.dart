import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_project_repository.dart';
import 'package:novel_creator/domain/entities/project.dart';

void main() {
  late AppDatabase db;
  late DriftProjectRepository repo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    repo = DriftProjectRepository(db);
  });

  tearDown(() async => await db.close());

  group('DriftProjectRepository', () {
    test('create returns success and persists project', () async {
      final now = DateTime.utc(2026, 6, 6);
      final project = Project(
        id: 'p1',
        name: 'Test Novel',
        description: 'A test novel project',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.create(project);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'p1');
      expect(result.valueOrNull?.name, 'Test Novel');

      // Verify it was persisted
      final get = await repo.get('p1');
      expect(get.isSuccess, true);
      expect(get.valueOrNull?.name, 'Test Novel');
      expect(get.valueOrNull?.description, 'A test novel project');
    });

    test('list returns all projects ordered by createdAt asc', () async {
      final base = DateTime.utc(2026, 6, 6);
      await repo.create(Project(
        id: 'p2',
        name: 'B Project',
        createdAt: base,
        updatedAt: base,
      ));
      await repo.create(Project(
        id: 'p1',
        name: 'A Project',
        createdAt: base.add(const Duration(hours: -1)),
        updatedAt: base.add(const Duration(hours: -1)),
      ));

      final result = await repo.list();
      expect(result.isSuccess, true);
      expect(result.valueOrNull, hasLength(2));
      expect(result.valueOrNull!.first.id, 'p1'); // earlier createdAt first
      expect(result.valueOrNull!.last.id, 'p2');
    });

    test('get returns null for missing id', () async {
      final result = await repo.get('nonexistent');
      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('saveContent updates name and description', () async {
      final now = DateTime.utc(2026, 6, 6);
      final original = Project(
        id: 'p1',
        name: 'Original Name',
        description: 'Original desc',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(original);

      final result = await repo.saveContent(Project(
        id: 'p1',
        name: 'Updated Name',
        description: 'Updated desc',
        createdAt: now,
        updatedAt: now,
      ));

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.name, 'Updated Name');
      expect(result.valueOrNull?.description, 'Updated desc');

      // Verify updatedAt was refreshed
      expect(result.valueOrNull!.updatedAt.isAfter(now), true);
    });

    test('saveContent returns failure for missing id', () async {
      final now = DateTime.utc(2026, 6, 6);
      final result = await repo.saveContent(Project(
        id: 'ghost',
        name: 'Ghost',
        createdAt: now,
        updatedAt: now,
      ));

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });
  });
}
