import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/enums/note_category.dart';

/// 笔记页面，对齐原型 notes.html
class NotesPage extends StatelessWidget {
  const NotesPage({
    required this.notes,
    this.isDark = false,
    super.key,
  });

  final List<Note> notes;
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

    if (notes.isEmpty) {
      return Container(
        color: bg,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.bookOpen, size: 48, color: muted),
              const SizedBox(height: AppSpacing.xl),
              Text('暂无笔记', style: AppTypography.body(color: muted)),
              const SizedBox(height: AppSpacing.md),
              Text('在知识库中创建笔记', style: AppTypography.small(color: muted)),
            ],
          ),
        ),
      );
    }

    // 按分类分组
    final categories = <NoteCategory, List<Note>>{};
    for (final note in notes) {
      categories.putIfAbsent(note.category, () => []).add(note);
    }

    return Container(
      color: bg,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.workspacePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 笔记统计
            Wrap(
              spacing: AppSpacing.lg,
              runSpacing: AppSpacing.lg,
              children: [
                _StatCard(label: '总笔记', count: notes.length, icon: LucideIcons.bookOpen, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '情节', count: categories[NoteCategory.plot]?.length ?? 0, icon: LucideIcons.mapPin, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '灵感', count: categories[NoteCategory.idea]?.length ?? 0, icon: LucideIcons.lightbulb, green: green, surface: surface, line: line, text: text, muted: muted),
                _StatCard(label: '调研', count: categories[NoteCategory.research]?.length ?? 0, icon: LucideIcons.search, green: green, surface: surface, line: line, text: text, muted: muted),
              ],
            ),
            const SizedBox(height: AppSpacing.xxxx),
            // 笔记列表
            Text('全部笔记', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
            const SizedBox(height: AppSpacing.lg),
            ...notes.map((note) => _NoteCard(
              note: note,
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

class _NoteCard extends StatelessWidget {
  const _NoteCard({
    required this.note,
    required this.green,
    required this.green2,
    required this.surface,
    required this.line,
    required this.text,
    required this.muted,
  });

  final Note note;
  final Color green;
  final Color green2;
  final Color surface;
  final Color line;
  final Color text;
  final Color muted;

  String get _categoryLabel => switch (note.category) {
    NoteCategory.plot => '情节',
    NoteCategory.character => '角色相关',
    NoteCategory.worldbuilding => '世界观',
    NoteCategory.research => '调研',
    NoteCategory.idea => '灵感',
    NoteCategory.decision => '决策',
    NoteCategory.issue => '问题',
    NoteCategory.misc => '其他',
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
                child: Text(note.title, style: AppTypography.small(color: text, weight: AppTypography.weightBold)),
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
          if (note.content.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(note.content, style: AppTypography.caption(color: muted), maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
          if (note.tags.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Wrap(
              spacing: AppSpacing.xs,
              children: note.tags.map((tag) => Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                decoration: BoxDecoration(
                  color: green2,
                  borderRadius: BorderRadius.circular(AppRadius.xs),
                ),
                child: Text(tag, style: AppTypography.caption(color: green)),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
