import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/agent/agent_mode_service.dart';
import 'package:novel_creator/agent/mock_writing_tool.dart';
import 'package:novel_creator/app/theme/theme_cubit.dart';
import 'package:novel_creator/app/widgets/empty_hero_widget.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/repositories/in_memory_character_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_chapter_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_note_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_setting_entry_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';
import 'package:novel_creator/editor/revision/revision_service.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_event.dart';
import 'package:novel_creator/features/workspace/pages/workspace_page.dart';
import 'package:novel_creator/features/workspace/widgets/agent_panel.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_editor_widget.dart';

void main() {
  // 工作区三栏布局需要足够宽度：sidebar(306) + workspace(680+) + agent(356)
  const _kTestViewportSize = Size(1440, 900);

  Future<void> setLargeViewport(WidgetTester tester) async {
    tester.view.physicalSize = _kTestViewportSize;
    tester.view.devicePixelRatio = 1.0;
  }

  void resetViewport(WidgetTester tester) {
    tester.view.resetPhysicalSize();
    tester.view.resetDevicePixelRatio();
  }

  testWidgets('renders workspace and creates pending revision from suggestion',
      (tester) async {
    await setLargeViewport(tester);
    addTearDown(() => resetViewport(tester));

    final bloc = WorkspaceBloc(
      projectRepository: InMemoryProjectRepository(),
      chapterRepository: InMemoryChapterRepository(),
      revisionRepository: InMemoryRevisionRepository(),
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    )..add(const WorkspaceStarted());
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<ThemeCubit>(
          create: (_) => ThemeCubit(),
          child: BlocProvider<WorkspaceBloc>.value(
            value: bloc,
            child: const WorkspacePage(),
          ),
        ),
      ),
    );
    await tester.pump();

    // 项目名出现在 sidebar 和 overview 两处
    expect(find.text('示例项目'), findsAtLeast(1));
    expect(find.text('第一章'), findsWidgets);
    expect(find.text('已保存'), findsAtLeast(1));
    // Agent 面板显示模式标签
    expect(find.text('写作'), findsOneWidget);

    await tester.tap(find.text('生成建议'));
    await tester.pump();

    expect(find.textContaining('Mock opening'), findsOneWidget);

    await tester.tap(find.text('创建修订'));
    await tester.pump();

    expect(find.text('待审核修订：1'), findsOneWidget);
  });

  testWidgets('shows skeleton while workspace is loading', (tester) async {
    await setLargeViewport(tester);
    addTearDown(() => resetViewport(tester));

    final projectRepository = _ControlledProjectRepository();
    final bloc = WorkspaceBloc(
      projectRepository: projectRepository,
      chapterRepository: InMemoryChapterRepository(),
      revisionRepository: InMemoryRevisionRepository(),
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    )..add(const WorkspaceStarted());
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<ThemeCubit>(
          create: (_) => ThemeCubit(),
          child: BlocProvider<WorkspaceBloc>.value(
            value: bloc,
            child: const WorkspacePage(),
          ),
        ),
      ),
    );
    await tester.pump();

    // 加载中显示骨架屏
    expect(find.byType(SkeletonCard), findsWidgets);

    projectRepository.completeCreate();
    await tester.pump();
  });

  testWidgets('shows save status when no chapter is selected', (tester) async {
    await setLargeViewport(tester);
    addTearDown(() => resetViewport(tester));

    final bloc = WorkspaceBloc(
      projectRepository: InMemoryProjectRepository(),
      chapterRepository: InMemoryChapterRepository(),
      revisionRepository: InMemoryRevisionRepository(),
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    );
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<ThemeCubit>(
          create: (_) => ThemeCubit(),
          child: BlocProvider<WorkspaceBloc>.value(
            value: bloc,
            child: const WorkspacePage(),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('正在准备工作台'), findsOneWidget);
  });

  testWidgets('editor updates same chapter content from accepted revision',
      (tester) async {
    final chapter = _chapter('chapter', '旧正文');
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Row(
            children: <Widget>[
              Expanded(
                child: ChapterEditorWidget(
                  chapter: chapter,
                  saveStatusLabel: '已保存',
                  onContentChanged: (_) {},
                ),
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text('旧正文'), findsOneWidget);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Row(
            children: <Widget>[
              Expanded(
                child: ChapterEditorWidget(
                  chapter: chapter.copyWith(markdownContent: '旧正文新增'),
                  saveStatusLabel: '已保存',
                  onContentChanged: (_) {},
                ),
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text('旧正文新增'), findsOneWidget);
    expect(find.text('旧正文'), findsNothing);
  });

  testWidgets('agent panel exposes accept and reject actions', (tester) async {
    final acceptedIds = <String>[];
    final rejectedIds = <String>[];
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Row(
            children: [
              Expanded(child: Container()),
              AgentPanel(
                mode: AgentMode.writing,
                suggestion: '建议',
                pendingRevisions: <Revision>[
                  _revision('pending', RevisionStatus.pending, '待处理修订'),
                ],
                selectedChapterId: 'chapter',
                currentContent: '',
                onGenerateSuggestion: () {},
                onCreateRevision: () {},
                onAcceptRevision: acceptedIds.add,
                onRejectRevision: rejectedIds.add,
                providerName: 'Test Provider',
                modelId: 'test-model',
                isGenerating: false,
              ),
            ],
          ),
        ),
      ),
    );

    await tester.tap(find.text('接受'));
    await tester.pump();
    await tester.tap(find.text('拒绝'));
    await tester.pump();

    expect(acceptedIds, <String>['pending']);
    expect(rejectedIds, <String>['pending']);
  });

  testWidgets('workspace sidebar creates a new chapter', (tester) async {
    await setLargeViewport(tester);
    addTearDown(() => resetViewport(tester));

    final bloc = WorkspaceBloc(
      projectRepository: InMemoryProjectRepository(),
      chapterRepository: InMemoryChapterRepository(),
      revisionRepository: InMemoryRevisionRepository(),
      revisionService: const RevisionService(),
      agentModeService: const AgentModeService(),
      writingTool: const MockWritingTool(),
      characterRepository: InMemoryCharacterRepository(),
      settingEntryRepository: InMemorySettingEntryRepository(),
      noteRepository: InMemoryNoteRepository(),
      eventBus: AppEventBus(),
    )..add(const WorkspaceStarted());
    addTearDown(bloc.close);

    await tester.pumpWidget(
      MaterialApp(
        home: BlocProvider<ThemeCubit>(
          create: (_) => ThemeCubit(),
          child: BlocProvider<WorkspaceBloc>.value(
            value: bloc,
            child: const WorkspacePage(),
          ),
        ),
      ),
    );
    await tester.pump();

    // 新 Sidebar 用搜索行旁的 + 按钮创建章节
    final sidebarPlusButtons = find.byWidgetPredicate(
      (widget) => widget is Icon && widget.icon == LucideIcons.plus,
    );
    // 第二个 plus 按钮在 SearchRow 中（第一个在 MacBar 标签页）
    if (sidebarPlusButtons.evaluate().length > 1) {
      await tester.tap(sidebarPlusButtons.at(1));
    } else {
      await tester.tap(sidebarPlusButtons.first);
    }
    await tester.pumpAndSettle();

    // 验证新章节已创建
    expect(bloc.state.chapters.length, 2);
  });

  testWidgets('agent panel displays only pending revisions', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Row(
            children: [
              Expanded(child: Container()),
              AgentPanel(
                mode: AgentMode.writing,
                suggestion: '建议',
                pendingRevisions: <Revision>[
                  _revision('pending', RevisionStatus.pending, '待处理修订'),
                  _revision('accepted', RevisionStatus.accepted, '已接受修订'),
                  _revision('rejected', RevisionStatus.rejected, '已拒绝修订'),
                ],
                selectedChapterId: 'chapter',
                currentContent: '',
                onGenerateSuggestion: () {},
                onCreateRevision: () {},
                onAcceptRevision: (_) {},
                onRejectRevision: (_) {},
                providerName: 'Test Provider',
                modelId: 'test-model',
                isGenerating: false,
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text('待审核修订：1'), findsOneWidget);
    expect(find.text('待处理修订'), findsOneWidget);
    expect(find.text('已接受修订'), findsNothing);
    expect(find.text('已拒绝修订'), findsNothing);
  });
}

final class _ControlledProjectRepository implements ProjectRepository {
  final InMemoryProjectRepository _inner = InMemoryProjectRepository();
  final Completer<void> _createCompleter = Completer<void>();

  void completeCreate() {
    if (!_createCompleter.isCompleted) {
      _createCompleter.complete();
    }
  }

  @override
  Future<AppResult<Project>> create(Project project) async {
    await _createCompleter.future;
    return _inner.create(project);
  }

  @override
  Future<AppResult<Project?>> get(String id) => _inner.get(id);

  @override
  Future<AppResult<List<Project>>> list() => _inner.list();

  @override
  Future<AppResult<Project>> saveContent(Project project) =>
      _inner.saveContent(project);

  @override
  Future<AppResult<void>> delete(String id) => _inner.delete(id);
}

Chapter _chapter(String id, String markdownContent) {
  final now = DateTime.utc(2026);

  return Chapter(
    id: id,
    projectId: 'project',
    title: '第一章',
    markdownContent: markdownContent,
    plainTextCache: markdownContent,
    createdAt: now,
    updatedAt: now,
  );
}

Revision _revision(String id, RevisionStatus status, String summary) {
  final now = DateTime.utc(2026);

  return Revision(
    id: id,
    projectId: 'project',
    chapterId: 'chapter',
    status: status,
    patch: RevisionPatch(
      chapterId: 'chapter',
      baseContentHash: '0',
      operation: RevisionOperation.insert,
      anchor: const RevisionAnchor(startOffset: 0, endOffset: 0),
      beforeText: '',
      afterText: '新增',
      source: RevisionSource.agent,
      metadata: RevisionPatchMetadata(
        prompt: 'prompt',
        model: 'mock',
        summary: summary,
      ),
    ),
    createdAt: now,
    updatedAt: now,
  );
}
