import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/agent/agent_mode_service.dart';
import 'package:novel_creator/agent/mock_writing_tool.dart';
import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/repositories/in_memory_character_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_chapter_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_note_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_setting_entry_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';
import 'package:novel_creator/editor/revision/revision_service.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_event.dart';

void main() {
  WorkspaceBloc buildBloc({
    ChapterRepository? chapterRepository,
    Duration debounceDuration = const Duration(milliseconds: 10),
  }) =>
      WorkspaceBloc(
        projectRepository: InMemoryProjectRepository(),
        chapterRepository: chapterRepository ?? InMemoryChapterRepository(),
        revisionRepository: InMemoryRevisionRepository(),
        revisionService: const RevisionService(),
        agentModeService: const AgentModeService(),
        writingTool: const MockWritingTool(),
        characterRepository: InMemoryCharacterRepository(),
        settingEntryRepository: InMemorySettingEntryRepository(),
        noteRepository: InMemoryNoteRepository(),
        eventBus: AppEventBus(),
        debounceDuration: debounceDuration,
      );

  Future<void> startWorkspace(WorkspaceBloc bloc) async {
    bloc.add(const WorkspaceStarted());
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter,
          'selectedChapter',
          isNotNull,
        ),
      ),
    );
  }

  test('WorkspaceStarted creates a demo project and first chapter', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);

    bloc.add(const WorkspaceStarted());

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having((state) => state.isLoading, 'isLoading', isFalse)
            .having((state) => state.project?.name, 'project name', '示例项目')
            .having((state) => state.chapters.length, 'chapters length', 1)
            .having(
              (state) => state.selectedChapter?.title,
              'selected chapter title',
              '第一章',
            )
            .having(
              (state) => state.agentMode,
              'agent mode',
              AgentMode.writing,
            ),
      ),
    );
  });

  test(
    'ChapterContentChanged debounces save and updates save status',
    () async {
      final bloc = buildBloc();
      addTearDown(bloc.close);
      await startWorkspace(bloc);

      bloc.add(const ChapterContentChanged('新的正文'));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<WorkspaceState>().having(
            (state) => state.saveStatusLabel,
            'save status before debounce',
            '保存中',
          ),
        ),
      );

      await Future<void>.delayed(const Duration(milliseconds: 20));

      expect(bloc.state.selectedChapter?.markdownContent, '新的正文');
      expect(bloc.state.chapters.first.markdownContent, '新的正文');
      expect(bloc.state.saveStatusLabel, '已保存');
    },
  );

  test('ChapterContentChanged saves only the latest debounced edit', () async {
    final chapterRepository = _RecordingChapterRepository();
    final bloc = buildBloc(chapterRepository: chapterRepository);
    addTearDown(bloc.close);
    await startWorkspace(bloc);

    bloc
      ..add(const ChapterContentChanged('第一版'))
      ..add(const ChapterContentChanged('第二版'));

    expect(chapterRepository.saveContentCallCount, 0);

    await Future<void>.delayed(const Duration(milliseconds: 20));

    expect(chapterRepository.saveContentCallCount, 1);
    expect(chapterRepository.savedMarkdownContents, <String>['第二版']);
    expect(bloc.state.selectedChapter?.markdownContent, '第二版');
  });

  test('close flushes pending debounced save before disposing', () async {
    final chapterRepository = _RecordingChapterRepository();
    final bloc = buildBloc(
      chapterRepository: chapterRepository,
      debounceDuration: const Duration(milliseconds: 30),
    );
    await startWorkspace(bloc);

    bloc.add(const ChapterContentChanged('关闭前正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.saveStatusLabel,
          'save status before close',
          '保存中',
        ),
      ),
    );

    await bloc.close();
    await Future<void>.delayed(const Duration(milliseconds: 60));

    expect(chapterRepository.saveContentCallCount, 1);
    expect(chapterRepository.savedMarkdownContents, <String>['关闭前正文']);
  });

  test(
    'AgentSuggestionRequested stores suggestion without changing content',
    () async {
      final bloc = buildBloc();
      addTearDown(bloc.close);
      await startWorkspace(bloc);
      bloc.add(const ChapterContentChanged('原正文'));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<WorkspaceState>().having(
            (state) => state.selectedChapter?.markdownContent,
            'content before suggestion',
            '原正文',
          ),
        ),
      );

      bloc.add(const AgentSuggestionRequested(targetLength: 120));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<WorkspaceState>()
              .having(
                (state) => state.agentSuggestion,
                'agent suggestion',
                contains('Mock continuation'),
              )
              .having(
                (state) => state.selectedChapter?.markdownContent,
                'unchanged content',
                '原正文',
              ),
        ),
      );
    },
  );

  test('PendingRevisionCreated creates pending revision', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    bloc.add(const ChapterContentChanged('正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'saved content',
          '正文',
        ),
      ),
    );

    bloc.add(const PendingRevisionCreated(afterText: '新增'));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.pendingRevisions.length,
              'pending revisions length',
              1,
            )
            .having(
              (state) => state.pendingRevisions.first.status,
              'revision status',
              RevisionStatus.pending,
            )
            .having(
              (state) => state.pendingRevisions.first.patch.baseContentHash,
              'base content hash',
              contentHash('正文').toString(),
            ),
      ),
    );
  });

  test('RevisionAccepted applies patch and marks revision accepted', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    bloc.add(const ChapterContentChanged('正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'saved content',
          '正文',
        ),
      ),
    );
    bloc.add(const PendingRevisionCreated(afterText: '新增'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;

    bloc.add(RevisionAccepted(revisionId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.selectedChapter?.markdownContent,
              'accepted content',
              '正文新增',
            )
            .having(
              (state) => state.pendingRevisions.first.status,
              'revision status',
              RevisionStatus.accepted,
            ),
      ),
    );
  });

  test('ChapterSelected surfaces pending revision list failure', () async {
    final revisionRepository = _FailingListPendingRevisionRepository();
    final bloc = WorkspaceBloc(
      projectRepository: InMemoryProjectRepository(),
      chapterRepository: InMemoryChapterRepository(),
      revisionRepository: revisionRepository,
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final chapterId = bloc.state.selectedChapter!.id;

    bloc.add(ChapterSelected(chapterId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.error?.code,
              'error code',
              'revision.list_pending_failed',
            )
            .having(
              (state) => state.pendingRevisions,
              'pending revisions unchanged',
              isEmpty,
            ),
      ),
    );
  });

  test('RevisionAccepted saves content before final accepted status', () async {
    final chapterRepository = _RecordingChapterRepository();
    final revisionRepository = _FailingUpdateRevisionRepository();
    final bloc = WorkspaceBloc(
      projectRepository: InMemoryProjectRepository(),
      chapterRepository: chapterRepository,
      revisionRepository: revisionRepository,
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    bloc.add(const ChapterContentChanged('正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'saved content',
          '正文',
        ),
      ),
    );
    bloc.add(const PendingRevisionCreated(afterText: '新增'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;

    bloc.add(RevisionAccepted(revisionId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.error?.code,
              'error code',
              'revision.update_failed',
            )
            .having(
              (state) => state.selectedChapter?.markdownContent,
              'saved content',
              '正文新增',
            )
            .having(
              (state) => state.pendingRevisions.first.status,
              'revision remains pending',
              RevisionStatus.pending,
            ),
      ),
    );
    expect(chapterRepository.savedMarkdownContents, contains('正文新增'));
  });

  test('RevisionAccepted does not accept revision when content save fails',
      () async {
    final chapterRepository = _FailingSaveChapterRepository();
    final bloc = buildBloc(chapterRepository: chapterRepository);
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    bloc.add(const PendingRevisionCreated(afterText: '新增'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;

    bloc.add(RevisionAccepted(revisionId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.error?.code,
              'error code',
              'chapter.save_failed',
            )
            .having(
              (state) => state.selectedChapter?.markdownContent,
              'unchanged content',
              '',
            )
            .having(
              (state) => state.pendingRevisions.first.status,
              'revision remains pending',
              RevisionStatus.pending,
            ),
      ),
    );
  });

  test('RevisionAccepted cancels stale debounced save before applying patch',
      () async {
    final chapterRepository = _RecordingChapterRepository();
    final bloc = buildBloc(
      chapterRepository: chapterRepository,
      debounceDuration: const Duration(milliseconds: 50),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);

    bloc.add(const ChapterContentChanged('正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'draft content',
          '正文',
        ),
      ),
    );
    bloc.add(const PendingRevisionCreated(afterText: '新增'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;

    bloc.add(RevisionAccepted(revisionId));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'accepted content',
          '正文新增',
        ),
      ),
    );
    await Future<void>.delayed(const Duration(milliseconds: 80));

    expect(bloc.state.selectedChapter?.markdownContent, '正文新增');
    expect(chapterRepository.savedMarkdownContents, <String>['正文新增']);
  });

  test('PendingRevisionCreated rejects patch for another chapter', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final chapter = bloc.state.selectedChapter!;
    final patch = _patchForChapter(
      chapterId: 'other-chapter',
      baseContent: chapter.markdownContent,
      startOffset: 0,
      afterText: '新增',
    );

    bloc.add(PendingRevisionCreated(patch: patch));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.error?.code,
              'error code',
              'workspace.patch_chapter_mismatch',
            )
            .having(
              (state) => state.pendingRevisions,
              'pending revisions unchanged',
              isEmpty,
            ),
      ),
    );
  });

  test('RevisionAccepted rejects patch for another selected chapter', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final firstChapter = bloc.state.selectedChapter!;
    final firstPatch = _patchForChapter(
      chapterId: firstChapter.id,
      baseContent: firstChapter.markdownContent,
      startOffset: 0,
      afterText: '新增',
    );
    bloc.add(PendingRevisionCreated(patch: firstPatch));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;
    bloc.add(const ChapterCreated());
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.id,
          'new selected chapter',
          isNot(firstChapter.id),
        ),
      ),
    );

    bloc.add(RevisionAccepted(revisionId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.error?.code,
          'error code',
          'workspace.patch_chapter_mismatch',
        ),
      ),
    );
  });

  test('ChapterCreated creates and selects a blank chapter', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);

    bloc.add(const ChapterCreated());

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.chapters.length,
              'chapter count',
              2,
            )
            .having(
              (state) => state.selectedChapter?.title,
              'selected chapter title',
              '第2章',
            )
            .having(
              (state) => state.selectedChapter?.markdownContent,
              'blank content',
              '',
            ),
      ),
    );
  });

  test('ChapterSelected flushes pending debounced save for previous chapter',
      () async {
    final chapterRepository = _RecordingChapterRepository();
    final bloc = buildBloc(
      chapterRepository: chapterRepository,
      debounceDuration: const Duration(milliseconds: 500),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final firstChapter = bloc.state.selectedChapter!;

    bloc.add(const ChapterContentChanged('未保存正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.saveStatusLabel,
          'save status',
          '保存中',
        ),
      ),
    );

    bloc.add(const ChapterCreated());
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.id,
          'new selected chapter',
          isNot(firstChapter.id),
        ),
      ),
    );

    expect(chapterRepository.saveContentCallCount, greaterThanOrEqualTo(1));
    expect(
      chapterRepository.savedMarkdownContents,
      contains('未保存正文'),
    );
    final flushedChapter = bloc.state.chapters
        .firstWhere((chapter) => chapter.id == firstChapter.id);
    expect(flushedChapter.markdownContent, '未保存正文');
  });

  test('ChapterSelected flushes pending content before switching', () async {
    final chapterRepository = _RecordingChapterRepository();
    final bloc = buildBloc(
      chapterRepository: chapterRepository,
      debounceDuration: const Duration(milliseconds: 500),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final firstChapter = bloc.state.selectedChapter!;
    final now = DateTime.now().toUtc();
    final secondChapter = Chapter(
      id: 'second-chapter',
      projectId: firstChapter.projectId,
      title: '第二章',
      markdownContent: '',
      plainTextCache: '',
      createdAt: now,
      updatedAt: now,
    );
    await chapterRepository.create(secondChapter);

    bloc.add(const ChapterContentChanged('A 章草稿'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.saveStatusLabel,
          'save status',
          '保存中',
        ),
      ),
    );

    bloc.add(const ChapterSelected('second-chapter'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.id,
          'selected chapter id',
          'second-chapter',
        ),
      ),
    );

    expect(
      chapterRepository.savedMarkdownContents,
      contains('A 章草稿'),
    );
    final flushed = bloc.state.chapters
        .firstWhere((chapter) => chapter.id == firstChapter.id);
    expect(flushed.markdownContent, 'A 章草稿');
  });

  test('flush save failure surfaces error and still switches chapter',
      () async {
    final chapterRepository = _FlakySaveChapterRepository();
    final bloc = buildBloc(
      chapterRepository: chapterRepository,
      debounceDuration: const Duration(milliseconds: 500),
    );
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    final firstChapter = bloc.state.selectedChapter!;

    bloc.add(const ChapterContentChanged('未保存内容'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.saveStatusLabel,
          'save status',
          '保存中',
        ),
      ),
    );

    chapterRepository.failNextSave = true;
    bloc.add(const ChapterCreated());

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.selectedChapter?.id,
              'new selected chapter',
              isNot(firstChapter.id),
            )
            .having(
              (state) => state.error?.code,
              'flush error code',
              'chapter.save_failed',
            ),
      ),
    );

    final retained = bloc.state.chapters
        .firstWhere((chapter) => chapter.id == firstChapter.id);
    expect(retained.markdownContent, '未保存内容');
  });

  test('RevisionRejected rejects revision without content change', () async {
    final bloc = buildBloc();
    addTearDown(bloc.close);
    await startWorkspace(bloc);
    bloc.add(const ChapterContentChanged('正文'));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.selectedChapter?.markdownContent,
          'saved content',
          '正文',
        ),
      ),
    );
    final chapter = bloc.state.selectedChapter!;
    final revisionPatch = RevisionPatch(
      chapterId: chapter.id,
      baseContentHash: contentHash(chapter.markdownContent).toString(),
      operation: RevisionOperation.insert,
      anchor: RevisionAnchor(
        startOffset: chapter.markdownContent.length,
        endOffset: chapter.markdownContent.length,
      ),
      beforeText: '',
      afterText: '新增',
      source: RevisionSource.agent,
      metadata: const RevisionPatchMetadata(
        prompt: '测试',
        model: 'mock',
        summary: '测试修订',
      ),
    );
    bloc.add(PendingRevisionCreated(patch: revisionPatch));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>().having(
          (state) => state.pendingRevisions.length,
          'pending revisions length',
          1,
        ),
      ),
    );
    final revisionId = bloc.state.pendingRevisions.first.id;

    bloc.add(RevisionRejected(revisionId));

    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<WorkspaceState>()
            .having(
              (state) => state.selectedChapter?.markdownContent,
              'unchanged content',
              '正文',
            )
            .having(
              (state) => state.pendingRevisions.first.status,
              'revision status',
              RevisionStatus.rejected,
            ),
      ),
    );
  });
}

