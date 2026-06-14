import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_timeline_event_repository.dart';
import 'package:novel_creator/domain/entities/timeline_event.dart';

void main() {
  group('InMemoryTimelineEventRepository', () {
    late InMemoryTimelineEventRepository repo;

    setUp(() {
      repo = InMemoryTimelineEventRepository();
    });

    final now = DateTime.now().toUtc();

    test('create and list by character', () async {
      final event = TimelineEvent(
        id: 'te1',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: '林风出场',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(event);
      final result = await repo.listByCharacter('c1');
      expect(result.valueOrNull?.length, 1);
    });

    test('list by chapter', () async {
      await repo.create(TimelineEvent(
        id: 'te1',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: 'A',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(TimelineEvent(
        id: 'te2',
        projectId: 'p1',
        characterId: 'c2',
        chapterId: 'ch1',
        description: 'B',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      final result = await repo.listByChapter('ch1');
      expect(result.valueOrNull?.length, 2);
    });

    test('list by project', () async {
      await repo.create(TimelineEvent(
        id: 'te1',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: 'A',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(TimelineEvent(
        id: 'te2',
        projectId: 'p2',
        characterId: 'c1',
        chapterId: 'ch2',
        description: 'B',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      final result = await repo.listByProject('p1');
      expect(result.valueOrNull?.length, 1);
    });

    test('update event', () async {
      await repo.create(TimelineEvent(
        id: 'te1',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: 'Old',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      final event = (await repo.listByCharacter('c1')).valueOrNull!.first;
      final updated = event.copyWith(description: 'New');
      final result = await repo.update(updated);
      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull?.description, 'New');
    });

    test('delete event', () async {
      await repo.create(TimelineEvent(
        id: 'te1',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: 'ToDelete',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      await repo.delete('te1');
      final result = await repo.listByCharacter('c1');
      expect(result.valueOrNull, isEmpty);
    });

    test('update missing event returns failure', () async {
      final event = TimelineEvent(
        id: 'missing',
        projectId: 'p1',
        characterId: 'c1',
        chapterId: 'ch1',
        description: 'Ghost',
        chapterOrder: 0,
        createdAt: now,
        updatedAt: now,
      );
      final result = await repo.update(event);
      expect(result.isFailure, isTrue);
    });
  });
}
