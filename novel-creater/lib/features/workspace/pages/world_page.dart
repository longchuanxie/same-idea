import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';

/// 世界观页面，对齐原型 world.html
class WorldPage extends StatelessWidget {
  const WorldPage({
    required this.settingEntries,
    this.isDark = false,
    super.key,
  });

  final List<SettingEntry> settingEntries;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;

    if (settingEntries.isEmpty) {
      return Container(
        color: bg,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.globe2, size: 48, color: muted),
              const SizedBox(height: AppSpacing.xl),
              Text('暂无世界观设定', style: AppTypography.body(color: muted)),
              const SizedBox(height: AppSpacing.md),
              Text('在知识库中创建设定条目', style: AppTypography.small(color: muted)),
            ],
          ),
        ),
      );
    }

    // 按分类分组
    final categories = <SettingCategory, List<SettingEntry>>{};
    for (final entry in settingEntries) {
      categories.putIfAbsent(entry.category, () => []).add(entry);
    }

    return Container(
      color: bg,
      child: Row(
        children: [
          // 左面板：分类目录
          Container(
            width: 220,
            decoration: BoxDecoration(
              color: surface,
              border: Border(right: BorderSide(color: line)),
            ),
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.cardPadding),
              children: [
                Text('世界观目录', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
                const SizedBox(height: AppSpacing.lg),
                ...categories.entries.map((e) => _CategoryItem(
                  category: e.key,
                  count: e.value.length,
                  green: green,
                  text: text,
                  muted: muted,
                  green2: green2,
                )),
              ],
            ),
          ),
          // 右面板：条目列表
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.workspacePadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 统计卡片
                  Wrap(
                    spacing: AppSpacing.lg,
                    runSpacing: AppSpacing.lg,
                    children: [
                      _StatCard(label: '地理', count: categories[SettingCategory.geography]?.length ?? 0, icon: LucideIcons.map, green: green, surface: surface, line: line, text: text, muted: muted),
                      _StatCard(label: '历史', count: categories[SettingCategory.history]?.length ?? 0, icon: LucideIcons.clock, green: green, surface: surface, line: line, text: text, muted: muted),
                      _StatCard(label: '势力', count: categories[SettingCategory.politics]?.length ?? 0, icon: LucideIcons.landmark, green: green, surface: surface, line: line, text: text, muted: muted),
                      _StatCard(label: '规则', count: categories[SettingCategory.magicSystem]?.length ?? 0, icon: LucideIcons.scroll, green: green, surface: surface, line: line, text: text, muted: muted),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xxxx),
                  // 设定条目列表
                  Text('设定条目', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
                  const SizedBox(height: AppSpacing.lg),
                  ...settingEntries.map((entry) => _SettingCard(
                    entry: entry,
                    green: green,
                    green2: green2,
                    surface: surface,
                    line: line,
                    text: text,
                    muted: muted,
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryItem extends StatelessWidget {
  const _CategoryItem({
    required this.category,
    required this.count,
    required this.green,
    required this.text,
    required this.muted,
    required this.green2,
  });

  final SettingCategory category;
  final int count;
  final Color green;
  final Color text;
  final Color muted;
  final Color green2;

  String get _label => switch (category) {
    SettingCategory.geography => '地理',
    SettingCategory.history => '历史',
    SettingCategory.magicSystem => '魔法体系',
    SettingCategory.politics => '政治',
    SettingCategory.culture => '文化',
    SettingCategory.technology => '科技',
    SettingCategory.organization => '组织',
    SettingCategory.items => '物品',
    SettingCategory.other => '其他',
  };

  IconData get _icon => switch (category) {
    SettingCategory.geography => LucideIcons.map,
    SettingCategory.history => LucideIcons.clock,
    SettingCategory.magicSystem => LucideIcons.sparkles,
    SettingCategory.politics => LucideIcons.landmark,
    SettingCategory.culture => LucideIcons.palette,
    SettingCategory.technology => LucideIcons.cpu,
    SettingCategory.organization => LucideIcons.building,
    SettingCategory.items => LucideIcons.box,
    SettingCategory.other => LucideIcons.circle,
  };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        children: [
          Icon(_icon, size: AppSpacing.iconSmall, color: green),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: Text(_label, style: AppTypography.small(color: text))),
          Text('$count', style: AppTypography.caption(color: muted)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.count,
    required this.icon,
    required this.green,
    required this.surface,
    required this.line,
    required this.text,
    required this.muted,
  });

  final String label;
  final int count;
  final IconData icon;
  final Color green;
  final Color surface;
  final Color line;
  final Color text;
  final Color muted;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.cardPaddingSmall),
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: AppSpacing.iconLarge, color: green),
            const SizedBox(height: AppSpacing.md),
            Text('$count', style: AppTypography.title(color: text, weight: AppTypography.weightBold)),
            const SizedBox(height: 2),
            Text(label, style: AppTypography.caption(color: muted)),
          ],
        ),
      ),
    );
  }
}

class _SettingCard extends StatelessWidget {
  const _SettingCard({
    required this.entry,
    required this.green,
    required this.green2,
    required this.surface,
    required this.line,
    required this.text,
    required this.muted,
  });

  final SettingEntry entry;
  final Color green;
  final Color green2;
  final Color surface;
  final Color line;
  final Color text;
  final Color muted;

  String get _categoryLabel => switch (entry.category) {
    SettingCategory.geography => '地理',
    SettingCategory.history => '历史',
    SettingCategory.magicSystem => '魔法体系',
    SettingCategory.politics => '政治',
    SettingCategory.culture => '文化',
    SettingCategory.technology => '科技',
    SettingCategory.organization => '组织',
    SettingCategory.items => '物品',
    SettingCategory.other => '其他',
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(entry.title, style: AppTypography.small(color: text, weight: AppTypography.weightBold)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                decoration: BoxDecoration(
                  color: green2,
                  borderRadius: BorderRadius.circular(AppRadius.xs),
                ),
                child: Text(_categoryLabel, style: AppTypography.caption(color: green)),
              ),
            ],
          ),
          if (entry.content.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(entry.content, style: AppTypography.caption(color: muted), maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
        ],
      ),
    );
  }
}
