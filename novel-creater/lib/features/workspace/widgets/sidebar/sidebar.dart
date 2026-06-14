import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/brand_row.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/chapter_tree.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/navigation_menu.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/project_mini_card.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/search_row.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/sidebar_footer.dart';

/// 完整侧边栏，对齐原型 .sidebar。
///
/// 结构：品牌行 → 项目迷你卡 → 搜索行 → 导航菜单 → 章节树 → 底部工具栏
class Sidebar extends StatelessWidget {
  const Sidebar({
    required this.project,
    required this.chapters,
    required this.selectedChapterId,
    required this.selectedNavItem,
    required this.onChapterSelected,
    required this.onNavItemSelected,
    this.isDark = false,
    this.chapterTreeExpanded = true,
    this.onToggleChapterTree,
    this.onSearchChanged,
    this.onFilterTap,
    this.onCreateTap,
    this.onSettingsTap,
    this.onHelpTap,
    this.onThemeToggle,
    this.onCollapseTap,
    this.navBadges = const {},
    super.key,
  });

  final Project project;
  final List<Chapter> chapters;
  final String? selectedChapterId;
  final SidebarNavItem selectedNavItem;
  final ValueChanged<String> onChapterSelected;
  final ValueChanged<SidebarNavItem> onNavItemSelected;
  final bool isDark;
  final bool chapterTreeExpanded;
  final VoidCallback? onToggleChapterTree;
  final ValueChanged<String>? onSearchChanged;
  final VoidCallback? onFilterTap;
  final VoidCallback? onCreateTap;
  final VoidCallback? onSettingsTap;
  final VoidCallback? onHelpTap;
  final VoidCallback? onThemeToggle;
  final VoidCallback? onCollapseTap;
  final Map<SidebarNavItem, int> navBadges;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Container(
      width: AppSpacing.sidebarWidth,
      decoration: BoxDecoration(
        color: bg,
        border: Border(right: BorderSide(color: line)),
      ),
      child: Column(
        children: [
          const SizedBox(height: AppSpacing.xxl),
          BrandRow(isDark: isDark),
          const SizedBox(height: AppSpacing.xxl),
          ProjectMiniCard(
            projectName: project.name,
            status: '进行中',
            wordCount: chapters.fold(0, (sum, c) => sum + c.effectiveWordCount),
            chapterCount: chapters.length,
            progress: _calcProgress(),
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.xxl),
          SearchRow(
            onSearchChanged: onSearchChanged,
            onFilterTap: onFilterTap,
            onCreateTap: onCreateTap,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
          // 导航菜单 + 章节树（可滚动）
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  NavigationMenu(
                    selectedItem: selectedNavItem,
                    onItemSelected: onNavItemSelected,
                    badges: navBadges,
                    isDark: isDark,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  ChapterTree(
                    chapters: chapters,
                    selectedChapterId: selectedChapterId,
                    onChapterSelected: onChapterSelected,
                    isDark: isDark,
                    isExpanded: chapterTreeExpanded,
                    onToggleExpanded: onToggleChapterTree,
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.md),
          SidebarFooter(
            onSettingsTap: onSettingsTap,
            onHelpTap: onHelpTap,
            onThemeToggle: onThemeToggle,
            onCollapseTap: onCollapseTap,
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  double _calcProgress() {
    if (chapters.isEmpty) return 0;
    final published = chapters.where((c) => c.status == ChapterStatus.published).length;
    return published / chapters.length;
  }
}
