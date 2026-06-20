import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_setting_entry_repository.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';

void main() {
  late AppDatabase db;
  late DriftSettingEntryRepository repo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    repo = DriftSettingEntryRepository(db);
  });

  tearDown(() async => await db.close());

  group('DriftSettingEntryRepository', () {
    test('create inserts and returns success', () async {
      final now = DateTime.utc(2025, 6, 1);

      final entry = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'Kingdom of Eldoria',
        content: 'A vast kingdom spanning three continents.',
        category: SettingCategory.geography,
        tags: ['kingdom', 'continent'],
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.create(entry);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'set_001');
      expect(result.valueOrNull?.title, 'Kingdom of Eldoria');
      expect(result.valueOrNull?.category, SettingCategory.geography);
    });

    test('list filters by projectId and orders by title ascending', () async {
      final baseTime = DateTime.utc(2025, 6, 1);

      // Entries for proj_01
      await repo.create(SettingEntry(
        id: 'set_b',
        projectId: 'proj_01',
        title: 'Magic System',
        content: '',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));
      await repo.create(SettingEntry(
        id: 'set_a',
        projectId: 'proj_01',
        title: 'Ancient History',
        content: '',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));

      // Entry for different project
      await repo.create(SettingEntry(
        id: 'set_c',
        projectId: 'proj_02',
        title: 'Other Project Entry',
        content: '',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));

      final result = await repo.list('proj_01');

      expect(result.isSuccess, true);
      expect(result.valueOrNull, hasLength(2));
      // Ordered by title ascending
      expect(result.valueOrNull!.first.title, 'Ancient History');
      expect(result.valueOrNull!.last.title, 'Magic System');
      // All belong to proj_01
      expect(
        result.valueOrNull!.every((e) => e.projectId == 'proj_01'),
        true,
      );
    });

    test('get returns setting entry by id', () async {
      final now = DateTime.utc(2025, 6, 1);

      final entry = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'Political Structure',
        content: 'Monarchy with advisory council.',
        category: SettingCategory.politics,
        tags: ['politics', 'government'],
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(entry);

      final result = await repo.get('set_001');

      expect(result.isSuccess, true);
      expect(result.valueOrNull != null, true);
      expect(result.valueOrNull!.title, 'Political Structure');
      expect(
        result.valueOrNull!.content,
        'Monarchy with advisory council.',
      );
      expect(result.valueOrNull!.category, SettingCategory.politics);
      expect(result.valueOrNull!.tags, ['politics', 'government']);
    });

    test('get returns null for missing id', () async {
      final result = await repo.get('nonexistent');

      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('update updates entry and returns updated entity', () async {
      final now = DateTime.utc(2025, 6, 1);

      final original = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'Original Title',
        content: 'Original content.',
        category: SettingCategory.other,
        tags: ['old'],
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(original);

      final updated = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'Updated Title',
        content: 'Updated content.',
        category: SettingCategory.history,
        tags: ['new', 'tag'],
        createdAt: now,
        updatedAt: now.add(const Duration(days: 2)),
      );

      final result = await repo.update(updated);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.title, 'Updated Title');
      expect(result.valueOrNull?.content, 'Updated content.');
      expect(result.valueOrNull?.category, SettingCategory.history);
      expect(result.valueOrNull?.tags, ['new', 'tag']);
    });

    test('update returns failure for missing entry', () async {
      final now = DateTime.utc(2025, 6, 1);

      final ghost = SettingEntry(
        id: 'ghost_set',
        projectId: 'proj_01',
        title: 'Ghost',
        content: '',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.update(ghost);

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });

    test('delete removes existing entry', () async {
      final now = DateTime.utc(2025, 6, 1);

      final entry = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'To Delete',
        content: '',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(entry);

      final result = await repo.delete('set_001');

      expect(result.isSuccess, true);

      // Verify it is gone
      final get = await repo.get('set_001');
      expect(get.valueOrNull == null, true);
    });

    test('delete returns failure for missing entry', () async {
      final result = await repo.delete('nonexistent');

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });
  });
}
