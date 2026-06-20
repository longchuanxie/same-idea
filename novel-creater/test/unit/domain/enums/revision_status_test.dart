import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';

void main() {
  group('RevisionStatus', () {
    test('pending can transition to accepted', () {
      expect(
        RevisionStatus.pending.canTransitionTo(RevisionStatus.accepted),
        isTrue,
      );
    });

    test('pending can transition to rejected', () {
      expect(
        RevisionStatus.pending.canTransitionTo(RevisionStatus.rejected),
        isTrue,
      );
    });

    test('pending can transition to superseded', () {
      expect(
        RevisionStatus.pending.canTransitionTo(RevisionStatus.superseded),
        isTrue,
      );
    });

    test('accepted cannot transition to anything', () {
      for (final target in RevisionStatus.values) {
        if (target == RevisionStatus.accepted) continue;
        expect(RevisionStatus.accepted.canTransitionTo(target), isFalse);
      }
    });

    test('isTerminal is true for terminal states', () {
      expect(RevisionStatus.accepted.isTerminal, isTrue);
      expect(RevisionStatus.rejected.isTerminal, isTrue);
      expect(RevisionStatus.superseded.isTerminal, isTrue);
      expect(RevisionStatus.pending.isTerminal, isFalse);
    });
  });
}
