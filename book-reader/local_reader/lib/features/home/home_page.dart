import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/home_service.dart';

/// 首页 Bento 布局
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeDataAsync = ref.watch(homeDataProvider);

    return homeDataAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('加载失败: $error')),
      data: (data) => _HomeContent(data: data),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.data});

  final HomeData data;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.pageHorizontal,
        vertical: AppSpacing.lg,
      ),
      children: [
        // 继续阅读
        if (data.continueReading.isNotEmpty) ...[
          const _SectionTitle(title: '继续阅读'),
          const SizedBox(height: AppSpacing.md),
          _ContinueReadingCard(book: data.continueReading.first),
          const SizedBox(height: AppSpacing.sectionGap),
        ],

        // 书库统计
        const _SectionTitle(title: '书库概览'),
        const SizedBox(height: AppSpacing.md),
        _StatsRow(stats: data.stats, themeExt: themeExt),
        const SizedBox(height: AppSpacing.sectionGap),

        // 最近添加
        if (data.recentBooks.isNotEmpty) ...[
          const _SectionTitle(title: '最近添加'),
          const SizedBox(height: AppSpacing.md),
          _RecentBooksList(books: data.recentBooks),
        ],

        // 空状态
        if (data.continueReading.isEmpty && data.recentBooks.isEmpty)
          const _EmptyState(),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);
    return Text(
      title,
      style: AppTypography.headlineMedium.copyWith(
        color: themeExt.ink,
      ),
    );
  }
}

class _ContinueReadingCard extends StatelessWidget {
  const _ContinueReadingCard({required this.book});

  final Book book;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: themeExt.accentSoft,
        borderRadius: BorderRadius.circular(themeExt.radiusLg),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  book.title,
                  style: AppTypography.titleMedium.copyWith(
                    color: themeExt.ink,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (book.author != null && book.author!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    book.author!,
                    style: AppTypography.bodySmall.copyWith(
                      color: themeExt.muted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          Icon(
            Icons.play_circle_outline,
            color: themeExt.accent,
            size: 40,
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats, required this.themeExt});

  final LibraryStats stats;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatItem(
          label: '书籍',
          value: '${stats.totalBooks}',
          icon: Icons.auto_stories_outlined,
          themeExt: themeExt,
        ),
        const SizedBox(width: AppSpacing.md),
        _StatItem(
          label: '系列',
          value: '${stats.totalSeries}',
          icon: Icons.collections_bookmark_outlined,
          themeExt: themeExt,
        ),
        const SizedBox(width: AppSpacing.md),
        _StatItem(
          label: '笔记',
          value: '${stats.totalNotes}',
          icon: Icons.edit_note_outlined,
          themeExt: themeExt,
        ),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.themeExt,
  });

  final String label;
  final String value;
  final IconData icon;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: themeExt.surfaceSolid,
          borderRadius: BorderRadius.circular(themeExt.radiusMd),
        ),
        child: Column(
          children: [
            Icon(icon, color: themeExt.accent, size: 24),
            const SizedBox(height: AppSpacing.sm),
            Text(
              value,
              style: AppTypography.headlineMedium.copyWith(
                color: themeExt.ink,
              ),
            ),
            Text(
              label,
              style: AppTypography.labelSmall.copyWith(
                color: themeExt.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentBooksList extends StatelessWidget {
  const _RecentBooksList({required this.books});

  final List<Book> books;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Column(
      children: books.map((book) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.listItemGap),
          child: ListTile(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(themeExt.radiusMd),
            ),
            tileColor: themeExt.surfaceSolid,
            leading: Container(
              width: 40,
              height: 56,
              decoration: BoxDecoration(
                color: themeExt.accentSoft,
                borderRadius: BorderRadius.circular(themeExt.radiusSm),
              ),
              alignment: Alignment.center,
              child: Icon(
                _formatIcon(book.format),
                color: themeExt.accent,
                size: 20,
              ),
            ),
            title: Text(
              book.title,
              style: AppTypography.bodyMedium.copyWith(color: themeExt.ink),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: book.author != null && book.author!.isNotEmpty
                ? Text(
                    book.author!,
                    style:
                        AppTypography.bodySmall.copyWith(color: themeExt.muted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  )
                : null,
          ),
        );
      }).toList(),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
        child: Column(
          children: [
            Icon(
              Icons.auto_stories_outlined,
              size: 64,
              color: themeExt.subtle,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              '书库为空',
              style: AppTypography.headlineMedium.copyWith(
                color: themeExt.muted,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '导入书籍开始阅读',
              style: AppTypography.bodyMedium.copyWith(
                color: themeExt.subtle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

IconData _formatIcon(BookFormat format) {
  switch (format) {
    case BookFormat.txt:
    case BookFormat.markdown:
    case BookFormat.html:
      return Icons.description_outlined;
    case BookFormat.epub:
      return Icons.auto_stories_outlined;
    case BookFormat.pdf:
      return Icons.picture_as_pdf_outlined;
    case BookFormat.cbz:
    case BookFormat.cbr:
    case BookFormat.zipImages:
    case BookFormat.dirImages:
      return Icons.image_outlined;
  }
}
