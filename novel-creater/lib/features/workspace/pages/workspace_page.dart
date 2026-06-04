import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/agent_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/research_bloc.dart';
import 'package:novel_creator/features/workspace/models/workspace_view.dart';
import 'package:novel_creator/features/workspace/widgets/agent_panel.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_tree_sidebar.dart';
import 'package:novel_creator/features/workspace/widgets/workspace_content.dart';

class WorkspacePage extends StatelessWidget {
  const WorkspacePage({required this.projectId, super.key});

  final String projectId;

  @override
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) => ChapterTreeBloc(
              chapterRepository: locator<ChapterRepository>(),
              idGenerator: locator<IdGenerator>(),
              clock: locator<AppClock>(),
            )..add(ChapterTreeStarted(projectId: projectId)),
          ),
          BlocProvider(
            create: (_) => EditorBloc(
              chapterRepository: locator<ChapterRepository>(),
              clock: locator<AppClock>(),
            ),
          ),
          BlocProvider(
            create: (_) =>
                locator<AgentBloc>()..add(AgentStarted(projectId: projectId)),
          ),
          BlocProvider(
            create: (_) => locator<KnowledgeBaseBloc>()
              ..add(KnowledgeBaseStarted(projectId: projectId)),
          ),
          BlocProvider(
            create: (_) => locator<ResearchBloc>()
              ..add(ResearchStarted(projectId: projectId)),
          ),
        ],
        child: _WorkspaceShell(projectId: projectId),
      );
}

class _WorkspaceShell extends StatefulWidget {
  const _WorkspaceShell({required this.projectId});

  final String projectId;

  @override
  State<_WorkspaceShell> createState() => _WorkspaceShellState();
}

class _WorkspaceShellState extends State<_WorkspaceShell> {
  double _leftWidth = 300;
  double _rightWidth = 392;
  bool _rightPanelVisible = true;
  WorkspaceView _currentView = WorkspaceView.editor;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Scaffold(
      body: Column(
        children: [
          _MacBar(morandi: morandi),
          _TabsBar(
            onToggleRightPanel: () {
              setState(() {
                _rightPanelVisible = !_rightPanelVisible;
              });
            },
            rightPanelVisible: _rightPanelVisible,
            projectId: widget.projectId,
            currentView: _currentView,
          ),
          Expanded(
            child: Row(
              children: [
                SizedBox(
                  width: _leftWidth,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: morandi.surface2.withOpacity(0.88),
                      border: Border(
                        right: BorderSide(color: morandi.line),
                      ),
                    ),
                    child: ChapterTreeSidebar(
                      currentView: _currentView,
                      onViewSelected: (view) {
                        setState(() {
                          _currentView = view;
                        });
                      },
                      onChapterSelected: _selectChapter,
                    ),
                  ),
                ),
                _ResizeHandle(
                  onDrag: (dx) {
                    setState(() {
                      _leftWidth = (_leftWidth + dx).clamp(200.0, 400.0);
                    });
                  },
                ),
                Expanded(
                  child: MultiBlocListener(
                    listeners: [
                      BlocListener<ChapterTreeBloc, ChapterTreeState>(
                        listener: (context, state) {
                          if (state.selectedChapterId != null) {
                            final chapter = state.chapters.firstWhere(
                              (c) => c.id == state.selectedChapterId,
                            );
                            context.read<EditorBloc>().add(
                                  EditorChapterLoaded(chapter: chapter),
                                );
                          }
                        },
                        listenWhen: (prev, curr) =>
                            prev.selectedChapterId != curr.selectedChapterId,
                      ),
                      BlocListener<ChapterTreeBloc, ChapterTreeState>(
                        listener: (context, state) {
                          if (state.selectedChapterId != null) {
                            final chapter = state.chapters.firstWhere(
                              (c) => c.id == state.selectedChapterId,
                            );
                            final editorState =
                                context.read<EditorBloc>().state;
                            if (editorState.chapter != null &&
                                editorState.chapter!.id == chapter.id &&
                                editorState.chapter!.title != chapter.title) {
                              context.read<EditorBloc>().add(
                                    EditorChapterLoaded(chapter: chapter),
                                  );
                            }
                          }
                        },
                        listenWhen: (prev, curr) =>
                            prev.chapters != curr.chapters &&
                            prev.selectedChapterId == curr.selectedChapterId,
                      ),
                      BlocListener<EditorBloc, EditorState>(
                        listener: (context, state) {
                          final chapter = state.chapter;
                          if (chapter == null) return;
                          context.read<ChapterTreeBloc>().add(
                                ChapterTreeChapterSynced(chapter: chapter),
                              );
                        },
                        listenWhen: (prev, curr) =>
                            prev.chapter != curr.chapter &&
                            curr.chapter != null,
                      ),
                    ],
                    child: ColoredBox(
                      color: morandi.paper,
                      child: WorkspaceContent(
                        view: _currentView,
                        projectId: widget.projectId,
                      ),
                    ),
                  ),
                ),
                if (_rightPanelVisible) ...[
                  _ResizeHandle(
                    onDrag: (dx) {
                      setState(() {
                        _rightWidth = (_rightWidth - dx).clamp(200.0, 500.0);
                      });
                    },
                  ),
                  SizedBox(
                    width: _rightWidth,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: morandi.surface2.withOpacity(0.93),
                        border: Border(
                          left: BorderSide(color: morandi.line),
                        ),
                      ),
                      child: const AgentPanel(),
                    ),
                  ),
                ],
              ],
            ),
          ),
          _BottomBar(morandi: morandi),
        ],
      ),
    );
  }

  Future<void> _selectChapter(String chapterId) async {
    final completer = Completer<bool>();
    context.read<EditorBloc>().add(
          EditorSaveRequested(completer: completer),
        );
    final saved = await completer.future;
    if (!mounted || !saved) return;

    context.read<ChapterTreeBloc>().add(
          ChapterTreeChapterSelected(chapterId: chapterId),
        );
    setState(() {
      _currentView = WorkspaceView.editor;
    });
  }
}

