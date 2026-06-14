import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';

class ChapterTreeSidebar extends StatelessWidget {
  const ChapterTreeSidebar({
    required this.project,
    required this.chapters,
    required this.selectedChapterId,
    required this.onChapterSelected,
    required this.onChapterCreated,
    super.key,
  });

  static const width = 260.0;
  static const _padding = 20.0;
  static const _spacing = 16.0;
  static const _chapterRadius = 14.0;

  final Project project;
  final List<Chapter> chapters;
  final String? selectedChapterId;
  final ValueChanged<String> onChapterSelected;
  final VoidCallback onChapterCreated;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      width: width,
      padding: const EdgeInsets.all(_padding),
      decoration: const BoxDecoration(
        color: MorandiColors.mist,
        border: Border(
          right: BorderSide(color: MorandiColors.sage),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            project.name,
            style: textTheme.titleLarge?.copyWith(
              color: MorandiColors.ink,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: _spacing),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text(
                '章节结构',
                style: textTheme.labelLarge?.copyWith(color: MorandiColors.ink),
              ),
              TextButton(
                onPressed: onChapterCreated,
                child: const Text('新建章节'),
              ),
            ],
          ),
          const SizedBox(height: _spacing),
          Expanded(
            child: ListView.separated(
              itemCount: chapters.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final chapter = chapters[index];
                final isSelected = chapter.id == selectedChapterId;

                return Material(
                  color: isSelected ? MorandiColors.paper : MorandiColors.mist,
                  borderRadius: BorderRadius.circular(_chapterRadius),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(_chapterRadius),
                    onTap: () => onChapterSelected(chapter.id),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      child: Text(
                        chapter.title,
                        style: textTheme.bodyLarge?.copyWith(
                          color: MorandiColors.ink,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: _spacing),
          const Divider(color: MorandiColors.sage, height: 1),
          const SizedBox(height: 8),
          _SidebarNavButton(
            icon: Icons.menu_book_outlined,
            label: '知识库',
            onTap: () => Navigator.of(context).pushNamed(
              '/knowledge_base',
              arguments: project.id,
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarNavButton extends StatelessWidget {
  const _SidebarNavButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Row(
            children: [
              Icon(icon, size: 18, color: MorandiColors.sage),
              const SizedBox(width: 10),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: MorandiColors.ink,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
