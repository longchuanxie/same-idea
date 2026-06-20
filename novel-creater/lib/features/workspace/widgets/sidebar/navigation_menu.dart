import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 侧边栏导航菜单项
enum SidebarNavItem {
  overview('项目概览', LucideIcons.home),
  outline('大纲', LucideIcons.goal),
  characters('角色', LucideIcons.users),
  world('世界观', LucideIcons.globe2),
  notes('笔记', LucideIcons.bookOpen),
  sessions('会话', LucideIcons.messageSquare),
  export('导出', LucideIcons.fileOutput);

  const SidebarNavItem(this.label, this.icon);

  final String label;
  final IconData icon;
}

/// 导航菜单
class NavigationMenu extends StatelessWidget {
  const NavigationMenu({
    required this.selectedItem,
    required this.onItemSelected,
    this.badges = const {},
    this.isDark = false,
    super.key,
  });

  final SidebarNavItem selectedItem;
  final ValueChanged<SidebarNavItem> onItemSelected;
  final Map<SidebarNavItem, int> badges;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: SidebarNavItem.values.map((item) {
          final isSelected = item == selectedItem;
          return _NavItem(
            item: item,
            isSelected: isSelected,
            badge: badges[item],
            isDark: isDark,
            onTap: () => onItemSelected(item),
          );
        }).toList(),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.item,
    required this.isSelected,
    required this.isDark,
    this.badge,
    this.onTap,
  });

  final SidebarNavItem item;
  final bool isSelected;
  final bool isDark;
  final int? badge;
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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          child: Row(
            children: [
              Icon(item.icon, size: AppSpacing.iconMedium, color: isSelected ? green : muted),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  item.label,
                  style: AppTypography.small(
                    color: isSelected ? green : text,
                    weight: isSelected ? AppTypography.weightBold : AppTypography.weightRegular,
                  ),
                ),
              ),
              if (badge != null && badge! > 0)
                Text(
                  '${badge!}',
                  style: AppTypography.caption(color: muted),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
