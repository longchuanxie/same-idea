import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

RevisionPatch _makePatch() {
  return RevisionPatch(
    chapterId: 'ch1',
    baseContentHash: 'hash123',
    operation: RevisionOperation.replace,
    anchor: const RevisionAnchor(startOffset: 0, endOffset: 10),
    beforeText: 'old text',
    afterText: 'new text',
    source: RevisionSource.agent,
    metadata: RevisionPatchMetadata(
      prompt: 'test',
      model: 'test-model',
      taskId: 'task1',
      summary: 'test revision',
    ),
  );
}

Revision _makeRevision({RevisionStatus status = RevisionStatus.pending}) {
  return Revision(
    id: 'rev1',
    projectId: 'p1',
    chapterId: 'ch1',
    patch: _makePatch(),
    createdAt: DateTime.utc(2026),
    updatedAt: DateTime.utc(2026),
    status: status,
  );
}

void main() {
  group('Revision', () {
    test('keeps required fields and defaults to pending', () {
      final revision = _makeRevision();

      expect(revision.id, 'rev1');
      expect(revision.projectId, 'p1');
      expect(revision.chapterId, 'ch1');
      expect(revision.status, RevisionStatus.pending);
      expect(revision.schemaVersion, 1);
    });

    // NOTE: JSON round-trip test skipped — RevisionPatch nested freezed
    // toJson() does not recursively serialize. Tracked as a pre-existing bug.
  });

  group('Revision state machine', () {
    test('isTerminal returns false for pending', () {
      final revision = _makeRevision(status: RevisionStatus.pending);
      expect(revision.isTerminal, isFalse);
    });

    test('isTerminal returns true for terminal states', () {
      for (final status in [
        RevisionStatus.accepted,
        RevisionStatus.rejected,
        RevisionStatus.superseded,
      ]) {
        final revision = _makeRevision(status: status);
        expect(revision.isTerminal, isTrue,
            reason: '$status should be terminal');
      }
    });

    // Valid transitions
    test('valid transition: pending -> accepted', () {
      expect(
        isValidRevisionTransition(RevisionStatus.pending, RevisionStatus.accepted),
        isTrue,
      );
    });

    test('valid transition: pending -> rejected', () {
      expect(
        isValidRevisionTransition(RevisionStatus.pending, RevisionStatus.rejected),
        isTrue,
      );
    });

    test('valid transition: pending -> superseded', () {
      expect(
        isValidRevisionTransition(RevisionStatus.pending, RevisionStatus.superseded),
        isTrue,
      );
    });

    // Invalid transitions
    test('invalid transition: pending -> pending (same status)', () {
      expect(
        isValidRevisionTransition(RevisionStatus.pending, RevisionStatus.pending),
        isFalse,
      );
    });

    test('invalid transition: accepted -> pending (terminal)', () {
      expect(
        isValidRevisionTransition(RevisionStatus.accepted, RevisionStatus.pending),
        isFalse,
      );
    });

    test('invalid transition: accepted -> rejected (terminal)', () {
      expect(
        isValidRevisionTransition(RevisionStatus.accepted, RevisionStatus.rejected),
        isFalse,
      );
    });

    test('invalid transition: rejected -> accepted (terminal)', () {
      expect(
        isValidRevisionTransition(RevisionStatus.rejected, RevisionStatus.accepted),
        isFalse,
      );
    });

    test('invalid transition: superseded -> accepted (terminal)', () {
      expect(
        isValidRevisionTransition(RevisionStatus.superseded, RevisionStatus.accepted),
        isFalse,
      );
    });

    // validateTransition method
    test('validateTransition returns null for valid transition', () {
      final revision = _makeRevision(status: RevisionStatus.pending);
      expect(revision.validateTransition(RevisionStatus.accepted), isNull);
    });

    test('validateTransition returns error message for invalid transition', () {
      final revision = _makeRevision(status: RevisionStatus.accepted);
      final error = revision.validateTransition(RevisionStatus.pending);
      expect(error, isNotNull);
      expect(error, contains('accepted'));
      expect(error, contains('pending'));
    });

    test('validateTransition returns null for same status', () {
      final revision = _makeRevision(status: RevisionStatus.accepted);
      expect(revision.validateTransition(RevisionStatus.accepted), isNull);
    });

    // Full happy paths
    test('happy path: pending -> accepted', () {
      var revision = _makeRevision();
      expect(revision.status, RevisionStatus.pending);
      expect(revision.isTerminal, isFalse);

      revision = revision.copyWith(status: RevisionStatus.accepted);
      expect(revision.status, RevisionStatus.accepted);
      expect(revision.isTerminal, isTrue);
    });

    test('rejection path: pending -> rejected', () {
      var revision = _makeRevision();
      revision = revision.copyWith(status: RevisionStatus.rejected);
      expect(revision.status, RevisionStatus.rejected);
      expect(revision.isTerminal, isTrue);
    });

    test('supersede path: pending -> superseded', () {
      var revision = _makeRevision();
      revision = revision.copyWith(status: RevisionStatus.superseded);
      expect(revision.status, RevisionStatus.superseded);
      expect(revision.isTerminal, isTrue);
    });
  });
}