class _MacBar extends StatelessWidget {
  const _MacBar({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        height: 36,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFBFAF8), Color(0xFFF6F3ED)],
          ),
          border: Border(
            bottom: BorderSide(
              color: morandi.line.withOpacity(0.75),
            ),
          ),
        ),
        child: const Row(
          children: [
            _Dot(color: Color(0xFFFF6A5E)),
            SizedBox(width: 8),
            _Dot(color: Color(0xFFF7BD4F)),
            SizedBox(width: 8),
            _Dot(color: Color(0xFF51C65E)),
          ],
        ),
      );
}

class _Dot extends StatelessWidget {
  const _Dot({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
      );
}

class _TabsBar extends StatelessWidget {
  const _TabsBar({
    required this.onToggleRightPanel,
    required this.rightPanelVisible,
    required this.projectId,
    required this.currentView,
  });

  final VoidCallback onToggleRightPanel;
  final bool rightPanelVisible;
  final String projectId;
  final WorkspaceView currentView;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: morandi.paper.withOpacity(0.85),
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(left: 10),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _TabItem(
                      morandi: morandi,
                      label: currentView.label,
                      icon: Icons.book_outlined,
                      isActive: true,
                      onClose: () {},
                    ),
                    _AddTabButton(morandi: morandi),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Row(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.cloud_done_outlined,
                      size: 17,
                      color: morandi.muted,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '已保存',
                      style: TextStyle(
                        fontSize: 13,
                        color: morandi.muted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                _TinyIconButton(
                  icon: Icons.undo_outlined,
                  morandi: morandi,
                  onPressed: () {},
                ),
                _TinyIconButton(
                  icon: Icons.redo_outlined,
                  morandi: morandi,
                  onPressed: () {},
                ),
                _TinyIconButton(
                  icon: Icons.chat_bubble_outline,
                  morandi: morandi,
                  onPressed: onToggleRightPanel,
                  isActive: rightPanelVisible,
                ),
                const SizedBox(width: 12),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: morandi.green,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      'W',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TabItem extends StatelessWidget {
  const _TabItem({
    required this.morandi,
    required this.label,
    required this.isActive,
    required this.onClose,
    this.icon,
  });

  final MorandiColors morandi;
  final String label;
  final IconData? icon;
  final bool isActive;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) => Container(
        height: 46,
        constraints: const BoxConstraints(minWidth: 156),
        margin: const EdgeInsets.only(right: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: isActive ? morandi.canvas : morandi.surface3,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(12),
          ),
          border: Border(
            top: BorderSide(color: morandi.line),
            left: BorderSide(color: morandi.line),
            right: BorderSide(color: morandi.line),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 16,
                color: isActive ? morandi.ink : morandi.text,
              ),
              const SizedBox(width: 8),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                color: isActive ? morandi.ink : const Color(0xFF4C504A),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onClose,
              child: const Icon(
                Icons.close,
                size: 14,
                color: Color(0xFF8F8E86),
              ),
            ),
          ],
        ),
      );
}

