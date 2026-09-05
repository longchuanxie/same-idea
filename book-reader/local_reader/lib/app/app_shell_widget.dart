import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../design_system/components/app_shell/app_shell.dart';
import '../design_system/responsive/adaptive_layout.dart';
import '../design_system/theme/app_theme_extension.dart';
import '../design_system/tokens/app_spacing.dart';
import '../design_system/tokens/app_typography.dart';
import 'app_providers.dart';

/// 导航项定义
final List<NavDestination> _navDestinations = [
  const NavDestination(
    icon: Icons.home_outlined,
    selectedIcon: Icons.home,
    label: '首页',
    routePath: '/home',
  ),
  const NavDestination(
    icon: Icons.auto_stories_outlined,
    selectedIcon: Icons.auto_stories,
    label: '书架',
    routePath: '/shelf',
  ),
  const NavDestination(
    icon: Icons.search_outlined,
    selectedIcon: Icons.search,
    label: '搜索',
    routePath: '/search',
  ),
  const NavDestination(
    icon: Icons.edit_note_outlined,
    selectedIcon: Icons.edit_note,
    label: '笔记',
    routePath: '/notes',
  ),
  const NavDestination(
    icon: Icons.settings_outlined,
    selectedIcon: Icons.settings,
    label: '设置',
    routePath: '/settings',
  ),
];

/// 应用 Shell
/// 手机端：底部导航 + 内容
/// 平板/桌面端：侧边导航 + 内容
class AppShell extends ConsumerWidget {
  const AppShell({
    super.key,
    required this.child,
  });

  final Widget child;

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    for (var i = 0; i < _navDestinations.length; i++) {
      if (location.startsWith(_navDestinations[i].routePath)) {
        return i;
      }
    }
    return 0;
  }

  void _onDestinationSelected(BuildContext context, int index) {
    context.go(_navDestinations[index].routePath);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final index = _currentIndex(context);

    return AdaptiveLayout(
      compact: (context) => _CompactShell(
        currentIndex: index,
        onDestinationSelected: (i) => _onDestinationSelected(context, i),
        child: child,
      ),
      medium: (context) => _MediumShell(
        currentIndex: index,
        onDestinationSelected: (i) => _onDestinationSelected(context, i),
        child: child,
      ),
      expanded: (context) => _ExpandedShell(
        currentIndex: index,
        onDestinationSelected: (i) => _onDestinationSelected(context, i),
        child: child,
      ),
    );
  }
}

/// 手机布局：底部导航
class _CompactShell extends StatelessWidget {
  const _CompactShell({
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.child,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNav(
        destinations: _navDestinations,
        currentIndex: currentIndex,
        onDestinationSelected: onDestinationSelected,
      ),
    );
  }
}

/// 平板布局：侧边导航（窄）
class _MediumShell extends StatelessWidget {
  const _MediumShell({
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.child,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          SideNav(
            destinations: _navDestinations,
            currentIndex: currentIndex,
            onDestinationSelected: onDestinationSelected,
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}

/// 桌面布局：侧边导航（宽）+ TopBar
class _ExpandedShell extends StatelessWidget {
  const _ExpandedShell({
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.child,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Scaffold(
      body: Row(
        children: [
          SideNav(
            destinations: _navDestinations,
            currentIndex: currentIndex,
            onDestinationSelected: onDestinationSelected,
          ),
          Expanded(
            child: Column(
              children: [
                Container(
                  height: TopBar.topBarHeight,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.pageHorizontal,
                  ),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: themeExt.line),
                    ),
                  ),
                  alignment: Alignment.centerLeft,
                  child: Row(
                    children: [
                      Icon(
                        Icons.search,
                        size: 20,
                        color: themeExt.muted,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '搜索书库或输入命令...',
                        style: AppTypography.bodyMedium.copyWith(
                          color: themeExt.subtle,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: Icon(
                          Icons.add_outlined,
                          size: 20,
                          color: themeExt.muted,
                        ),
                        tooltip: '导入书籍',
                        onPressed: () => context.go('/import'),
                      ),
                      const _ThemeToggle(),
                    ],
                  ),
                ),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 主题切换按钮
class _ThemeToggle extends ConsumerWidget {
  const _ThemeToggle();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(isDarkProvider);
    final themeExt = AppThemeExtension.of(context);

    return IconButton(
      icon: Icon(
        isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
        color: themeExt.muted,
      ),
      tooltip: isDark ? '切换日间主题' : '切换夜读主题',
      onPressed: () {
        ref.read(themeModeProvider.notifier).state =
            isDark ? AppThemeMode.light : AppThemeMode.dark;
      },
    );
  }
}
