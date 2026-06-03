import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';
import 'package:novel_creator/features/workspace/widgets/agent_panel.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_editor_widget.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_tree_sidebar.dart';

class WorkspacePage extends StatelessWidget {
  const WorkspacePage({super.key, required this.projectId});

  final String projectId;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
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
          ),
        ),
      ],
      child: const _WorkspaceShell(),
    );
  }
}

class _WorkspaceShell extends StatefulWidget {
  const _WorkspaceShell();

  @override
  State<_WorkspaceShell> createState() => _WorkspaceShellState();
}

class _WorkspaceShellState extends State<_WorkspaceShell> {
  double _leftWidth = 260;
  double _rightWidth = 300;
  bool _rightPanelVisible = true;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Scaffold(
      body: Column(
        children: [
          _TopBar(
            onToggleRightPanel: () {
              setState(() {
                _rightPanelVisible = !_rightPanelVisible;
              });
            },
            rightPanelVisible: _rightPanelVisible,
          ),
          Expanded(
            child: Row(
              children: [
                SizedBox(
                  width: _leftWidth,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(
                        right: BorderSide(color: morandi.line),
                      ),
                    ),
                    child: const ChapterTreeSidebar(),
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
                    ],
                    child: const ChapterEditorWidget(),
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
                    child: Container(
                      decoration: BoxDecoration(
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
        ],
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.onToggleRightPanel,
    required this.rightPanelVisible,
  });

  final VoidCallback onToggleRightPanel;
  final bool rightPanelVisible;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: morandi.panel,
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.arrow_back, size: 18, color: morandi.muted),
            onPressed: () => Navigator.of(context).pop(),
            tooltip: '返回项目列表',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          const SizedBox(width: 8),
          BlocBuilder<EditorBloc, EditorState>(
            builder: (context, state) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: morandi.canvas,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: morandi.line),
                ),
                child: Text(
                  state.chapter?.title ?? '未选择章节',
                  style: TextStyle(fontSize: 12, color: morandi.ink, fontWeight: FontWeight.w500),
                ),
              );
            },
          ),
          const SizedBox(width: 10),
          BlocBuilder<EditorBloc, EditorState>(
            buildWhen: (prev, curr) =>
                prev.isSaving != curr.isSaving ||
                prev.saveError != curr.saveError,
            builder: (context, state) {
              if (state.isSaving) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: morandi.green,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text('保存中...', style: TextStyle(fontSize: 11, color: morandi.muted)),
                  ],
                );
              }
              if (state.saveError != null) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: morandi.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text('保存失败', style: TextStyle(fontSize: 11, color: morandi.red)),
                  ],
                );
              }
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, size: 12, color: morandi.green),
                  const SizedBox(width: 4),
                  Text('本地已保存', style: TextStyle(fontSize: 11, color: morandi.green)),
                ],
              );
            },
          ),
          const Spacer(),
          IconButton(
            icon: Icon(Icons.file_download_outlined, size: 18, color: morandi.muted),
            onPressed: () {},
            tooltip: '导出',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          IconButton(
            icon: Icon(
              rightPanelVisible ? Icons.smart_toy : Icons.smart_toy_outlined,
              size: 18,
              color: rightPanelVisible ? morandi.green : morandi.muted,
            ),
            onPressed: onToggleRightPanel,
            tooltip: '切换 Agent 面板',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          IconButton(
            icon: Icon(Icons.settings_outlined, size: 18, color: morandi.muted),
            onPressed: () {},
            tooltip: '设置',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}

class _ResizeHandle extends StatelessWidget {
  const _ResizeHandle({required this.onDrag});

  final ValueChanged<double> onDrag;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
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
}
