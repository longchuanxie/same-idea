import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/revision_mapper.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

void main() {
  const mapper = RevisionMapper();

  Revision _makeRevision({
    RevisionStatus status = RevisionStatus.pending,
  }) {
    final now = DateTime.utc(2026, 6, 6);
    return Revision(
      id: 'r1',
      projectId: 'p1',
      chapterId: 'c1',
      patch: RevisionPatch(
        chapterId: 'c1',
        baseContentHash: 'abc123',
        operation: RevisionOperation.insert,
        anchor: const RevisionAnchor(startOffset: 0, endOffset: 0),
        beforeText: '',
        afterText: 'Inserted text',
        source: RevisionSource.agent,
        metadata: const RevisionPatchMetadata(
          prompt: 'continue writing',
          model: 'mock',
          taskId: 't1',
          summary: 'Add opening paragraph',
        ),
      ),
      status: status,
      createdAt: now,
      updatedAt: now,
    );
  }

  group('RevisionMapper', () {
    test('roundtrips pending revision with insert patch', () {
      final entity = _makeRevision();
      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, entity.id);
      expect(restored.projectId, entity.projectId);
      expect(restored.chapterId, entity.chapterId);
      expect(restored.status, RevisionStatus.pending);

      // Verify nested RevisionPatch roundtrip
      expect(restored.patch.chapterId, entity.patch.chapterId);
      expect(restored.patch.baseContentHash, entity.patch.baseContentHash);
      expect(restored.patch.operation, RevisionOperation.insert);
      expect(restored.patch.beforeText, '');
      expect(restored.patch.afterText, 'Inserted text');
      expect(restored.patch.source, RevisionSource.agent);
      expect(restored.patch.metadata.prompt, 'continue writing');
      expect(restored.patch.metadata.model, 'mock');
    });

    test('roundtrips accepted revision', () {
      final entity = _makeRevision(status: RevisionStatus.accepted);
      final restored = mapper.fromRow(mapper.toRow(entity));
      expect(restored.status, RevisionStatus.accepted);
    });

    test('roundtrips rejected revision', () {
      final entity = _makeRevision(status: RevisionStatus.rejected);
      final restored = mapper.fromRow(mapper.toRow(entity));
      expect(restored.status, RevisionStatus.rejected);
    });

    test('roundtrips replace operation patch', () {
      final now = DateTime.utc(2026, 6, 6);
      final entity = Revision(
        id: 'r2',
        projectId: 'p1',
        chapterId: 'c1',
        patch: RevisionPatch(
          chapterId: 'c1',
          baseContentHash: 'hash789',
          operation: RevisionOperation.replace,
          anchor: const RevisionAnchor(startOffset: 5, endOffset: 15),
          beforeText: 'old text',
          afterText: 'new improved text',
          source: RevisionSource.agent,
          metadata: const RevisionPatchMetadata(
            prompt: 'rewrite this passage',
            model: 'gpt-4o',
            taskId: 't2',
            summary: 'Improve prose quality',
          ),
        ),
        status: RevisionStatus.pending,
        createdAt: now,
        updatedAt: now,
      );

      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.patch.operation, RevisionOperation.replace);
      expect(restored.patch.anchor.startOffset, 5);
      expect(restored.patch.anchor.endOffset, 15);
      expect(restored.patch.beforeText, 'old text');
      expect(restored.patch.afterText, 'new improved text');
    });

    test('roundtrips all revision statuses', () {
      for (final status in RevisionStatus.values) {
        final entity = _makeRevision(status: status);
        final restored = mapper.fromRow(mapper.toRow(entity));
        expect(restored.status, status, reason: 'Failed for $status');
      }
    });
  });
}
