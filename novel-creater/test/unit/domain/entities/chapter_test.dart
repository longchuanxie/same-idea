import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

void main() {
  group('Chapter', () {
    test('keeps required fields and defaults to draft', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);

      final chapter = Chapter(
        id: 'chapter-1',
        projectId: 'project-1',
        title: 'Opening',
        markdownContent: '# Opening',
        plainTextCache: 'Hello world',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      expect(chapter.id, 'chapter-1');
      expect(chapter.projectId, 'project-1');
      expect(chapter.title, 'Opening');
      expect(chapter.markdownContent, '# Opening');
      expect(chapter.plainTextCache, 'Hello world');
      expect(chapter.createdAt, createdAt);
      expect(chapter.updatedAt, updatedAt);
      expect(chapter.schemaVersion, 1);
      expect(chapter.status, ChapterStatus.draft);
      expect(chapter.wordCount, 0);
    });

    test('calculates effective word count from plain text cache', () {
      final chapter = Chapter(
        id: 'chapter-1',
        projectId: 'project-1',
        title: 'Opening',
        markdownContent: '# Opening',
        plainTextCache: 'Hello 世界',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(chapter.effectiveWordCount, 8);
    });

    test('serializes to and from json', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);
      final chapter = Chapter(
        id: 'chapter-1',
        projectId: 'project-1',
        title: 'Opening',
        markdownContent: '# Opening',
        plainTextCache: 'Hello world',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      final restored = Chapter.fromJson(chapter.toJson());

      expect(restored, chapter);
      expect(restored.effectiveWordCount, 11);
    });
  });

  group('Chapter state machine', () {
    Chapter _makeChapter({ChapterStatus status = ChapterStatus.draft}) {
      return Chapter(
        id: 'ch1',
        projectId: 'p1',
        title: 'Test',
        markdownContent: '',
        plainTextCache: '',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
        status: status,
      );
    }

    test('isTerminal returns false for non-terminal states', () {
      for (final status in [
        ChapterStatus.draft,
        ChapterStatus.reviewing,
        ChapterStatus.revised,
      ]) {
        final chapter = _makeChapter(status: status);
        expect(chapter.isTerminal, isFalse,
            reason: '$status should not be terminal');
      }
    });

    test('isTerminal returns true for terminal states', () {
      for (final status in [ChapterStatus.published, ChapterStatus.locked]) {
        final chapter = _makeChapter(status: status);
        expect(chapter.isTerminal, isTrue,
            reason: '$status should be terminal');
      }
    });

    // Valid transitions
    test('valid transition: draft -> reviewing', () {
      expect(isValidChapterTransition(ChapterStatus.draft, ChapterStatus.reviewing), isTrue);
    });

    test('valid transition: draft -> locked', () {
      expect(isValidChapterTransition(ChapterStatus.draft, ChapterStatus.locked), isTrue);
    });

    test('valid transition: reviewing -> revised', () {
      expect(isValidChapterTransition(ChapterStatus.reviewing, ChapterStatus.revised), isTrue);
    });

    test('valid transition: reviewing -> locked', () {
      expect(isValidChapterTransition(ChapterStatus.reviewing, ChapterStatus.locked), isTrue);
    });

    test('valid transition: revised -> published', () {
      expect(isValidChapterTransition(ChapterStatus.revised, ChapterStatus.published), isTrue);
    });

    test('valid transition: revised -> locked', () {
      expect(isValidChapterTransition(ChapterStatus.revised, ChapterStatus.locked), isTrue);
    });

    test('valid transition: published -> locked', () {
      expect(isValidChapterTransition(ChapterStatus.published, ChapterStatus.locked), isTrue);
    });

    // Invalid transitions
    test('invalid transition: draft -> published (skip reviewing/revised)', () {
      expect(isValidChapterTransition(ChapterStatus.draft, ChapterStatus.published), isFalse);
    });

    test('invalid transition: draft -> revised (skip reviewing)', () {
      expect(isValidChapterTransition(ChapterStatus.draft, ChapterStatus.revised), isFalse);
    });

    test('invalid transition: reviewing -> draft (no backward)', () {
      expect(isValidChapterTransition(ChapterStatus.reviewing, ChapterStatus.draft), isFalse);
    });

    test('invalid transition: revised -> reviewing (no backward)', () {
      expect(isValidChapterTransition(ChapterStatus.revised, ChapterStatus.reviewing), isFalse);
    });

    test('invalid transition: published -> draft (terminal state)', () {
      expect(isValidChapterTransition(ChapterStatus.published, ChapterStatus.draft), isFalse);
    });

    test('invalid transition: locked -> draft (terminal state)', () {
      expect(isValidChapterTransition(ChapterStatus.locked, ChapterStatus.draft), isFalse);
    });

    test('invalid transition: locked -> reviewing (terminal state)', () {
      expect(isValidChapterTransition(ChapterStatus.locked, ChapterStatus.reviewing), isFalse);
    });

    // validateTransition method
    test('validateTransition returns null for valid transition', () {
      final chapter = _makeChapter(status: ChapterStatus.draft);
      expect(chapter.validateTransition(ChapterStatus.reviewing), isNull);
    });

    test('validateTransition returns error message for invalid transition', () {
      final chapter = _makeChapter(status: ChapterStatus.draft);
      final error = chapter.validateTransition(ChapterStatus.published);
      expect(error, isNotNull);
      expect(error, contains('draft'));
      expect(error, contains('published'));
    });

    test('validateTransition returns null for same status', () {
      final chapter = _makeChapter(status: ChapterStatus.draft);
      expect(chapter.validateTransition(ChapterStatus.draft), isNull);
    });

    // Full happy path
    test('full happy path: draft -> reviewing -> revised -> published', () {
      var chapter = _makeChapter();
      expect(chapter.status, ChapterStatus.draft);
      expect(chapter.isTerminal, isFalse);

      chapter = chapter.copyWith(status: ChapterStatus.reviewing);
      expect(chapter.status, ChapterStatus.reviewing);

      chapter = chapter.copyWith(status: ChapterStatus.revised);
      expect(chapter.status, ChapterStatus.revised);

      chapter = chapter.copyWith(status: ChapterStatus.published);
      expect(chapter.status, ChapterStatus.published);
      expect(chapter.isTerminal, isTrue);
    });

    test('lock path: draft -> locked', () {
      var chapter = _makeChapter();
      chapter = chapter.copyWith(status: ChapterStatus.locked);
      expect(chapter.status, ChapterStatus.locked);
      expect(chapter.isTerminal, isTrue);
    });

    test('lock path: reviewing -> locked', () {
      var chapter = _makeChapter(status: ChapterStatus.reviewing);
      chapter = chapter.copyWith(status: ChapterStatus.locked);
      expect(chapter.isTerminal, isTrue);
    });
  });
}
