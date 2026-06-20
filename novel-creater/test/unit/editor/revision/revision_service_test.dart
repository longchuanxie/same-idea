import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';
import 'package:novel_creator/editor/revision/revision_service.dart';

void main() {
  group('RevisionService', () {
    const service = RevisionService();

    test('insert patch inserts text at anchor offset', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.insert,
        startOffset: 4,
        endOffset: 4,
        beforeText: '',
        afterText: 'old ',
      );

      final result = service.preview(baseContent: baseContent, patch: patch);

      expect(result.valueOrNull, equals('The old door opened.'));
    });

    test('insert patch rejects non-collapsed anchor range', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.insert,
        startOffset: 4,
        endOffset: 8,
        beforeText: '',
        afterText: 'old ',
      );

      final result = service.preview(baseContent: baseContent, patch: patch);

      expect(result.isFailure, isTrue);
      expect(result.errorOrNull?.code, equals('revision.invalid_anchor'));
    });

    test('insert patch rejects non-empty beforeText', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.insert,
        startOffset: 4,
        endOffset: 4,
        beforeText: 'door',
        afterText: 'old ',
      );

      final result = service.preview(baseContent: baseContent, patch: patch);

      expect(result.isFailure, isTrue);
      expect(result.errorOrNull?.code, equals('revision.before_text_mismatch'));
    });

    test('replace patch requires matching beforeText', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.replace,
        startOffset: 4,
        endOffset: 8,
        beforeText: 'door',
        afterText: 'gate',
      );

      final result = service.apply(baseContent: baseContent, patch: patch);

      expect(result.valueOrNull, equals('The gate opened.'));
    });

    test('delete patch removes only matching beforeText', () {
      const baseContent = 'The old door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.delete,
        startOffset: 4,
        endOffset: 8,
        beforeText: 'old ',
      );

      final result = service.apply(baseContent: baseContent, patch: patch);

      expect(result.valueOrNull, equals('The door opened.'));
    });

    test('mismatched baseContentHash returns revision conflict failure', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: 'Different content.',
        operation: RevisionOperation.insert,
        startOffset: 4,
        endOffset: 4,
        beforeText: '',
        afterText: 'old ',
      );

      final result = service.preview(baseContent: baseContent, patch: patch);

      expect(result.isFailure, isTrue);
      expect(result.errorOrNull?.code, equals('revision.conflict'));
    });

    test('beforeText mismatch returns before text mismatch failure', () {
      const baseContent = 'The door opened.';
      final patch = _patch(
        baseContent: baseContent,
        operation: RevisionOperation.replace,
        startOffset: 4,
        endOffset: 8,
        beforeText: 'wall',
        afterText: 'gate',
      );

      final result = service.apply(baseContent: baseContent, patch: patch);

      expect(result.isFailure, isTrue);
      expect(result.errorOrNull?.code, equals('revision.before_text_mismatch'));
    });

    test(
      'reject updates repository status without modifying content',
      () async {
        const baseContent = 'The door opened.';
        final repository = InMemoryRevisionRepository();
        final revision = _revision(
          patch: _patch(
            baseContent: baseContent,
            operation: RevisionOperation.replace,
            startOffset: 4,
            endOffset: 8,
            beforeText: 'door',
            afterText: 'gate',
          ),
        );
        await repository.create(revision);

        final rejectResult = await repository.updateStatus(
          id: revision.id,
          status: RevisionStatus.rejected,
        );
        final previewResult = service.preview(
          baseContent: baseContent,
          patch: revision.patch,
        );

        expect(
          rejectResult.valueOrNull?.status,
          equals(RevisionStatus.rejected),
        );
        expect(baseContent, equals('The door opened.'));
        expect(previewResult.valueOrNull, equals('The gate opened.'));
      },
    );
  });
}

RevisionPatch _patch({
  required String baseContent,
  required RevisionOperation operation,
  required int startOffset,
  required int endOffset,
  required String beforeText,
  String afterText = '',
}) =>
    RevisionPatch(
      chapterId: 'chapter-1',
      baseContentHash: contentHash(baseContent).toString(),
      operation: operation,
      anchor: RevisionAnchor(startOffset: startOffset, endOffset: endOffset),
      beforeText: beforeText,
      afterText: afterText,
      source: RevisionSource.agent,
      metadata: const RevisionPatchMetadata(
        prompt: 'revise',
        model: 'mock',
        summary: 'test patch',
      ),
    );

Revision _revision({required RevisionPatch patch}) {
  final now = DateTime.utc(2026);
  return Revision(
    id: 'revision-1',
    projectId: 'project-1',
    chapterId: patch.chapterId,
    patch: patch,
    createdAt: now,
    updatedAt: now,
  );
}
