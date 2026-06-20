import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

void main() {
  group('ChapterStatus', () {
    test('draft can transition to reviewing', () {
      expect(
        ChapterStatus.draft.canTransitionTo(ChapterStatus.reviewing),
        isTrue,
      );
    });

    test('draft can transition to locked', () {
      expect(
        ChapterStatus.draft.canTransitionTo(ChapterStatus.locked),
        isTrue,
      );
    });

    test('reviewing can transition to revised', () {
      expect(
        ChapterStatus.reviewing.canTransitionTo(ChapterStatus.revised),
        isTrue,
      );
    });

    test('reviewing can transition to locked', () {
      expect(
        ChapterStatus.reviewing.canTransitionTo(ChapterStatus.locked),
        isTrue,
      );
    });

    test('revised can transition to published', () {
      expect(
        ChapterStatus.revised.canTransitionTo(ChapterStatus.published),
        isTrue,
      );
    });

    test('revised can transition to locked', () {
      expect(
        ChapterStatus.revised.canTransitionTo(ChapterStatus.locked),
        isTrue,
      );
    });

    test('published can transition to draft', () {
      expect(
        ChapterStatus.published.canTransitionTo(ChapterStatus.draft),
        isTrue,
      );
    });

    test('draft cannot transition to published directly', () {
      expect(
        ChapterStatus.draft.canTransitionTo(ChapterStatus.published),
        isFalse,
      );
    });

    test('locked cannot transition to published', () {
      expect(
        ChapterStatus.locked.canTransitionTo(ChapterStatus.published),
        isFalse,
      );
    });
  });
}
