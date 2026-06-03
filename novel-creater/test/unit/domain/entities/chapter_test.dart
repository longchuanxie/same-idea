import 'package:novel_creator/domain/domain.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Chapter', () {
    test('creates with default values', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.status, ChapterStatus.draft);
      expect(chapter.contentFormat, ContentFormat.markdown);
      expect(chapter.content, '');
      expect(chapter.wordCount, 0);
    });

    test('effectiveWordCount uses plainTextCache when available', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        plainTextCache: 'Hello world',
        wordCount: 100,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.effectiveWordCount, 11);
    });

    test('effectiveWordCount falls back to wordCount', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        wordCount: 100,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.effectiveWordCount, 100);
    });

    test('serializes to and from JSON', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        createdAt: now,
        updatedAt: now,
      );
      final json = chapter.toJson();
      final restored = Chapter.fromJson(json);
      expect(restored.id, chapter.id);
      expect(restored.status, chapter.status);
    });
  });
}
