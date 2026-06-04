import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/tools/tools.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/editor/revision/revision.dart';

void main() {
  final fixedNow = DateTime(2026, 6, 4, 14, 10);
  late _FakeChapterRepository chapterRepository;
  late _FakeRevisionRepository revisionRepository;
  late RevisionService service;

  setUp(() {
    chapterRepository = _FakeChapterRepository();
    revisionRepository = _FakeRevisionRepository();
    service = RevisionService(
      chapterRepository: chapterRepository,
      revisionRepository: revisionRepository,
      idGenerator: const IdGenerator(),
      clock: FixedClock(fixedNow),
    );
  });

  group('RevisionService', () {
    test('createPendingFromSuggestion stores base content hash', () async {
      final chapter = _chapter(content: '原文');
      chapterRepository.chapters[chapter.id] = chapter;

      final result = await service.createPendingFromSuggestion(
        WritingRevisionSuggestion(
          chapterId: chapter.id,
          operation: RevisionOperation.replace,
          anchor: const RevisionAnchor(
            type: AnchorType.selection,
            offset: 0,
            length: 2,
          ),
          beforeText: '原文',
          afterText: '新文',
          metadata: const RevisionPatchMetadata(
            prompt: 'rewrite',
            model: 'mock',
          ),
        ),
      );

      expect(result.isSuccess, isTrue);
      final revision = result.maybeSuccess!;
      expect(revision.status, RevisionStatus.pending);
      expect(revision.metadata?.baseContentHash, stableContentHash('原文'));
      expect(revisionRepository.revisions.length, 1);
    });

    test('accept replace revision updates chapter and marks accepted',
        () async {
      final chapter = _chapter(content: '旧文字');
      chapterRepository.chapters[chapter.id] = chapter;
      final revision = _revision(
        chapter: chapter,
        beforeText: '旧文',
        afterText: '新文',
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.accept(revision.id);

      expect(result.isSuccess, isTrue);
      expect(chapterRepository.chapters[chapter.id]!.content, '新文字');
      expect(chapterRepository.chapters[chapter.id]!.plainTextCache, '新文字');
      expect(chapterRepository.chapters[chapter.id]!.wordCount, 3);
      expect(result.maybeSuccess!.status, RevisionStatus.accepted);
      expect(result.maybeSuccess!.resolvedAt, fixedNow);
    });

    test('accept insert revision inserts text at anchor', () async {
      final chapter = _chapter(content: '前后');
      chapterRepository.chapters[chapter.id] = chapter;
      final revision = _revision(
        chapter: chapter,
        operation: RevisionOperation.insert,
        offset: 1,
        afterText: '中',
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.accept(revision.id);

      expect(result.isSuccess, isTrue);
      expect(chapterRepository.chapters[chapter.id]!.content, '前中后');
    });

    test('reject marks revision rejected without changing chapter', () async {
      final chapter = _chapter(content: '原文');
      chapterRepository.chapters[chapter.id] = chapter;
      final revision = _revision(
        chapter: chapter,
        beforeText: '原文',
        afterText: '新文',
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.reject(revision.id);

      expect(result.isSuccess, isTrue);
      expect(chapterRepository.chapters[chapter.id]!.content, '原文');
      expect(result.maybeSuccess!.status, RevisionStatus.rejected);
      expect(result.maybeSuccess!.resolvedAt, fixedNow);
    });

    test('accept detects conflict when chapter content changed', () async {
      final chapter = _chapter(content: '原文');
      chapterRepository.chapters[chapter.id] = chapter.copyWith(
        content: '用户已改原文',
      );
      final revision = _revision(
        chapter: chapter,
        beforeText: '原文',
        afterText: '新文',
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.accept(revision.id);

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'REVISION_CONFLICT');
      expect(chapterRepository.chapters[chapter.id]!.content, '用户已改原文');
      expect(
        revisionRepository.revisions[revision.id]!.status,
        RevisionStatus.pending,
      );
    });

    test('accept fails when anchor text no longer matches beforeText',
        () async {
      final chapter = _chapter(content: '原文');
      chapterRepository.chapters[chapter.id] = chapter;
      final revision = _revision(
        chapter: chapter,
        beforeText: '别的',
        afterText: '新文',
        baseContentHash: stableContentHash(chapter.content),
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.accept(revision.id);

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'REVISION_TEXT_MISMATCH');
      expect(chapterRepository.chapters[chapter.id]!.content, '原文');
    });

    test('supersede marks pending revision superseded', () async {
      final chapter = _chapter(content: '原文');
      chapterRepository.chapters[chapter.id] = chapter;
      final revision = _revision(
        chapter: chapter,
        beforeText: '原文',
        afterText: '新文',
      );
      revisionRepository.revisions[revision.id] = revision;

      final result = await service.supersede(revision.id);

      expect(result.isSuccess, isTrue);
      expect(result.maybeSuccess!.status, RevisionStatus.superseded);
      expect(chapterRepository.chapters[chapter.id]!.content, '原文');
    });
  });
}

Chapter _chapter({String content = ''}) => Chapter(
      id: 'chapter-1',
      projectId: 'project-1',
      title: 'Chapter',
      order: 1,
      content: content,
      createdAt: DateTime(2026, 6, 4),
      updatedAt: DateTime(2026, 6, 4),
    );

Revision _revision({
  required Chapter chapter,
  RevisionOperation operation = RevisionOperation.replace,
  String id = 'revision-1',
  int offset = 0,
  String beforeText = '',
  String afterText = '',
  String? baseContentHash,
}) =>
    Revision(
      id: id,
      projectId: chapter.projectId,
      chapterId: chapter.id,
      operation: operation,
      anchor: RevisionAnchor(
        type: AnchorType.selection,
        offset: offset,
        length: beforeText.length,
      ),
      beforeText: beforeText,
      afterText: afterText,
      metadata: RevisionPatchMetadata(
        baseContentHash: baseContentHash ?? stableContentHash(chapter.content),
      ),
      createdAt: DateTime(2026, 6, 4),
      updatedAt: DateTime(2026, 6, 4),
    );

class _FakeChapterRepository implements ChapterRepository {
  final chapters = <String, Chapter>{};

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) async {
    chapters[chapter.id] = chapter;
    return AppResult.success(chapter);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    chapters.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Chapter>> getById(String id) async {
    final chapter = chapters[id];
    if (chapter == null) {
      return const AppResult.failure(_notFoundError);
    }
    return AppResult.success(chapter);
  }

  @override
  Future<AppResult<List<Chapter>>> getByProjectId(String projectId) async =>
      AppResult.success(
        chapters.values
            .where((chapter) => chapter.projectId == projectId)
            .toList(),
      );

  @override
  Future<AppResult<Chapter>> saveContent(String id, String content) async {
    final chapter = chapters[id];
    if (chapter == null) {
      return const AppResult.failure(_notFoundError);
    }
    final updated = chapter.copyWith(content: content);
    chapters[id] = updated;
    return AppResult.success(updated);
  }

  @override
  Future<AppResult<Chapter>> update(Chapter chapter) async {
    chapters[chapter.id] = chapter;
    return AppResult.success(chapter);
  }

  @override
  Stream<AppResult<Chapter>> watchById(String id) async* {
    final result = await getById(id);
    yield result;
  }

  @override
  Stream<AppResult<List<Chapter>>> watchByProjectId(String projectId) async* {
    yield await getByProjectId(projectId);
  }
}

class _FakeRevisionRepository implements RevisionRepository {
  final revisions = <String, Revision>{};

  @override
  Future<AppResult<Revision>> create(Revision revision) async {
    revisions[revision.id] = revision;
    return AppResult.success(revision);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    revisions.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Revision>> getById(String id) async {
    final revision = revisions[id];
    if (revision == null) {
      return const AppResult.failure(_notFoundError);
    }
    return AppResult.success(revision);
  }

  @override
  Future<AppResult<List<Revision>>> getByChapterId(String chapterId) async =>
      AppResult.success(
        revisions.values
            .where((revision) => revision.chapterId == chapterId)
            .toList(),
      );

  @override
  Future<AppResult<List<Revision>>> getPendingByProjectId(
    String projectId,
  ) async =>
      AppResult.success(
        revisions.values
            .where(
              (revision) =>
                  revision.projectId == projectId &&
                  revision.status == RevisionStatus.pending,
            )
            .toList(),
      );

  @override
  Future<AppResult<Revision>> update(Revision revision) async {
    revisions[revision.id] = revision;
    return AppResult.success(revision);
  }
}

const _notFoundError = AppError(
  code: 'NOT_FOUND',
  message: 'Not found',
  userMessage: 'Not found',
  recoverable: false,
  source: AppErrorSource.storage,
);
