import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 项目迷你卡片：封面 + 标题/状态/字数/进度条
class ProjectMiniCard extends StatelessWidget {
  const ProjectMiniCard({
    required this.projectName,
    required this.status,
    required this.wordCount,
    required this.chapterCount,
    required this.progress,
    this.isDark = false,
    super.key,
  });

  final String projectName;
  final String status;
  final int wordCount;
  final int chapterCount;
  final double progress; // 0.0 ~ 1.0
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: isDark ? MorandiColors.darkLine : MorandiColors.line),
        ),
        child: Row(
          children: [
            // 封面缩略图
            Container(
              width: 52,
              height: 68,
              decoration: BoxDecoration(
                color: green2,
                borderRadius: BorderRadius.circular(AppRadius.miniCover),
              ),
              alignment: Alignment.center,
              child: Icon(Icons.auto_stories, size: 24, color: green),
            ),
            const SizedBox(width: AppSpacing.xl),
            // 信息区
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          projectName,
                          style: AppTypography.small(color: text, weight: AppTypography.weightBold),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
                        decoration: BoxDecoration(
                          color: green2,
                          borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                        ),
                        child: Text(
                          status,
                          style: AppTypography.caption(color: green, weight: AppTypography.weightBold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '字数 ${_formatNumber(wordCount)} · 章节 $chapterCount',
                    style: AppTypography.caption(color: muted),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  // 进度条
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                    child: SizedBox(
                      height: 4,
                      child: LinearProgressIndicator(
                        value: progress.clamp(0.0, 1.0),
                        backgroundColor: isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3,
                        valueColor: AlwaysStoppedAnimation(green),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('进度', style: AppTypography.caption(color: muted)),
                      Text('${(progress * 100).round()}%', style: AppTypography.caption(color: text, weight: AppTypography.weightBold)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatNumber(int n) {
    if (n >= 10000) return '${(n / 10000).toStringAsFixed(1)}万';
    return n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',');
  }
}
