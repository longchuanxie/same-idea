import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';

/// 角色页面，对齐原型 characters.html
class CharactersPage extends StatelessWidget {
  const CharactersPage({
    required this.characters,
    this.isDark = false,
    super.key,
  });

  final List<Character> characters;
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

    if (characters.isEmpty) {
      return Container(
        color: bg,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.users, size: 48, color: muted),
              const SizedBox(height: AppSpacing.xl),
              Text('暂无角色', style: AppTypography.body(color: muted)),
              const SizedBox(height: AppSpacing.md),
              Text('在知识库中创建角色', style: AppTypography.small(color: muted)),
            ],
          ),
        ),
      );
    }

    // 按角色类型分组
    final protagonists = characters.where((c) => c.role == CharacterRole.protagonist).toList();
    final antagonists = characters.where((c) => c.role == CharacterRole.antagonist).toList();
    final supporting = characters.where((c) => c.role == CharacterRole.supporting).toList();
    final others = characters.where((c) => c.role == CharacterRole.minor).toList();

    return Container(
      color: bg,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.workspacePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 角色统计
            Wrap(
              spacing: AppSpacing.lg,
              runSpacing: AppSpacing.lg,
              children: [
                _StatCard(label: '主角', count: protagonists.length, icon: LucideIcons.crown, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '反派', count: antagonists.length, icon: LucideIcons.shieldAlert, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '配角', count: supporting.length, icon: LucideIcons.user, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '龙套', count: others.length, icon: LucideIcons.userX, green: green, surface: surface, line: line, text: text, muted: muted),
              ],
            ),
            const SizedBox(height: AppSpacing.xxxx),
            // 角色卡片网格
            if (protagonists.isNotEmpty) ...[
              Text('主角', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
              const SizedBox(height: AppSpacing.lg),
              Wrap(
                spacing: AppSpacing.lg,
                runSpacing: AppSpacing.lg,
                children: protagonists.map((c) => _CharacterCard(character: c, green: green, green2: green2, surface: surface, line: line, text: text, muted: muted)).toList(),
              ),
              const SizedBox(height: AppSpacing.xxxx),
            ],
            if (antagonists.isNotEmpty) ...[
              Text('反派', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
              const SizedBox(height: AppSpacing.lg),
              Wrap(
                spacing: AppSpacing.lg,
                runSpacing: AppSpacing.lg,
                children: antagonists.map((c) => _CharacterCard(character: c, green: green, green2: green2, surface: surface, line: line, text: text, muted: muted)).toList(),
              ),
              const SizedBox(height: AppSpacing.xxxx),
            ],
            if (supporting.isNotEmpty) ...[
              Text('配角', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
              const SizedBox(height: AppSpacing.lg),
              Wrap(
                spacing: AppSpacing.lg,
                runSpacing: AppSpacing.lg,
                children: supporting.map((c) => _CharacterCard(character: c, green: green, green2: green2, surface: surface, line: line, text: text, muted: muted)).toList(),
              ),
              const SizedBox(height: AppSpacing.xxxx),
            ],
            if (others.isNotEmpty) ...[
              Text('龙套', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
              const SizedBox(height: AppSpacing.lg),
              Wrap(
                spacing: AppSpacing.lg,
                runSpacing: AppSpacing.lg,
                children: others.map((c) => _CharacterCard(character: c, green: green, green2: green2, surface: surface, line: line, text: text, muted: muted)).toList(),
              ),
            ],
          ],
        ),
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

class _CharacterCard extends StatelessWidget {
  const _CharacterCard({
    required this.character,
    required this.green,
    required this.green2,
    required this.surface,
    required this.line,
    required this.text,
    required this.muted,
  });

  final Character character;
  final Color green;
  final Color green2;
  final Color surface;
  final Color line;
  final Color text;
  final Color muted;

  String get _roleLabel => switch (character.role) {
    CharacterRole.protagonist => '主角',
    CharacterRole.antagonist => '反派',
    CharacterRole.supporting => '配角',
    CharacterRole.minor => '龙套',
  };

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Container(
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
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: green2,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  alignment: Alignment.center,
                  child: Icon(LucideIcons.user, size: 20, color: green),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(character.name, style: AppTypography.small(color: text, weight: AppTypography.weightBold), overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                        decoration: BoxDecoration(
                          color: green2,
                          borderRadius: BorderRadius.circular(AppRadius.xs),
                        ),
                        child: Text(_roleLabel, style: AppTypography.caption(color: green)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (character.description.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.md),
              Text(
                character.description,
                style: AppTypography.caption(color: muted),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
