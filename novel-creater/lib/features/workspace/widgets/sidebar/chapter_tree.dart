import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/chapter.dart';

/// 章节树：卷折叠 + 章节列表 + 选中态 + 更多按钮
class ChapterTree extends StatelessWidget {
  const ChapterTree({
    required this.chapters,
    required this.selectedChapterId,
    required this.onChapterSelected,
    this.isDark = false,
    this.isExpanded = true,
    this.onToggleExpanded,
    super.key,
  });

  final List<Chapter> chapters;
  final String? selectedChapterId;
  final ValueChanged<String> onChapterSelected;
  final bool isDark;
  final bool isExpanded;
  final VoidCallback? onToggleExpanded;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 章节折叠按钮
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.sm),
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              onTap: onToggleExpanded,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 7),
                child: Row(
                  children: [
                    Icon(LucideIcons.fileText, size: AppSpacing.iconMedium, color: muted),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      child: Text(
                        '章节',
                        style: AppTypography.small(color: text, weight: AppTypography.weightRegular),
                      ),
                    ),
                    Icon(
                      isExpanded ? LucideIcons.chevronDown : LucideIcons.chevronRight,
                      size: AppSpacing.iconSmall,
                      color: muted,
                    ),
                  ],
                ),
              ),
            ),
          ),
          // 章节列表
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.only(left: AppSpacing.xxl),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: chapters.map((chapter) {
                  final isSelected = chapter.id == selectedChapterId;
                  return _ChapterItem(
                    title: chapter.title,
                    isSelected: isSelected,
                    isDark: isDark,
                    onTap: () => onChapterSelected(chapter.id),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}

class _ChapterItem extends StatelessWidget {
  const _ChapterItem({
    required this.title,
    required this.isSelected,
    required this.isDark,
    this.onTap,
  });

  final String title;
  final bool isSelected;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Material(
      color: isSelected ? green2 : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.sm),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          child: Row(
            children: [
              if (isSelected)
                Icon(LucideIcons.sparkles, size: 12, color: green)
              else
                const SizedBox(width: AppSpacing.xl),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  title,
                  style: AppTypography.small(
                    color: isSelected ? green : text,
                    weight: isSelected ? AppTypography.weightBold : AppTypography.weightRegular,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isSelected)
                Icon(LucideIcons.moreHorizontal, size: 14, color: muted),
            ],
          ),
        ),
      ),
    );
  }
}
