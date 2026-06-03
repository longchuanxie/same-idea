import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';
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
  double _leftWidth = 280;
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
                      color: Colors.white,
                      border: Border(
                        right: BorderSide(color: morandi.fog),
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
                        color: Colors.white,
                        border: Border(
                          left: BorderSide(color: morandi.fog),
                        ),
                      ),
                      child: const _AgentPanelPlaceholder(),
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
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: morandi.fog)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.arrow_back, size: 20, color: morandi.inkLight),
            onPressed: () => Navigator.of(context).pop(),
            tooltip: 'Back to projects',
          ),
          const SizedBox(width: 8),
          BlocBuilder<EditorBloc, EditorState>(
            builder: (context, state) {
              return Text(
                state.chapter?.title ?? 'Workspace',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: morandi.inkDark,
                    ),
              );
            },
          ),
          const Spacer(),
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
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: morandi.sage,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Saving...',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: morandi.inkLight,
                          ),
                    ),
                  ],
                );
              }
              if (state.saveError != null) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: morandi.dustyRose,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Save error',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: morandi.dustyRose,
                          ),
                    ),
                  ],
                );
              }
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, size: 14, color: morandi.sage),
                  const SizedBox(width: 6),
                  Text(
                    'Saved',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: morandi.sage,
                        ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(width: 16),
          IconButton(
            icon: Icon(Icons.file_download_outlined,
                size: 20, color: morandi.inkLight),
            onPressed: () {},
            tooltip: 'Export',
          ),
          IconButton(
            icon: Icon(
              rightPanelVisible ? Icons.smart_toy : Icons.smart_toy_outlined,
              size: 20,
              color: rightPanelVisible ? morandi.sage : morandi.inkLight,
            ),
            onPressed: onToggleRightPanel,
            tooltip: 'Toggle AI Panel',
          ),
          IconButton(
            icon: Icon(Icons.settings_outlined,
                size: 20, color: morandi.inkLight),
            onPressed: () {},
            tooltip: 'Settings',
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
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return MouseRegion(
      cursor: SystemMouseCursors.resizeColumn,
      child: GestureDetector(
        onHorizontalDragUpdate: (details) => onDrag(details.delta.dx),
        child: Container(
          width: 4,
          color: morandi.fog,
        ),
      ),
    );
  }
}

class _AgentPanelPlaceholder extends StatelessWidget {
  const _AgentPanelPlaceholder();

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.smart_toy_outlined, size: 48, color: morandi.stone),
          const SizedBox(height: 16),
          Text(
            'AI Assistant',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: morandi.inkLight,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Coming soon',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: morandi.stone,
                ),
          ),
        ],
      ),
    );
  }
}
