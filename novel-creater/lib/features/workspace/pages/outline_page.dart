import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

/// 大纲页面，对齐原型 outline.html
class OutlinePage extends StatelessWidget {
  const OutlinePage({
    required this.chapters,
    this.selectedChapterId,
    this.onChapterSelected,
    this.isDark = false,
    super.key,
  });

  final List<Chapter> chapters;
  final String? selectedChapterId;
  final ValueChanged<String>? onChapterSelected;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Container(
      color: bg,
      child: Row(
        children: [
          // 左面板：章节树
          Container(
            width: 260,
            decoration: BoxDecoration(
              color: surface,
              border: Border(right: BorderSide(color: line)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.cardPadding),
                  child: Row(
                    children: [
                      Text('章节结构', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
                      const Spacer(),
                      Text('${chapters.length}', style: AppTypography.caption(color: muted)),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
                    itemCount: chapters.length,
                    itemBuilder: (context, index) {
                      final chapter = chapters[index];
                      final isSelected = chapter.id == selectedChapterId;
                      return _ChapterTreeItem(
                        chapter: chapter,
                        isSelected: isSelected,
                        green: green,
                        green2: green2,
                        text: text,
                        muted: muted,
                        surface2: isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2,
                        onTap: () => onChapterSelected?.call(chapter.id),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          // 右面板：章节详情
          Expanded(
            child: _DetailPanel(
              chapters: chapters,
              selectedChapterId: selectedChapterId,
              isDark: isDark,
            ),
          ),
        ],
      ),
    );
  }
}

class _ChapterTreeItem extends StatelessWidget {
  const _ChapterTreeItem({
    required this.chapter,
    required this.isSelected,
    required this.green,
    required this.green2,
    required this.text,
    required this.muted,
    required this.surface2,
    this.onTap,
  });

  final Chapter chapter;
  final bool isSelected;
  final Color green;
  final Color green2;
  final Color text;
  final Color muted;
  final Color surface2;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final statusLabel = switch (chapter.status) {
      ChapterStatus.draft => '草稿',
      ChapterStatus.reviewing => '审核中',
      ChapterStatus.revised => '已修订',
      ChapterStatus.published => '已完成',
      ChapterStatus.locked => '已锁定',
    };

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Material(
        color: isSelected ? green2 : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
            child: Row(
              children: [
                Icon(LucideIcons.fileText, size: AppSpacing.iconSmall, color: isSelected ? green : muted),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Text(
                    chapter.title,
                    style: AppTypography.small(
                      color: isSelected ? green : text,
                      weight: isSelected ? AppTypography.weightBold : AppTypography.weightRegular,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                  decoration: BoxDecoration(
                    color: surface2,
                    borderRadius: BorderRadius.circular(AppRadius.xs),
                  ),
                  child: Text(statusLabel, style: AppTypography.caption(color: muted)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DetailPanel extends StatelessWidget {
  const _DetailPanel({
    required this.chapters,
    this.selectedChapterId,
    required this.isDark,
  });

  final List<Chapter> chapters;
  final String? selectedChapterId;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    final selectedChapter = chapters.where((c) => c.id == selectedChapterId).firstOrNull;

    if (selectedChapter == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.fileText, size: 48, color: muted),
            const SizedBox(height: AppSpacing.xl),
            Text('选择章节查看详情', style: AppTypography.body(color: muted)),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.workspacePadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 章节头部
          Container(
            padding: const EdgeInsets.all(AppSpacing.cardPadding),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: line),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(selectedChapter.title, style: AppTypography.headline(color: text)),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '${selectedChapter.effectiveWordCount} 字',
                        style: AppTypography.small(color: muted),
                      ),
                    ],
                  ),
                ),
                Icon(LucideIcons.moreHorizontal, size: AppSpacing.iconMedium, color: muted),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xxxx),
          // 章节简介
          Text('章节简介', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
          const SizedBox(height: AppSpacing.lg),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.cardPadding),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: line),
            ),
            child: Text(
              selectedChapter.markdownContent.isNotEmpty
                  ? '${selectedChapter.markdownContent.characters.take(200).toString()}...'
                  : '暂无简介',
              style: AppTypography.small(color: muted),
            ),
          ),
          const SizedBox(height: AppSpacing.xxxx),
          // 故事节拍占位
          Text('故事节拍', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
          const SizedBox(height: AppSpacing.lg),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.cardPadding),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: line),
            ),
            child: Column(
              children: [
                Icon(LucideIcons.listOrdered, size: 32, color: muted),
                const SizedBox(height: AppSpacing.md),
                Text('节拍功能将在后续版本实现', style: AppTypography.small(color: muted)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
