import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

class SettingsPlaceholderPane extends StatelessWidget {
  const SettingsPlaceholderPane({
    required this.title,
    required this.description,
    super.key,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xxxx + AppSpacing.xxl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: AppTypography.headline(color: text, weight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            description,
            style: AppTypography.body(color: text),
          ),
          const SizedBox(height: AppSpacing.xxxx + AppSpacing.xs),
          DecoratedBox(
            decoration: BoxDecoration(
              color: surface2,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: line),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xxxx + AppSpacing.xs),
              child: Text(
                '该模块在当前里程碑仅作占位，后续里程碑将逐步实现。',
                style: AppTypography.body(color: text),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
