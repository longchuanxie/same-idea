import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 品牌行：Logo + "Novel Creator" + 同步/下载按钮
class BrandRow extends StatelessWidget {
  const BrandRow({this.isDark = false, super.key});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Row(
        children: [
          Icon(LucideIcons.feather, size: AppSpacing.iconLarge, color: isDark ? MorandiColors.darkGreen : MorandiColors.green),
          const SizedBox(width: AppSpacing.md),
          Flexible(
            child: Text(
              'Novel Creator',
              style: AppTypography.body(color: text, weight: AppTypography.weightBold),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const Spacer(),
          _GhostBtn(icon: LucideIcons.refreshCw, isDark: isDark),
          const SizedBox(width: AppSpacing.xs),
          _GhostBtn(icon: LucideIcons.download, isDark: isDark),
        ],
      ),
    );
  }
}

class _GhostBtn extends StatelessWidget {
  const _GhostBtn({required this.icon, required this.isDark, this.onTap});

  final IconData icon;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return SizedBox(
      width: AppSpacing.iconButtonSize,
      height: AppSpacing.iconButtonSize,
      child: IconButton(
        icon: Icon(icon, size: AppSpacing.iconMedium),
        color: muted,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
        onPressed: onTap,
      ),
    );
  }
}
