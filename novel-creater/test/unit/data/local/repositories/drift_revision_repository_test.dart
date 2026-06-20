import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/mappers/chapter_mapper.dart';
import 'package:novel_creator/data/local/mappers/project_mapper.dart';
import 'package:novel_creator/data/repositories/drift_chapter_repository.dart';
import 'package:novel_creator/data/repositories/drift_project_repository.dart';
import 'package:novel_creator/data/repositories/drift_revision_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

Revision _makeRevision({
  required String id,
  RevisionStatus status = RevisionStatus.pending,
}) {
  final now = DateTime.utc(2026, 6, 6);
  return Revision(
    id: id,
    projectId: 'p1',
    chapterId: 'c1',
    patch: RevisionPatch(
      chapterId: 'c1',
      baseContentHash: 'hash123',
      operation: RevisionOperation.insert,
      anchor: const RevisionAnchor(startOffset: 0, endOffset: 0),
      beforeText: '',
      afterText: 'Inserted text',
      source: RevisionSource.agent,
      metadata: const RevisionPatchMetadata(
        prompt: 'continue',
        model: 'mock',
        taskId: 't1',
        summary: 'Add text',
      ),
    ),
    status: status,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  late AppDatabase db;
  late DriftProjectRepository projectRepo;
  late DriftChapterRepository chapterRepo;
  late DriftRevisionRepository repo;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    projectRepo = DriftProjectRepository(db);
    chapterRepo = DriftChapterRepository(db);
    repo = DriftRevisionRepository(db);

    // Seed project + chapter for FK constraints
    final now = DateTime.utc(2026, 6, 6);
    await projectRepo.create(Project(
      id: 'p1',
      name: 'Test',
      createdAt: now,
      updatedAt: now,
    ));
    await chapterRepo.create(Chapter(
      id: 'c1',
      projectId: 'p1',
      title: 'Ch1',
      markdownContent: '',
      plainTextCache: '',
      createdAt: now,
      updatedAt: now,
    ));
  });

  tearDown(() async => await db.close());

  group('DriftRevisionRepository', () {
    test('create persists revision with patch', () async {
      final rev = _makeRevision(id: 'r1');
      final result = await repo.create(rev);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'r1');
      expect(result.valueOrNull?.status, RevisionStatus.pending);
      expect(result.valueOrNull?.patch.afterText, 'Inserted text');
    });

    test('listPending returns only pending revisions for chapter', () async {
      await repo.create(_makeRevision(id: 'r1'));
      await repo.create(_makeRevision(id: 'r2'));
      await repo.create(
        _makeRevision(id: 'r3', status: RevisionStatus.accepted),
      );

      final result = await repo.listPending('c1');
      expect(result.valueOrNull, hasLength(2));
      expect(
        result.valueOrNull!.every((r) => r.status == RevisionStatus.pending),
        true,
      );
    });

    test('updateStatus changes pending to accepted', () async {
      await repo.create(_makeRevision(id: 'r1'));

      final result = await repo.updateStatus(
        id: 'r1',
        status: RevisionStatus.accepted,
      );

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.status, RevisionStatus.accepted);

      // No longer in pending list
      final pending = await repo.listPending('c1');
      expect(pending.valueOrNull, isEmpty);
    });

    test('updateStatus returns failure for missing revision', () async {
      final result = await repo.updateStatus(
        id: 'ghost',
        status: RevisionStatus.rejected,
      );
      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'revision.not_found');
    });
  });
}
