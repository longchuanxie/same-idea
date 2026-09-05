import 'package:flutter/material.dart';

import '../../theme/app_theme_extension.dart';
import '../../tokens/app_spacing.dart';
import '../../tokens/app_typography.dart';

/// 导航项数据
class NavDestination {
  const NavDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.routePath,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String routePath;
}

/// 侧边导航栏
/// 平板/桌面端使用，固定在左侧
class SideNav extends StatelessWidget {
  const SideNav({
    super.key,
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
  });

  final List<NavDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Container(
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(color: themeExt.line),
        ),
      ),
      child: NavigationRail(
        backgroundColor: themeExt.surface.withOpacity(0.38),
        selectedIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
        leading: Padding(
          padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.navPadding - AppSpacing.sm,
          ),
          child: _buildBrand(context),
        ),
        labelType: NavigationRailLabelType.all,
        destinations: destinations.map((dest) {
          return NavigationRailDestination(
            icon: Icon(dest.icon),
            selectedIcon: Icon(dest.selectedIcon),
            label: Text(dest.label),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBrand(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Column(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(themeExt.radiusMd),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                themeExt.ink,
                themeExt.muted,
              ],
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            '墨',
            style: AppTypography.titleMedium.copyWith(
              color: themeExt.surfaceSolid,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          '墨韵',
          style: AppTypography.labelSmall.copyWith(
            color: themeExt.muted,
          ),
        ),
      ],
    );
  }
}
