import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_chapter_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

void main() {
  group('InMemoryProjectRepository', () {
    test('creates and lists projects per repository instance', () async {
      final repository = InMemoryProjectRepository();
      final project = _project(id: 'project-1', name: 'Novel');

      final createResult = await repository.create(project);
      final listResult = await repository.list();

      expect(createResult, isA<AppSuccess<Project>>());
      expect(createResult.valueOrNull, project);
      expect(listResult.valueOrNull, [project]);
    });
  });

  group('InMemoryChapterRepository', () {
    test('creates and lists chapters by project', () async {
      final repository = InMemoryChapterRepository();
      final chapter = _chapter(id: 'chapter-1', projectId: 'project-1');
      final otherChapter = _chapter(id: 'chapter-2', projectId: 'project-2');

      await repository.create(chapter);
      await repository.create(otherChapter);
      final listResult = await repository.list('project-1');

      expect(listResult.valueOrNull, [chapter]);
    });

    test('saves chapter content and updates derived fields', () async {
      final repository = InMemoryChapterRepository();
      final original = _chapter(
        id: 'chapter-1',
        projectId: 'project-1',
        markdownContent: 'old',
        plainTextCache: 'old',
      );

      await repository.create(original);
      final saveResult = await repository.saveContent(
        id: 'chapter-1',
        markdownContent: '**Hello** 世界',
        plainTextCache: 'Hello 世界',
      );

      final saved = saveResult.valueOrNull;
      expect(saved?.markdownContent, '**Hello** 世界');
      expect(saved?.plainTextCache, 'Hello 世界');
      expect(saved?.effectiveWordCount, 8);
      expect(saved?.wordCount, 8);
      expect(saved?.updatedAt.isAfter(original.updatedAt), isTrue);
    });

    test('returns failure when saving missing chapter', () async {
      final repository = InMemoryChapterRepository();

      final result = await repository.saveContent(
        id: 'missing-chapter',
        markdownContent: 'content',
        plainTextCache: 'content',
      );

      expect(result, isA<AppFailure<Chapter>>());
      expect(result.errorOrNull?.code, 'chapter.not_found');
      expect(result.errorOrNull?.userMessage, isNotEmpty);
    });
  });

  group('InMemoryRevisionRepository', () {
    test('creates revisions and lists pending revisions by chapter', () async {
      final repository = InMemoryRevisionRepository();
      final pending = _revision(id: 'revision-1', chapterId: 'chapter-1');
      final accepted = _revision(
        id: 'revision-2',
        chapterId: 'chapter-1',
        status: RevisionStatus.accepted,
      );
      final otherChapter = _revision(id: 'revision-3', chapterId: 'chapter-2');

      await repository.create(pending);
      await repository.create(accepted);
      await repository.create(otherChapter);
      final listResult = await repository.listPending('chapter-1');

      expect(listResult.valueOrNull, [pending]);
    });

    test('updates revision status and updatedAt', () async {
      final repository = InMemoryRevisionRepository();
      final revision = _revision(id: 'revision-1', chapterId: 'chapter-1');

      await repository.create(revision);
      final updateResult = await repository.updateStatus(
        id: 'revision-1',
        status: RevisionStatus.accepted,
      );

      final updated = updateResult.valueOrNull;
      expect(updated?.status, RevisionStatus.accepted);
      expect(updated?.updatedAt.isAfter(revision.updatedAt), isTrue);
    });
  });
}

Project _project({required String id, required String name}) {
  final now = DateTime.utc(2026);
  return Project(
    id: id,
    name: name,
    createdAt: now,
    updatedAt: now,
  );
}

Chapter _chapter({
  required String id,
  required String projectId,
  String markdownContent = '',
  String plainTextCache = '',
}) {
  final now = DateTime.utc(2026);
  return Chapter(
    id: id,
    projectId: projectId,
    title: 'Chapter $id',
    markdownContent: markdownContent,
    plainTextCache: plainTextCache,
    createdAt: now,
    updatedAt: now,
  );
}

Revision _revision({
  required String id,
  required String chapterId,
  RevisionStatus status = RevisionStatus.pending,
}) {
  final now = DateTime.utc(2026);
  return Revision(
    id: id,
    projectId: 'project-1',
    chapterId: chapterId,
    patch: RevisionPatch(
      chapterId: chapterId,
      baseContentHash: 'hash',
      operation: RevisionOperation.replace,
      anchor: const RevisionAnchor(startOffset: 0, endOffset: 3),
      beforeText: 'old',
      afterText: 'new',
      source: RevisionSource.agent,
      metadata: const RevisionPatchMetadata(
        prompt: 'rewrite',
        model: 'mock',
        summary: 'updated text',
      ),
    ),
    status: status,
    createdAt: now,
    updatedAt: now,
  );
}
