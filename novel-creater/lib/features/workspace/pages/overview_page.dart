import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/project.dart';

/// 项目概览页，对齐原型 overview.html
class OverviewPage extends StatelessWidget {
  const OverviewPage({
    required this.project,
    required this.chapterCount,
    required this.totalWordCount,
    required this.progress,
    this.isDark = false,
    this.onActionTap,
    super.key,
  });

  final Project project;
  final int chapterCount;
  final int totalWordCount;
  final double progress;
  final bool isDark;
  final ValueChanged<String>? onActionTap;

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
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.workspacePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero 卡
            Container(
              padding: const EdgeInsets.all(AppSpacing.cardPadding),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: line),
              ),
              child: Row(
                children: [
                  Flexible(
                    child: Container(
                      width: 80,
                      height: 110,
                      decoration: BoxDecoration(
                        color: green2,
                        borderRadius: BorderRadius.circular(AppRadius.largeCover),
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.auto_stories, size: 36, color: green),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.cardPadding),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          project.name,
                          style: AppTypography.headline(color: text),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          '字数 ${_fmtNum(totalWordCount)} · 章节 $chapterCount',
                          style: AppTypography.small(color: muted),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                          child: SizedBox(
                            height: AppSpacing.sm,
                            child: LinearProgressIndicator(
                              value: progress.clamp(0.0, 1.0),
                              backgroundColor: isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3,
                              valueColor: AlwaysStoppedAnimation(green),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Row(
                          children: [
                            Flexible(child: Text('进度', style: AppTypography.caption(color: muted), overflow: TextOverflow.ellipsis)),
                            const SizedBox(width: AppSpacing.xs),
                            Text('${(progress * 100).round()}%', style: AppTypography.caption(color: text, weight: AppTypography.weightBold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxxx),
            // 指标网格
            Wrap(
              spacing: AppSpacing.lg,
              runSpacing: AppSpacing.lg,
              children: [
                _MetricCard(label: '总字数', value: _fmtNum(totalWordCount), icon: LucideIcons.type, isDark: isDark),
                _MetricCard(label: '章节数', value: '$chapterCount', icon: LucideIcons.fileText, isDark: isDark),
                _MetricCard(label: '完成度', value: '${(progress * 100).round()}%', icon: LucideIcons.checkCircle, isDark: isDark),
              ],
            ),
            const SizedBox(height: AppSpacing.xxxx),
            // 快速操作
            Text('快速操作', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
            const SizedBox(height: AppSpacing.lg),
            Wrap(
              spacing: AppSpacing.lg,
              runSpacing: AppSpacing.lg,
              children: [
                _ActionChip(label: '续写当前章节', icon: LucideIcons.pencil, isDark: isDark, onTap: () => onActionTap?.call('续写当前章节')),
                _ActionChip(label: '生成大纲', icon: LucideIcons.goal, isDark: isDark, onTap: () => onActionTap?.call('生成大纲')),
                _ActionChip(label: '角色管理', icon: LucideIcons.users, isDark: isDark, onTap: () => onActionTap?.call('角色管理')),
                _ActionChip(label: '导出', icon: LucideIcons.fileOutput, isDark: isDark, onTap: () => onActionTap?.call('导出')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _fmtNum(int n) {
    if (n >= 10000) return '${(n / 10000).toStringAsFixed(1)}万';
    return n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',');
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.isDark,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return SizedBox(
      width: 160,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.cardPaddingSmall),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: AppSpacing.iconLarge, color: green),
            const SizedBox(height: AppSpacing.md),
            Text(value, style: AppTypography.title(color: text, weight: AppTypography.weightBold)),
            const SizedBox(height: 2),
            Text(label, style: AppTypography.caption(color: muted)),
          ],
        ),
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.label,
    required this.icon,
    required this.isDark,
    this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl, vertical: AppSpacing.lg),
        decoration: BoxDecoration(
          color: surface2,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: line),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: AppSpacing.iconMedium, color: muted),
            const SizedBox(width: AppSpacing.md),
            Flexible(
              child: Text(label, style: AppTypography.small(color: text), overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
      ),
    );
  }
}