class _AddTabButton extends StatelessWidget {
  const _AddTabButton({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        height: 46,
        width: 38,
        margin: const EdgeInsets.only(right: 4),
        decoration: BoxDecoration(
          color: morandi.surface3,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(12),
          ),
          border: Border(
            top: BorderSide(color: morandi.line),
            left: BorderSide(color: morandi.line),
            right: BorderSide(color: morandi.line),
          ),
        ),
        child: Center(
          child: Icon(
            Icons.add,
            size: 16,
            color: morandi.muted,
          ),
        ),
      );
}

class _TinyIconButton extends StatelessWidget {
  const _TinyIconButton({
    required this.icon,
    required this.morandi,
    required this.onPressed,
    this.isActive = false,
  });

  final IconData icon;
  final MorandiColors morandi;
  final VoidCallback onPressed;
  final bool isActive;

  @override
  Widget build(BuildContext context) => Container(
        width: 28,
        height: 28,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(9),
          color: isActive ? morandi.greenLight : Colors.transparent,
        ),
        child: IconButton(
          icon: Icon(
            icon,
            size: 16,
            color: isActive ? morandi.greenDark : const Color(0xFF62655D),
          ),
          onPressed: onPressed,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(
            minWidth: 28,
            minHeight: 28,
          ),
        ),
      );
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        height: 34,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: morandi.paper.withOpacity(0.95),
          border: Border(top: BorderSide(color: morandi.line)),
        ),
        child: Row(
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '拼写检查',
                  style: TextStyle(
                    fontSize: 12,
                    color: morandi.muted,
                  ),
                ),
                const SizedBox(width: 6),
                _Switch(isOn: true, morandi: morandi),
              ],
            ),
            const SizedBox(width: 24),
            Text(
              '修订：显示',
              style: TextStyle(
                fontSize: 12,
                color: morandi.muted,
              ),
            ),
            const Spacer(),
            BlocBuilder<EditorBloc, EditorState>(
              buildWhen: (prev, curr) => prev.wordCount != curr.wordCount,
              builder: (context, state) => Text(
                '${state.wordCount} 字',
                style: TextStyle(
                  fontSize: 12,
                  color: morandi.muted,
                ),
              ),
            ),
            const SizedBox(width: 24),
            Text(
              '预计阅读 -- 分钟',
              style: TextStyle(
                fontSize: 12,
                color: morandi.muted,
              ),
            ),
            const SizedBox(width: 24),
            Text(
              'v1.3.2',
              style: TextStyle(
                fontSize: 12,
                color: morandi.muted,
              ),
            ),
            const SizedBox(width: 12),
            _TinyIconButton(
              icon: Icons.settings_outlined,
              morandi: morandi,
              onPressed: () {},
            ),
          ],
        ),
      );
}

class _Switch extends StatelessWidget {
  const _Switch({required this.isOn, required this.morandi});

  final bool isOn;
  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        width: 34,
        height: 18,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: isOn ? morandi.green : const Color(0xFFD9D4CA),
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 200),
          alignment: isOn ? Alignment.centerRight : Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.all(2),
            child: Container(
              width: 14,
              height: 14,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x33000000),
                    blurRadius: 4,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
}

class _ResizeHandle extends StatelessWidget {
  const _ResizeHandle({required this.onDrag});

  final ValueChanged<double> onDrag;

  @override
  Widget build(BuildContext context) => MouseRegion(
        cursor: SystemMouseCursors.resizeColumn,
        child: GestureDetector(
          onHorizontalDragUpdate: (details) => onDrag(details.delta.dx),
          child: Container(
            width: 4,
            color: Theme.of(context).extension<MorandiColors>()!.line,
          ),
        ),
      );
}
