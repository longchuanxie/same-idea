import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_chapter_repository.dart';
import 'package:novel_creator/data/repositories/drift_project_repository.dart';
import 'package:novel_creator/data/repositories/drift_revision_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

/// Full-chain integration test: Project → Chapter → Revision → Accept
///
/// Verifies that the Drift persistence layer correctly supports the
/// complete write-review-accept workflow used by WorkspaceBloc.
void main() {
  late AppDatabase db;
  late DriftProjectRepository projectRepo;
  late DriftChapterRepository chapterRepo;
  late DriftRevisionRepository revisionRepo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    projectRepo = DriftProjectRepository(db);
    chapterRepo = DriftChapterRepository(db);
    revisionRepo = DriftRevisionRepository(db);
  });

  tearDown(() async => await db.close());

  group('Persistence integration', () {
    test('project → chapter → create revision → accept flow', () async {
      final now = DateTime.utc(2026, 6, 6);

      // Step 1: Create project
      final project = Project(
        id: 'proj-1',
        name: 'Test Novel',
        createdAt: now,
        updatedAt: now,
      );
      final createProjectResult = await projectRepo.create(project);
      expect(createProjectResult.isSuccess, true);
      expect(createProjectResult.valueOrNull?.name, 'Test Novel');

      // Step 2: Create chapter under project
      final chapter = Chapter(
        id: 'ch-1',
        projectId: 'proj-1',
        title: 'Chapter 1',
        markdownContent: 'Hello world.',
        plainTextCache: 'Hello world.',
        createdAt: now,
        updatedAt: now,
      );
      final createChapterResult = await chapterRepo.create(chapter);
      expect(createChapterResult.isSuccess, true);
      expect(createChapterResult.valueOrNull?.title, 'Chapter 1');

      // Step 3: Verify chapter is listable under project
      final chaptersResult = await chapterRepo.list('proj-1');
      expect(chaptersResult.valueOrNull, hasLength(1));
      expect(chaptersResult.valueOrNull!.single.id, 'ch-1');

      // Step 4: Create a pending revision (agent insert)
      final revision = Revision(
        id: 'rev-1',
        projectId: 'proj-1',
        chapterId: 'ch-1',
        patch: RevisionPatch(
          chapterId: 'ch-1',
          baseContentHash: 'hash001',
          operation: RevisionOperation.insert,
          anchor: const RevisionAnchor(startOffset: 12, endOffset: 12),
          beforeText: '',
          afterText: ' Inserted by agent.',
          source: RevisionSource.agent,
          metadata: const RevisionPatchMetadata(
            prompt: 'continue writing',
            model: 'test-model',
            taskId: 'task-1',
            summary: 'Agent continuation',
          ),
        ),
        status: RevisionStatus.pending,
        createdAt: now,
        updatedAt: now,
      );
      final createRevResult = await revisionRepo.create(revision);
      expect(createRevResult.isSuccess, true);
      expect(createRevResult.valueOrNull?.status, RevisionStatus.pending);

      // Step 5: Verify pending revisions are queryable
      final pendingResult = await revisionRepo.listPending('ch-1');
      expect(pendingResult.valueOrNull, hasLength(1));
      expect(
        pendingResult.valueOrNull!.single.patch.afterText,
        ' Inserted by agent.',
      );

      // Step 6: Accept the revision
      final acceptResult = await revisionRepo.updateStatus(
        id: 'rev-1',
        status: RevisionStatus.accepted,
      );
      expect(acceptResult.isSuccess, true);
      expect(acceptResult.valueOrNull?.status, RevisionStatus.accepted);

      // Step 7: Accepted revision no longer appears in pending list
      final pendingAfterAccept = await revisionRepo.listPending('ch-1');
      expect(pendingAfterAccept.valueOrNull, isEmpty);
    });

    test('chapter content persists across save cycles', () async {
      final now = DateTime.utc(2026, 6, 6);

      // Seed project
      await projectRepo.create(Project(
        id: 'p2',
        name: 'P2',
        createdAt: now,
        updatedAt: now,
      ));

      // Create chapter with initial content
      await chapterRepo.create(Chapter(
        id: 'c2',
        projectId: 'p2',
        title: 'Ch',
        markdownContent: 'Initial',
        plainTextCache: 'Initial',
        createdAt: now,
        updatedAt: now,
      ));

      // Save updated content
      const updated = 'Updated content with more text.';
      final saveResult = await chapterRepo.saveContent(
        id: 'c2',
        markdownContent: updated,
        plainTextCache: updated,
      );
      expect(saveResult.isSuccess, true);
      expect(saveResult.valueOrNull?.plainTextCache, updated);

      // Re-read and verify persistence
      final readResult = await chapterRepo.get('c2');
      expect(readResult.valueOrNull?.plainTextCache, updated);
    });

    test('multiple chapters under same project are isolated', () async {
      final now = DateTime.utc(2026, 6, 6);

      await projectRepo.create(Project(
        id: 'p3',
        name: 'P3',
        createdAt: now,
        updatedAt: now,
      ));

      await chapterRepo.create(Chapter(
        id: 'ca',
        projectId: 'p3',
        title: 'A',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      ));
      await chapterRepo.create(Chapter(
        id: 'cb',
        projectId: 'p3',
        title: 'B',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      ));

      // Revision under chapter A should not appear in chapter B's pending
      final revA = Revision(
        id: 'ra',
        projectId: 'p3',
        chapterId: 'ca',
        patch: RevisionPatch(
          chapterId: 'ca',
          baseContentHash: 'h',
          operation: RevisionOperation.insert,
          anchor: const RevisionAnchor(startOffset: 0, endOffset: 0),
          beforeText: '',
          afterText: 'text-a',
          source: RevisionSource.agent,
          metadata: const RevisionPatchMetadata(
            prompt: 'x',
            model: 'm',
            taskId: 't',
            summary: 's',
          ),
        ),
        status: RevisionStatus.pending,
        createdAt: now,
        updatedAt: now,
      );
      await revisionRepo.create(revA);

      final pendingB = await revisionRepo.listPending('cb');
      expect(pendingB.valueOrNull, isEmpty);

      final pendingA = await revisionRepo.listPending('ca');
      expect(pendingA.valueOrNull, hasLength(1));
    });
  });
}
