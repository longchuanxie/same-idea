import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/setting_entry_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';

void main() {
  late AppDatabase db;
  late SettingEntryRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repository = SettingEntryRepositoryImpl(db);
  });

  tearDown(() async {
    await db.close();
  });

  SettingEntry entry({
    required String id,
    String projectId = 'project-1',
    String category = '地理',
    String title = '旧城档案馆',
    String content = '雨夜仍然亮灯',
    List<String> tags = const ['地点'],
  }) {
    final now = DateTime(2026, 6, 4);
    return SettingEntry(
      id: id,
      projectId: projectId,
      category: category,
      title: title,
      content: content,
      tags: tags,
      createdAt: now,
      updatedAt: now,
    );
  }

  group('SettingEntryRepository', () {
    test('create and getById', () async {
      final createResult = await repository.create(entry(id: 'setting-1'));
      expect(createResult.isSuccess, isTrue);

      final getResult = await repository.getById('setting-1');
      expect(getResult.isSuccess, isTrue);
      final loaded = getResult.maybeSuccess!;
      expect(loaded.title, '旧城档案馆');
      expect(loaded.category, '地理');
      expect(loaded.tags, ['地点']);
    });

    test('getByProjectId and getByCategory filter entries', () async {
      await repository.create(entry(id: 'setting-1'));
      await repository.create(entry(id: 'setting-2', category: '规则'));
      await repository.create(
        entry(id: 'setting-3', projectId: 'project-2'),
      );

      final projectResult = await repository.getByProjectId('project-1');
      expect(projectResult.maybeSuccess, hasLength(2));

      final categoryResult = await repository.getByCategory('project-1', '地理');
      expect(categoryResult.maybeSuccess, hasLength(1));
      expect(categoryResult.maybeSuccess!.single.id, 'setting-1');
    });

    test('update persists changes', () async {
      await repository.create(entry(id: 'setting-1'));

      final updated = entry(
        id: 'setting-1',
        category: '规则',
        title: '闭馆门禁',
        content: '午夜后需要临时通行证',
        tags: ['规则', '冲突'],
      );
      final updateResult = await repository.update(updated);
      expect(updateResult.isSuccess, isTrue);

      final loaded = (await repository.getById('setting-1')).maybeSuccess!;
      expect(loaded.category, '规则');
      expect(loaded.title, '闭馆门禁');
      expect(loaded.tags, ['规则', '冲突']);
    });

    test('delete removes entry', () async {
      await repository.create(entry(id: 'setting-1'));

      final deleteResult = await repository.delete('setting-1');
      expect(deleteResult.isSuccess, isTrue);

      final getResult = await repository.getById('setting-1');
      expect(getResult.isFailure, isTrue);
    });

    test('getById returns failure for non-existent id', () async {
      final result = await repository.getById('missing');

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'NOT_FOUND');
    });
  });
}
