import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// 搜索行：搜索框 + 筛选按钮 + 新建按钮
class SearchRow extends StatelessWidget {
  const SearchRow({
    this.onSearchChanged,
    this.onFilterTap,
    this.onCreateTap,
    this.isDark = false,
    super.key,
  });

  final ValueChanged<String>? onSearchChanged;
  final VoidCallback? onFilterTap;
  final VoidCallback? onCreateTap;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sidebarPadding),
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: AppSpacing.searchBoxHeight,
              child: TextField(
                onChanged: onSearchChanged,
                style: AppTypography.small(color: isDark ? MorandiColors.darkText : MorandiColors.text),
                decoration: InputDecoration(
                  prefixIcon: Icon(LucideIcons.search, size: AppSpacing.iconSmall, color: muted),
                  hintText: '搜索（⌘K）',
                  hintStyle: AppTypography.small(color: isDark ? MorandiColors.darkFaint : MorandiColors.faint),
                  filled: true,
                  fillColor: surface,
                  contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide(color: line),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide(color: line),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide(color: isDark ? MorandiColors.darkGreen : MorandiColors.green),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          _SquareBtn(icon: LucideIcons.listFilter, isDark: isDark, onTap: onFilterTap),
          const SizedBox(width: AppSpacing.xs),
          _SquareBtn(icon: LucideIcons.plus, isDark: isDark, onTap: onCreateTap),
        ],
      ),
    );
  }
}

class _SquareBtn extends StatelessWidget {
  const _SquareBtn({required this.icon, required this.isDark, this.onTap});

  final IconData icon;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return SizedBox(
      width: AppSpacing.squareButtonSize,
      height: AppSpacing.squareButtonSize,
      child: Material(
        color: isDark ? MorandiColors.darkSurface : MorandiColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: BorderSide(color: line),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.md),
          onTap: onTap,
          child: Icon(icon, size: AppSpacing.iconMedium, color: muted),
        ),
      ),
    );
  }
}
