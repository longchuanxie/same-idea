import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/chapter_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';

void main() {
  late AppDatabase db;
  late ChapterRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repository = ChapterRepositoryImpl(db);
  });

  tearDown(() async {
    await db.close();
  });

  group('ChapterRepository', () {
    test('create and getById', () async {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'ch1',
        projectId: 'p1',
        title: 'Chapter One',
        order: 1,
        createdAt: now,
        updatedAt: now,
      );

      final createResult = await repository.create(chapter);
      expect(createResult.isSuccess, isTrue);

      final getResult = await repository.getById('ch1');
      expect(getResult.isSuccess, isTrue);
      getResult.when(
        success: (ch) {
          expect(ch.id, 'ch1');
          expect(ch.projectId, 'p1');
          expect(ch.title, 'Chapter One');
          expect(ch.order, 1);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('getByProjectId returns chapters for a project', () async {
      final now = DateTime.now();
      await repository.create(Chapter(
          id: 'ch1', projectId: 'p1', title: 'Ch1', order: 1, createdAt: now, updatedAt: now));
      await repository.create(Chapter(
          id: 'ch2', projectId: 'p1', title: 'Ch2', order: 2, createdAt: now, updatedAt: now));
      await repository.create(Chapter(
          id: 'ch3', projectId: 'p2', title: 'Ch3', order: 1, createdAt: now, updatedAt: now));

      final result = await repository.getByProjectId('p1');
      expect(result.isSuccess, isTrue);
      result.when(
        success: (chapters) {
          expect(chapters.length, 2);
          expect(chapters.every((c) => c.projectId == 'p1'), isTrue);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('saveContent updates content, plainTextCache, and wordCount', () async {
      final now = DateTime.now();
      await repository.create(Chapter(
          id: 'ch1', projectId: 'p1', title: 'Ch1', order: 1, createdAt: now, updatedAt: now));

      const content = '# Hello **World**\nThis is a test.';
      final saveResult = await repository.saveContent('ch1', content);
      expect(saveResult.isSuccess, isTrue);

      saveResult.when(
        success: (ch) {
          expect(ch.content, content);
          expect(ch.plainTextCache, isNotEmpty);
          expect(ch.plainTextCache, isNot(contains('#')));
          expect(ch.plainTextCache, isNot(contains('**')));
          expect(ch.wordCount, greaterThan(0));
          expect(ch.wordCount, ch.plainTextCache.length);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('update persists changes', () async {
      final now = DateTime.now();
      await repository.create(Chapter(
          id: 'ch1', projectId: 'p1', title: 'Original', order: 1, createdAt: now, updatedAt: now));

      final updated = Chapter(
          id: 'ch1', projectId: 'p1', title: 'Updated Title', order: 2, createdAt: now, updatedAt: now);
      await repository.update(updated);

      final result = await repository.getById('ch1');
      result.when(
        success: (ch) {
          expect(ch.title, 'Updated Title');
          expect(ch.order, 2);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('delete removes chapter', () async {
      final now = DateTime.now();
      await repository.create(Chapter(
          id: 'ch1', projectId: 'p1', title: 'To Delete', order: 1, createdAt: now, updatedAt: now));

      await repository.delete('ch1');

      final result = await repository.getById('ch1');
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
