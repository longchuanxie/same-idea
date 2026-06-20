import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 统一 Modal 工具，对齐原型 .modal-backdrop + .modal 样式。
///
/// 使用方式：
/// ```dart
/// final result = await AppModal.show<bool>(context, builder: (ctx) => ...);
/// AppModal.confirm(context, title: '删除确认', message: '确定删除？');
/// ```
abstract final class AppModal {
  /// 通用 Modal 弹窗
  static Future<T?> show<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: builder,
    );
  }

  /// 确认弹窗
  static Future<bool> confirm({
    required BuildContext context,
    required String title,
    required String message,
    String confirmLabel = '确认',
    String cancelLabel = '取消',
    bool isDanger = false,
  }) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final danger = isDark ? MorandiColors.darkDanger : MorandiColors.danger;

    final result = await show<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.modal),
          side: BorderSide(color: line),
        ),
        title: Text(
          title,
          style: AppTypography.headline(color: text),
        ),
        content: Text(
          message,
          style: AppTypography.body(color: muted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              cancelLabel,
              style: AppTypography.small(color: muted),
            ),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: isDanger ? danger : green,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: Text(
              confirmLabel,
              style: AppTypography.small(
                color: Colors.white,
                weight: AppTypography.weightBold,
              ),
            ),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  /// 创建项目弹窗
  static Future<String?> createProject({
    required BuildContext context,
  }) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;

    final controller = TextEditingController();

    final result = await show<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.modal),
          side: BorderSide(color: line),
        ),
        title: Text(
          '创建新项目',
          style: AppTypography.headline(color: text),
        ),
        content: SizedBox(
          width: AppSpacing.modalContentWidth,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: '输入项目名称',
                  hintStyle: AppTypography.body(color: muted),
                ),
                style: AppTypography.body(color: text),
                onSubmitted: (value) {
                  if (value.trim().isNotEmpty) {
                    Navigator.of(ctx).pop(value.trim());
                  }
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(null),
            child: Text(
              '取消',
              style: AppTypography.small(color: muted),
            ),
          ),
          FilledButton(
            onPressed: () {
              final value = controller.text.trim();
              if (value.isNotEmpty) {
                Navigator.of(ctx).pop(value);
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: green,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            child: Text(
              '创建',
              style: AppTypography.small(
                color: Colors.white,
                weight: AppTypography.weightBold,
              ),
            ),
          ),
        ],
      ),
    );
    return result;
  }
}
