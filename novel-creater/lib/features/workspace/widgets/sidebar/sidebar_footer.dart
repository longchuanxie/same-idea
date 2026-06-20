import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 侧边栏底部工具栏：设置 / 帮助 / 主题切换 / 折叠
class SidebarFooter extends StatelessWidget {
  const SidebarFooter({
    this.onSettingsTap,
    this.onHelpTap,
    this.onThemeToggle,
    this.onCollapseTap,
    this.isDark = false,
    super.key,
  });

  final VoidCallback? onSettingsTap;
  final VoidCallback? onHelpTap;
  final VoidCallback? onThemeToggle;
  final VoidCallback? onCollapseTap;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Row(
        children: [
          _FooterBtn(icon: LucideIcons.settings, isDark: isDark, onTap: onSettingsTap),
          const SizedBox(width: AppSpacing.xs),
          _FooterBtn(icon: LucideIcons.helpCircle, isDark: isDark, onTap: onHelpTap),
          const SizedBox(width: AppSpacing.xs),
          _FooterBtn(
            icon: isDark ? LucideIcons.moon : LucideIcons.sun,
            isDark: isDark,
            onTap: onThemeToggle,
          ),
          const Spacer(),
          _FooterBtn(icon: LucideIcons.chevronsLeft, isDark: isDark, onTap: onCollapseTap),
        ],
      ),
    );
  }
}

class _FooterBtn extends StatelessWidget {
  const _FooterBtn({required this.icon, required this.isDark, this.onTap});

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
