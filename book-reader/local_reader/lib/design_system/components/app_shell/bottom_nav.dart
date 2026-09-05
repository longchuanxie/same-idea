import 'package:flutter/material.dart';

import '../../theme/app_theme_extension.dart';
import 'side_nav.dart';

/// 底部导航栏
/// 手机端使用
class BottomNav extends StatelessWidget {
  const BottomNav({
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

    return NavigationBar(
      backgroundColor: themeExt.surfaceSolid,
      selectedIndex: currentIndex,
      onDestinationSelected: onDestinationSelected,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      destinations: destinations.map((dest) {
        return NavigationDestination(
          icon: Icon(dest.icon),
          selectedIcon: Icon(dest.selectedIcon),
          label: dest.label,
        );
      }).toList(),
    );
  }
}
