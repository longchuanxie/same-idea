import 'package:flutter/material.dart';

import '../../theme/app_theme_extension.dart';
import '../../tokens/app_spacing.dart';
import '../../tokens/app_typography.dart';

/// 顶部导航栏
/// 桌面/平板端显示标题、Command Search 入口、主题切换等
class TopBar extends StatelessWidget implements PreferredSizeWidget {
  const TopBar({
    super.key,
    this.title,
    this.subtitle,
    this.actions,
  });

  final String? title;
  final String? subtitle;
  final List<Widget>? actions;

  static const double topBarHeight = 56.0;

  @override
  Size get preferredSize => const Size.fromHeight(topBarHeight);

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return AppBar(
      backgroundColor: themeExt.surface.withOpacity(0.6),
      title: Row(
        children: [
          if (title != null)
            Text(
              title!,
              style: AppTypography.headlineMedium.copyWith(
                color: themeExt.ink,
              ),
            ),
          if (subtitle != null) ...[
            const SizedBox(width: AppSpacing.sm),
            Text(
              subtitle!,
              style: AppTypography.bodySmall.copyWith(
                color: themeExt.muted,
              ),
            ),
          ],
        ],
      ),
      actions: actions,
    );
  }
}
