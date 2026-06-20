import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 统一 Toast 工具，对齐原型底部居中轻量提示条。
///
/// 使用方式：
/// ```dart
/// AppToast.show(context, message: '已保存');
/// AppToast.show(context, message: '操作失败', type: ToastType.error);
/// ```
abstract final class AppToast {
  static void show(
    BuildContext context, {
    required String message,
    ToastType type = ToastType.success,
    Duration duration = const Duration(seconds: 2),
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    scaffoldMessenger.hideCurrentSnackBar();
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              type._icon,
              size: AppSpacing.iconMedium,
              color: type._foregroundColor(isDark),
            ),
            const SizedBox(width: AppSpacing.md),
            Flexible(
              child: Text(
                message,
                style: AppTypography.small(
                  color: type._foregroundColor(isDark),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        backgroundColor: type._backgroundColor(isDark),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        margin: EdgeInsets.only(
          bottom: 48,
          left: MediaQuery.of(context).size.width * 0.25,
          right: MediaQuery.of(context).size.width * 0.25,
        ),
        duration: duration,
        elevation: 2,
      ),
    );
  }
}

enum ToastType {
  success,
  error,
  info,
  warning;

  IconData get _icon => switch (this) {
        success => Icons.check_circle_outline,
        error => Icons.error_outline,
        info => Icons.info_outline,
        warning => Icons.warning_amber_outlined,
      };

  Color _backgroundColor(bool isDark) => switch (this) {
        success => isDark ? MorandiColors.darkGreen2 : MorandiColors.green2,
        error => isDark
            ? MorandiColors.darkDanger.withOpacity(0.15)
            : MorandiColors.danger.withOpacity(0.1),
        info => isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2,
        warning => isDark
            ? MorandiColors.darkOrange.withOpacity(0.15)
            : MorandiColors.orange.withOpacity(0.1),
      };

  Color _foregroundColor(bool isDark) => switch (this) {
        success => isDark ? MorandiColors.darkGreen : MorandiColors.green,
        error => isDark ? MorandiColors.darkDanger : MorandiColors.danger,
        info => isDark ? MorandiColors.darkText : MorandiColors.text,
        warning => isDark ? MorandiColors.darkOrange : MorandiColors.orange,
      };
}
