import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 工作区头部：返回按钮 + 页面标题
class WorkspaceHeader extends StatelessWidget {
  const WorkspaceHeader({
    required this.title,
    this.onBack,
    this.isDark = false,
    super.key,
  });

  final String title;
  final VoidCallback? onBack;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.workspacePadding,
        vertical: AppSpacing.xl,
      ),
      child: Row(
        children: [
          if (onBack != null) ...[
            SizedBox(
              width: AppSpacing.iconButtonSize,
              height: AppSpacing.iconButtonSize,
              child: IconButton(
                icon: Icon(LucideIcons.arrowLeft, size: AppSpacing.iconMedium),
                color: muted,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: onBack,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
          ],
          Text(
            title,
            style: AppTypography.title(color: text, weight: AppTypography.weightBold),
          ),
        ],
      ),
    );
  }
}
