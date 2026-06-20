import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/services/rule_based_timeline_builder.dart';

void main() {
  group('RuleBasedTimelineBuilder', () {
    const builder = RuleBasedTimelineBuilder();
    final now = DateTime.now().toUtc();

    test('builds timeline from chapters and characters', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '林风走进了房间。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
        Chapter(
          id: 'ch2',
          projectId: 'p1',
          title: '第二章',
          markdownContent: '',
          plainTextCache: '苏晴看到了林风。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: '林风',
          role: CharacterRole.protagonist,
          createdAt: now,
          updatedAt: now,
        ),
        Character(
          id: 'c2',
          projectId: 'p1',
          name: '苏晴',
          role: CharacterRole.supporting,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      expect(timeline.projectId, 'p1');
      expect(timeline.points, isNotEmpty);
      expect(timeline.characterIds, containsAll(['c1', 'c2']));
    });

    test('detects character via alias', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '小风走了过来。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: '林风',
          aliases: ['小风'],
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      expect(timeline.points, isNotEmpty);
      expect(timeline.points.first.characterId, 'c1');
    });

    test('sorts points by chapter order', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '林风出场。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
        Chapter(
          id: 'ch2',
          projectId: 'p1',
          title: '第二章',
          markdownContent: '',
          plainTextCache: '林风再次出场。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: '林风',
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      final charPoints = timeline.forCharacter('c1');
      expect(charPoints.length, 2);
      expect(charPoints.first.chapterOrder, 0);
      expect(charPoints.last.chapterOrder, 1);
    });

    test('filters by chapter', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '林风出场。苏晴也出场了。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
        Chapter(
          id: 'ch2',
          projectId: 'p1',
          title: '第二章',
          markdownContent: '',
          plainTextCache: '只有林风。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
            id: 'c1',
            projectId: 'p1',
            name: '林风',
            createdAt: now,
            updatedAt: now),
        Character(
            id: 'c2',
            projectId: 'p1',
            name: '苏晴',
            createdAt: now,
            updatedAt: now),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      final ch1Points = timeline.forChapter('ch1');
      expect(ch1Points.length, 2);
    });

    test('identifies related characters in same chapter', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '林风和苏晴一起出发。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
            id: 'c1',
            projectId: 'p1',
            name: '林风',
            createdAt: now,
            updatedAt: now),
        Character(
            id: 'c2',
            projectId: 'p1',
            name: '苏晴',
            createdAt: now,
            updatedAt: now),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      final linfengPoints = timeline.forCharacter('c1');
      expect(linfengPoints, isNotEmpty);
      expect(linfengPoints.first.relatedCharacterIds, contains('c2'));
    });

    test('returns empty timeline for no mentions', () {
      final chapters = [
        Chapter(
          id: 'ch1',
          projectId: 'p1',
          title: '第一章',
          markdownContent: '',
          plainTextCache: '一段没有角色名字的文字。',
          status: ChapterStatus.draft,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final characters = [
        Character(
            id: 'c1',
            projectId: 'p1',
            name: '林风',
            createdAt: now,
            updatedAt: now),
      ];

      final timeline = builder.buildTimeline(
        projectId: 'p1',
        chapters: chapters,
        characters: characters,
      );

      expect(timeline.points, isEmpty);
      expect(timeline.characterIds, isEmpty);
    });
  });
}
