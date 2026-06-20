import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/theme/theme_cubit.dart';
import 'package:novel_creator/app/widgets/app_toast.dart';
import 'package:novel_creator/app/widgets/app_shell.dart';
import 'package:novel_creator/app/widgets/empty_hero_widget.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_event.dart';
import 'package:novel_creator/features/workspace/pages/characters_page.dart';
import 'package:novel_creator/features/workspace/pages/notes_page.dart';
import 'package:novel_creator/features/workspace/pages/outline_page.dart';
import 'package:novel_creator/features/workspace/pages/overview_page.dart';
import 'package:novel_creator/features/workspace/pages/revision_page.dart';
import 'package:novel_creator/features/workspace/pages/world_page.dart';
import 'package:novel_creator/features/workspace/widgets/agent_panel.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_editor_widget.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/navigation_menu.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/sidebar.dart';
import 'package:novel_creator/features/workspace/widgets/workspace_header.dart';

class WorkspacePage extends StatefulWidget {
  const WorkspacePage({super.key});

  @override
  State<WorkspacePage> createState() => _WorkspacePageState();
}

class _WorkspacePageState extends State<WorkspacePage> {
  bool _showAgentPanel = true;

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<WorkspaceBloc, WorkspaceState>(
        builder: (context, state) {
          final isDark = context.watch<ThemeCubit>().state == ThemeMode.dark;

          if (state.isLoading) {
            return Scaffold(
              body: _buildLoadingSkeleton(isDark),
            );
          }

          final project = state.project;
          if (project == null) {
            return Scaffold(
              body: Center(
                child: Text(state.error?.userMessage ?? '正在准备工作台'),
              ),
            );
          }

          final chapter = state.selectedChapter;
          final pendingCount = chapter != null
              ? state.pendingRevisions
                  .where((r) =>
                      r.chapterId == chapter.id &&
                      r.status == RevisionStatus.pending)
                  .length
              : 0;

          return Scaffold(
            body: AppShell(
              saveStatusLabel: state.saveStatusLabel,
              wordCount: chapter?.effectiveWordCount ?? 0,
              revisionCount: pendingCount,
              isDark: isDark,
              showAgentPanel: _showAgentPanel,
              onToggleAgentPanel: () {
                setState(() => _showAgentPanel = !_showAgentPanel);
              },
              sidebar: Sidebar(
                project: project,
                chapters: state.chapters,
                selectedChapterId: chapter?.id,
                selectedNavItem: state.selectedNavItem,
                onChapterSelected: (chapterId) => context
                    .read<WorkspaceBloc>()
                    .add(ChapterSelected(chapterId)),
                onNavItemSelected: (item) => context
                    .read<WorkspaceBloc>()
                    .add(NavItemSelected(item)),
                chapterTreeExpanded: state.chapterTreeExpanded,
                onToggleChapterTree: () => context
                    .read<WorkspaceBloc>()
                    .add(const ChapterTreeToggled()),
                onCreateTap: () {
                  context.read<WorkspaceBloc>().add(const ChapterCreated());
                  AppToast.show(context, message: '已创建新章节');
                },
                onSettingsTap: () =>
                    Navigator.of(context).pushNamed('/settings'),
                onThemeToggle: () {
                  context.read<ThemeCubit>().toggle();
                },
                isDark: isDark,
              ),
              workspace: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                switchInCurve: Curves.easeInOut,
                switchOutCurve: Curves.easeInOut,
                child: KeyedSubtree(
                  key: ValueKey(state.selectedNavItem),
                  child: _buildWorkspace(context, state, isDark),
                ),
              ),
              agentPanel: AgentPanel(
                mode: state.agentMode,
                suggestion: state.agentSuggestion,
                suggestionType: state.agentSuggestionType,
                suggestionSummary: state.agentSuggestionSummary,
                pendingRevisions: state.pendingRevisions,
                selectedChapterId: chapter?.id ?? '',
                currentContent: chapter?.markdownContent ?? '',
                isDark: isDark,
                providerName: state.agentProviderName,
                modelId: state.agentModelId,
                isGenerating: state.agentIsGenerating,
                onCancel: () => context
                    .read<WorkspaceBloc>()
                    .add(const AgentCancelled()),
                onSubmitInstruction: (instruction) => context
                    .read<WorkspaceBloc>()
                    .add(AgentWriteRequested(instruction: instruction)),
                onGenerateSuggestion: () => context
                    .read<WorkspaceBloc>()
                    .add(const AgentSuggestionRequested()),
                onCreateRevision: () => context
                    .read<WorkspaceBloc>()
                    .add(const PendingRevisionCreated()),
                onAcceptRevision: (revisionId) => context
                    .read<WorkspaceBloc>()
                    .add(RevisionAccepted(revisionId)),
                onRejectRevision: (revisionId) => context
                    .read<WorkspaceBloc>()
                    .add(RevisionRejected(revisionId)),
              ),
            ),
          );
        },
      );

  /// 加载中骨架屏
  Widget _buildLoadingSkeleton(bool isDark) {
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    return Container(
      color: bg,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Wrap(
              spacing: 16,
              children: List.generate(
                3,
                (_) => SkeletonCard(isDark: isDark),
              ),
            ),
            const SizedBox(height: 24),
            SkeletonCard(width: 300, height: 16, isDark: isDark),
            const SizedBox(height: 8),
            SkeletonCard(width: 200, height: 16, isDark: isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkspace(BuildContext context, WorkspaceState state, bool isDark) {
    final project = state.project;
    final chapter = state.selectedChapter;

    // 当有选中章节时，工作区显示编辑器（用户点击侧边栏章节后自动进入编辑模式）
    if (chapter != null && state.selectedNavItem == SidebarNavItem.overview) {
      return ChapterEditorWidget(
        chapter: chapter,
        saveStatusLabel: state.saveStatusLabel,
        onContentChanged: (content) => context
            .read<WorkspaceBloc>()
            .add(ChapterContentChanged(content)),
      );
    }

    switch (state.selectedNavItem) {
      case SidebarNavItem.overview:
        return Column(
          children: [
            const WorkspaceHeader(title: '项目概览'),
            Expanded(
              child: OverviewPage(
                project: project!,
                chapterCount: state.chapters.length,
                totalWordCount: state.chapters.fold(0, (s, c) => s + c.effectiveWordCount),
                progress: _calcProgress(state.chapters),
                isDark: isDark,
              ),
            ),
          ],
        );
      case SidebarNavItem.outline:
        return Column(
          children: [
            const WorkspaceHeader(title: '大纲'),
            Expanded(
              child: state.chapters.isEmpty
                  ? EmptyHeroWidget(
                      icon: LucideIcons.fileText,
                      title: '还没有章节',
                      description: '创建第一章后，可以使用写作模式续写、补段并生成待审核修订',
                      actionLabel: '新建第一章',
                      onAction: () {
                        context.read<WorkspaceBloc>().add(const ChapterCreated());
                        AppToast.show(context, message: '已创建新章节');
                      },
                      isDark: isDark,
                    )
                  : OutlinePage(
                      chapters: state.chapters,
                      selectedChapterId: chapter?.id,
                      onChapterSelected: (id) => context
                          .read<WorkspaceBloc>()
                          .add(ChapterSelected(id)),
                      isDark: isDark,
                    ),
            ),
          ],
        );
      case SidebarNavItem.characters:
        return Column(
          children: [
            const WorkspaceHeader(title: '角色'),
            Expanded(
              child: CharactersPage(
                characters: state.characters,
                isDark: isDark,
              ),
            ),
          ],
        );
      case SidebarNavItem.world:
        return Column(
          children: [
            const WorkspaceHeader(title: '世界观'),
            Expanded(
              child: WorldPage(
                settingEntries: state.settingEntries,
                isDark: isDark,
              ),
            ),
          ],
        );
      case SidebarNavItem.notes:
        return Column(
          children: [
            const WorkspaceHeader(title: '笔记'),
            Expanded(
              child: NotesPage(
                notes: state.notes,
                isDark: isDark,
              ),
            ),
          ],
        );
      case SidebarNavItem.sessions:
        return Column(
          children: [
            const WorkspaceHeader(title: '修订追踪'),
            Expanded(
              child: RevisionPage(
                revisions: state.pendingRevisions,
                onAcceptAll: () {
                  for (final r in state.pendingRevisions.where((r) => r.status == RevisionStatus.pending)) {
                    context.read<WorkspaceBloc>().add(RevisionAccepted(r.id));
                  }
                },
                onRejectAll: () {
                  for (final r in state.pendingRevisions.where((r) => r.status == RevisionStatus.pending)) {
                    context.read<WorkspaceBloc>().add(RevisionRejected(r.id));
                  }
                },
                onAcceptRevision: (id) => context
                    .read<WorkspaceBloc>()
                    .add(RevisionAccepted(id)),
                onRejectRevision: (id) => context
                    .read<WorkspaceBloc>()
                    .add(RevisionRejected(id)),
                isDark: isDark,
              ),
            ),
          ],
        );
      case SidebarNavItem.export:
        return Column(
          children: [
            const WorkspaceHeader(title: '导出'),
            Expanded(
              child: Center(
                child: TextButton(
                  onPressed: () => Navigator.of(context).pushNamed('/export'),
                  child: const Text('打开导出向导'),
                ),
              ),
            ),
          ],
        );
    }
  }

  double _calcProgress(List chapters) {
    if (chapters.isEmpty) return 0;
    final published = chapters.where((c) => c.status == ChapterStatus.published).length;
    return published / chapters.length;
  }
}
