import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/chapter_mapper.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

void main() {
  const mapper = ChapterMapper();

  group('ChapterMapper', () {
    test('roundtrips draft chapter with content', () {
      final now = DateTime.utc(2026, 6, 6);
      final entity = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter One',
        markdownContent: '# Chapter One\n\nHello world.',
        plainTextCache: '# Chapter One\n\nHello world.',
        wordCount: 20,
        status: ChapterStatus.draft,
        createdAt: now,
        updatedAt: now,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, entity.id);
      expect(restored.projectId, entity.projectId);
      expect(restored.title, entity.title);
      expect(restored.markdownContent, entity.markdownContent);
      expect(restored.plainTextCache, entity.plainTextCache);
      expect(restored.wordCount, entity.wordCount);
      expect(restored.status, ChapterStatus.draft);
    });

    test('roundtrips reviewing chapter status', () {
      final now = DateTime.utc(2026, 6, 6);
      final entity = Chapter(
        id: 'c2',
        projectId: 'p1',
        title: 'Review Me',
        markdownContent: '',
        plainTextCache: '',
        status: ChapterStatus.reviewing,
        createdAt: now,
        updatedAt: now,
      );

      final restored = mapper.fromRow(mapper.toRow(entity));
      expect(restored.status, ChapterStatus.reviewing);
    });

    test('roundtrips all chapter statuses', () {
      final now = DateTime.utc(2026, 1, 1);
      for (final status in ChapterStatus.values) {
        final entity = Chapter(
          id: 'cx_${status.name}',
          projectId: 'p1',
          title: status.name,
          markdownContent: '',
          plainTextCache: '',
          status: status,
          createdAt: now,
          updatedAt: now,
        );
        final restored = mapper.fromRow(mapper.toRow(entity));
        expect(restored.status, status, reason: 'Failed for $status');
      }
    });
  });
}
