import 'package:novel_creator/domain/domain.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Revision', () {
    test('creates with default values', () {
      final now = DateTime.now();
      final revision = Revision(
        id: 'r1',
        projectId: 'p1',
        chapterId: 'c1',
        operation: RevisionOperation.replace,
        anchor: RevisionAnchor(type: AnchorType.selection, offset: 0, length: 10),
        beforeText: 'old text',
        afterText: 'new text',
        createdAt: now,
        updatedAt: now,
      );
      expect(revision.status, RevisionStatus.pending);
      expect(revision.source, RevisionSource.agent);
      expect(revision.isPending, isTrue);
      expect(revision.isTerminal, isFalse);
    });

    test('isPending is false when not pending', () {
      final now = DateTime.now();
      final revision = Revision(
        id: 'r1',
        projectId: 'p1',
        chapterId: 'c1',
        operation: RevisionOperation.replace,
        anchor: RevisionAnchor(type: AnchorType.selection, offset: 0, length: 10),
        beforeText: 'old text',
        afterText: 'new text',
        status: RevisionStatus.accepted,
        createdAt: now,
        updatedAt: now,
      );
      expect(revision.isPending, isFalse);
      expect(revision.isTerminal, isTrue);
    });
  });
}
