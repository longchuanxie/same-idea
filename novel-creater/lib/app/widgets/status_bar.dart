import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 底部状态栏，对齐原型 .status-bar。
///
/// 显示：拼写检查 | 修订数 | 字数 | 版本号
class StatusBar extends StatelessWidget {
  const StatusBar({
    required this.wordCount,
    required this.revisionCount,
    this.isDark = false,
    super.key,
  });

  final int wordCount;
  final int revisionCount;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Container(
      height: AppSpacing.statusBarHeight,
      decoration: BoxDecoration(
        color: bg.withOpacity(0.95),
        border: Border(top: BorderSide(color: line)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxx),
      child: Row(
        children: [
          _StatusItem(
            icon: Icons.spellcheck_outlined,
            label: '拼写检查',
            isDark: isDark,
          ),
          const SizedBox(width: 26),
          _StatusItem(
            icon: Icons.track_changes_outlined,
            label: '修订 $revisionCount',
            isDark: isDark,
          ),
          const Spacer(),
          _StatusItem(
            label: '$wordCount 字',
            isDark: isDark,
          ),
          const SizedBox(width: 26),
          _StatusItem(
            label: 'v0.1.0',
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _StatusItem extends StatelessWidget {
  const _StatusItem({
    this.icon,
    required this.label,
    required this.isDark,
  });

  final IconData? icon;
  final String label;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 13, color: muted),
          const SizedBox(width: 7),
        ],
        Text(
          label,
          style: AppTypography.caption(color: muted),
        ),
      ],
    );
  }
}