final class _FailingListPendingRevisionRepository
    implements RevisionRepository {
  final InMemoryRevisionRepository _inner = InMemoryRevisionRepository();

  @override
  Future<AppResult<Revision>> create(Revision revision) =>
      _inner.create(revision);

  @override
  Future<AppResult<List<Revision>>> listPending(String chapterId) async =>
      const AppResult<List<Revision>>.failure(
        AppError(
          code: 'revision.list_pending_failed',
          message: 'Pending revision list failed.',
          userMessage: '无法读取待处理修订。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );

  @override
  Future<AppResult<Revision>> updateStatus({
    required String id,
    required RevisionStatus status,
  }) =>
      _inner.updateStatus(id: id, status: status);
}

RevisionPatch _patchForChapter({
  required String chapterId,
  required String baseContent,
  required int startOffset,
  required String afterText,
}) =>
    RevisionPatch(
      chapterId: chapterId,
      baseContentHash: contentHash(baseContent).toString(),
      operation: RevisionOperation.insert,
      anchor: RevisionAnchor(startOffset: startOffset, endOffset: startOffset),
      beforeText: '',
      afterText: afterText,
      source: RevisionSource.agent,
      metadata: const RevisionPatchMetadata(
        prompt: '测试',
        model: 'mock',
        summary: '测试修订',
      ),
    );

final class _FailingUpdateRevisionRepository implements RevisionRepository {
  final InMemoryRevisionRepository _inner = InMemoryRevisionRepository();

  @override
  Future<AppResult<Revision>> create(Revision revision) =>
      _inner.create(revision);

  @override
  Future<AppResult<List<Revision>>> listPending(String chapterId) =>
      _inner.listPending(chapterId);

  @override
  Future<AppResult<Revision>> updateStatus({
    required String id,
    required RevisionStatus status,
  }) async =>
      const AppResult<Revision>.failure(
        AppError(
          code: 'revision.update_failed',
          message: 'Revision status update failed.',
          userMessage: '无法更新修订状态。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );
}

final class _FailingSaveChapterRepository implements ChapterRepository {
  final InMemoryChapterRepository _inner = InMemoryChapterRepository();

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) => _inner.create(chapter);

  @override
  Future<AppResult<Chapter?>> get(String id) => _inner.get(id);

  @override
  Future<AppResult<List<Chapter>>> list(String projectId) =>
      _inner.list(projectId);

  @override
  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  }) async =>
      const AppResult<Chapter>.failure(
        AppError(
          code: 'chapter.save_failed',
          message: 'Chapter save failed.',
          userMessage: '正文保存失败。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );

  @override
  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  }) =>
      _inner.updateStatus(id: id, status: status);
}

final class _FlakySaveChapterRepository implements ChapterRepository {
  final InMemoryChapterRepository _inner = InMemoryChapterRepository();
  bool failNextSave = false;

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) => _inner.create(chapter);

  @override
  Future<AppResult<Chapter?>> get(String id) => _inner.get(id);

  @override
  Future<AppResult<List<Chapter>>> list(String projectId) =>
      _inner.list(projectId);

  @override
  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  }) async {
    if (failNextSave) {
      failNextSave = false;
      return const AppResult<Chapter>.failure(
        AppError(
          code: 'chapter.save_failed',
          message: 'Chapter save failed.',
          userMessage: '正文保存失败。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );
    }
    return _inner.saveContent(
      id: id,
      markdownContent: markdownContent,
      plainTextCache: plainTextCache,
    );
  }

  @override
  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  }) =>
      _inner.updateStatus(id: id, status: status);
}

final class _RecordingChapterRepository implements ChapterRepository {
  final InMemoryChapterRepository _inner = InMemoryChapterRepository();
  final List<String> savedMarkdownContents = <String>[];
  int saveContentCallCount = 0;

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) => _inner.create(chapter);

  @override
  Future<AppResult<Chapter?>> get(String id) => _inner.get(id);

  @override
  Future<AppResult<List<Chapter>>> list(String projectId) =>
      _inner.list(projectId);

  @override
  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  }) {
    saveContentCallCount += 1;
    savedMarkdownContents.add(markdownContent);
    return _inner.saveContent(
      id: id,
      markdownContent: markdownContent,
      plainTextCache: plainTextCache,
    );
  }

  @override
  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  }) =>
      _inner.updateStatus(id: id, status: status);
}
