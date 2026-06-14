import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/settings/bloc/settings_tab.dart';

class SettingsNav extends StatelessWidget {
  const SettingsNav({
    required this.selected,
    required this.onSelect,
    super.key,
  });

  final SettingsTab selected;
  final ValueChanged<SettingsTab> onSelect;

  static const _items = <(SettingsTab, String, IconData)>[
    (SettingsTab.model, '模型与服务商', Icons.smart_toy_outlined),
    (SettingsTab.general, '通用设置', Icons.tune),
    (SettingsTab.writing, '写作设置', Icons.edit_note),
    (SettingsTab.proof, '编辑与校对', Icons.spellcheck),
    (SettingsTab.shortcuts, '快捷键', Icons.keyboard_alt_outlined),
    (SettingsTab.backup, '数据与备份', Icons.backup_outlined),
    (SettingsTab.about, '关于 Novel Creator', Icons.info_outline),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Container(
        width: 240,
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.xxxl,
        horizontal: AppSpacing.xl,
      ),
      decoration: BoxDecoration(
        color: surface2,
        border: Border(right: BorderSide(color: line)),
      ),
      child: ListView.separated(
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.xs),
        itemBuilder: (context, index) {
          final (tab, label, icon) = _items[index];
          final isActive = tab == selected;
          return _NavItem(
            label: label,
            icon: icon,
            isActive: isActive,
            onTap: () => onSelect(tab),
          );
        },
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;

    return Material(
        color: isActive ? surface : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.lg,
          ),
          child: Row(
            children: <Widget>[
              Icon(icon, size: AppSpacing.iconMedium, color: text),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.body(
                    color: text,
                    weight: isActive ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
