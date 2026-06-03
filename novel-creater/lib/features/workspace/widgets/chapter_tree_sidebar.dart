import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';

class ChapterTreeSidebar extends StatelessWidget {
  const ChapterTreeSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: morandi.fog)),
          ),
          child: Row(
            children: [
              Icon(Icons.folder_open, size: 18, color: morandi.inkLight),
              const SizedBox(width: 8),
              Text(
                'Chapters',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: morandi.inkDark,
                    ),
              ),
            ],
          ),
        ),
        Expanded(
          child: BlocBuilder<ChapterTreeBloc, ChapterTreeState>(
            builder: (context, state) {
              if (state.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }
              if (state.chapters.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      'No chapters yet',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: morandi.inkLight,
                          ),
                    ),
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 4),
                itemCount: state.chapters.length,
                itemBuilder: (context, index) {
                  final chapter = state.chapters[index];
                  final isSelected = chapter.id == state.selectedChapterId;
                  return _ChapterTile(
                    chapter: chapter,
                    isSelected: isSelected,
                  );
                },
              );
            },
          ),
        ),
        const _AddChapterButton(),
      ],
    );
  }
}

class _ChapterTile extends StatelessWidget {
  const _ChapterTile({
    required this.chapter,
    required this.isSelected,
  });

  final Chapter chapter;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return InkWell(
      onTap: () => context
          .read<ChapterTreeBloc>()
          .add(ChapterTreeChapterSelected(chapterId: chapter.id)),
      onSecondaryTapUp: (details) =>
          _showContextMenu(context, details.globalPosition),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? morandi.sage.withOpacity(0.1) : null,
          border: Border(
            left: BorderSide(
              color: isSelected ? morandi.sage : Colors.transparent,
              width: 3,
            ),
          ),
        ),
        child: Row(
          children: [
            _StatusDot(status: chapter.status),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    chapter.title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected ? morandi.inkDark : morandi.inkLight,
                        ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (chapter.wordCount > 0) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${chapter.wordCount} words',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: morandi.stone,
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showContextMenu(BuildContext context, Offset position) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (_) => _ContextMenu(
        position: position,
        onRename: () {
          entry.remove();
          _showRenameDialog(context);
        },
        onDelete: () {
          entry.remove();
          _confirmDelete(context);
        },
      ),
    );
    overlay.insert(entry);
  }

  void _showRenameDialog(BuildContext context) {
    final controller = TextEditingController(text: chapter.title);
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Rename Chapter'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Chapter title'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newTitle = controller.text.trim();
              if (newTitle.isNotEmpty) {
                context.read<ChapterTreeBloc>().add(
                      ChapterTreeChapterRenamed(
                        chapterId: chapter.id,
                        newTitle: newTitle,
                      ),
                    );
              }
              Navigator.of(dialogContext).pop();
            },
            child: const Text('Rename'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete Chapter'),
        content: Text(
          'Are you sure you want to delete "${chapter.title}"? This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<ChapterTreeBloc>().add(
                    ChapterTreeChapterDeleted(chapterId: chapter.id),
                  );
              Navigator.of(dialogContext).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  Theme.of(context).extension<MorandiColors>()?.dustyRose,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _StatusDot extends StatelessWidget {
  const _StatusDot({required this.status});

  final ChapterStatus status;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    final color = switch (status) {
      ChapterStatus.draft => morandi.stone,
      ChapterStatus.reviewing => morandi.dustyRose,
      ChapterStatus.revised => morandi.sage,
      ChapterStatus.published => morandi.softBlue,
      ChapterStatus.locked => morandi.dustyRose,
    };
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}

class _AddChapterButton extends StatelessWidget {
  const _AddChapterButton();

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Container(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: morandi.fog)),
      ),
      child: TextButton.icon(
        onPressed: () {
          final state = context.read<ChapterTreeBloc>().state;
          if (state.chapters.isNotEmpty) {
            final projectId = state.chapters.first.projectId;
            context
                .read<ChapterTreeBloc>()
                .add(ChapterTreeChapterAdded(projectId: projectId));
          }
        },
        icon: Icon(Icons.add, size: 16, color: morandi.sage),
        label: Text(
          'Add Chapter',
          style: TextStyle(color: morandi.sage),
        ),
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0)),
        ),
      ),
    );
  }
}

class _ContextMenu extends StatelessWidget {
  const _ContextMenu({
    required this.position,
    required this.onRename,
    required this.onDelete,
  });

  final Offset position;
  final VoidCallback onRename;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Stack(
      children: [
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          behavior: HitTestBehavior.translucent,
          child: const SizedBox.expand(),
        ),
        Positioned(
          left: position.dx,
          top: position.dy,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 160,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: morandi.fog),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    dense: true,
                    leading: Icon(Icons.edit_outlined, size: 18, color: morandi.inkLight),
                    title: const Text('Rename'),
                    onTap: onRename,
                  ),
                  ListTile(
                    dense: true,
                    leading: Icon(Icons.delete_outline, size: 18, color: morandi.dustyRose),
                    title: Text('Delete', style: TextStyle(color: morandi.dustyRose)),
                    onTap: onDelete,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
