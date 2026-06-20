import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 空状态组件，对齐原型 .empty-hero 面板（插图 + 标题 + 描述 + CTA 按钮）。
class EmptyHeroWidget extends StatelessWidget {
  const EmptyHeroWidget({
    required this.icon,
    required this.title,
    this.description,
    this.actionLabel,
    this.secondaryActionLabel,
    this.onAction,
    this.onSecondaryAction,
    this.isDark = false,
    super.key,
  });

  final IconData icon;
  final String title;
  final String? description;
  final String? actionLabel;
  final String? secondaryActionLabel;
  final VoidCallback? onAction;
  final VoidCallback? onSecondaryAction;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(AppSpacing.xxxx),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 图标区域（带背景圆）
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: green2,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 36, color: green),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text(
              title,
              style: AppTypography.headline(color: text),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(
                description!,
                style: AppTypography.body(color: muted),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null) ...[
              const SizedBox(height: AppSpacing.xl),
              FilledButton(
                onPressed: onAction,
                style: FilledButton.styleFrom(
                  backgroundColor: green,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ),
                child: Text(
                  actionLabel!,
                  style: AppTypography.small(
                    color: Colors.white,
                    weight: AppTypography.weightBold,
                  ),
                ),
              ),
            ],
            if (secondaryActionLabel != null) ...[
              const SizedBox(height: AppSpacing.md),
              OutlinedButton(
                onPressed: onSecondaryAction,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: line),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ),
                child: Text(
                  secondaryActionLabel!,
                  style: AppTypography.small(color: muted),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// 骨架屏卡片，对齐原型 .skeleton-card。
class SkeletonCard extends StatefulWidget {
  const SkeletonCard({
    this.width = 160,
    this.height = 80,
    this.isDark = false,
    super.key,
  });

  final double width;
  final double height;
  final bool isDark;

  @override
  State<SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<SkeletonCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surface2 =
        widget.isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final surface3 =
        widget.isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3;

    return SizedBox(
      width: widget.width,
      height: widget.height,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final value = (_controller.value * 2 - 1).abs();
          return Container(
            decoration: BoxDecoration(
              color: Color.lerp(surface2, surface3, value),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          );
        },
      ),
    );
  }
}

/// 骨架屏行（标题 + 副标题）
class SkeletonLine extends StatefulWidget {
  const SkeletonLine({
    this.width = 120,
    this.height = 12,
    this.isDark = false,
    super.key,
  });

  final double width;
  final double height;
  final bool isDark;

  @override
  State<SkeletonLine> createState() => _SkeletonLineState();
}

class _SkeletonLineState extends State<SkeletonLine>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surface2 =
        widget.isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final surface3 =
        widget.isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final value = (_controller.value * 2 - 1).abs();
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: Color.lerp(surface2, surface3, value),
            borderRadius: BorderRadius.circular(AppRadius.xs),
          ),
        );
      },
    );
  }
}
