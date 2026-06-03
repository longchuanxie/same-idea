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

    return Container(
      color: morandi.panel,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _ProjectCard(morandi: morandi),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: SizedBox(
              height: 30,
              child: TextField(
                decoration: InputDecoration(
                  hintText: '搜索章节...',
                  hintStyle: TextStyle(fontSize: 12, color: morandi.muted2),
                  prefixIcon: Icon(Icons.search, size: 14, color: morandi.muted),
                  filled: true,
                  fillColor: morandi.canvas,
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: BorderSide(color: morandi.line),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: BorderSide(color: morandi.line),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: BorderSide(color: morandi.green, width: 1),
                  ),
                ),
                style: TextStyle(fontSize: 12, color: morandi.text),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: morandi.line)),
            ),
            child: Row(
              children: [
                Text(
                  '章节目录',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: morandi.ink,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: Icon(Icons.add, size: 16, color: morandi.green),
                  onPressed: () {
                    final state = context.read<ChapterTreeBloc>().state;
                    if (state.chapters.isNotEmpty) {
                      final projectId = state.chapters.first.projectId;
                      context
                          .read<ChapterTreeBloc>()
                          .add(ChapterTreeChapterAdded(projectId: projectId));
                    }
                  },
                  tooltip: '添加章节',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
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
                        '暂无章节',
                        style: TextStyle(color: morandi.muted),
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
        ],
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 64,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF637B61), Color(0xFFA8B5A2)],
              ),
              borderRadius: BorderRadius.circular(6),
            ),
          ),
          const SizedBox(height: 8),
          BlocBuilder<ChapterTreeBloc, ChapterTreeState>(
            builder: (context, state) {
              final totalWords = state.chapters.fold<int>(
                0,
                (sum, c) => sum + c.wordCount,
              );
              final totalChapters = state.chapters.length;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    totalChapters > 0 ? '$totalChapters 章' : '无章节',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: morandi.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(3),
                          child: LinearProgressIndicator(
                            value: totalChapters > 0 ? 0.3 : 0,
                            backgroundColor: morandi.line,
                            valueColor: AlwaysStoppedAnimation(morandi.green),
                            minHeight: 4,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$totalWords 字',
                        style: TextStyle(fontSize: 11, color: morandi.muted),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ],
      ),
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? morandi.green3 : null,
          border: Border(
            left: BorderSide(
              color: isSelected ? morandi.green : Colors.transparent,
              width: 3,
            ),
          ),
        ),
        child: Row(
          children: [
            _StatusDot(status: chapter.status),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    chapter.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected ? morandi.ink : morandi.muted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (chapter.wordCount > 0) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${chapter.wordCount} 字',
                      style: TextStyle(fontSize: 11, color: morandi.muted2),
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
        title: const Text('重命名章节'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: '章节标题'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('取消'),
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
            child: const Text('重命名'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('删除章节'),
        content: Text(
          '确定删除"${chapter.title}"吗？此操作不可撤销。',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<ChapterTreeBloc>().add(
                    ChapterTreeChapterDeleted(chapterId: chapter.id),
                  );
              Navigator.of(dialogContext).pop();
            },
            style: ElevatedButton.styleFrom(backgroundColor: morandi.red),
            child: const Text('删除'),
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
      ChapterStatus.draft => morandi.muted2,
      ChapterStatus.reviewing => morandi.orange,
      ChapterStatus.revised => morandi.green,
      ChapterStatus.published => morandi.blue,
      ChapterStatus.locked => morandi.red,
    };
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
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
                color: morandi.canvas,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: morandi.line),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    dense: true,
                    leading: Icon(Icons.edit_outlined, size: 18, color: morandi.muted),
                    title: const Text('重命名'),
                    onTap: onRename,
                  ),
                  ListTile(
                    dense: true,
                    leading: Icon(Icons.delete_outline, size: 18, color: morandi.red),
                    title: Text('删除', style: TextStyle(color: morandi.red)),
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
