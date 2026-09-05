import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/shelf_service.dart';

/// 书架分区分页页面
class ShelfPage extends ConsumerWidget {
  const ShelfPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shelfPageAsync = ref.watch(shelfPageProvider);

    return shelfPageAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('加载失败: $error')),
      data: (page) => _ShelfContent(page: page),
    );
  }
}

class _ShelfContent extends ConsumerWidget {
  const _ShelfContent({required this.page});

  final ShelfPageResult page;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeExt = AppThemeExtension.of(context);

    if (page.books.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shelves, size: 64, color: themeExt.subtle),
            const SizedBox(height: AppSpacing.lg),
            Text(
              '书架为空',
              style: AppTypography.headlineMedium.copyWith(
                color: themeExt.muted,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '导入书籍后它们将出现在这里',
              style: AppTypography.bodyMedium.copyWith(
                color: themeExt.subtle,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        // 排序控制栏
        _SortBar(totalItems: page.totalItems),
        // 书籍网格
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.pageHorizontal,
              vertical: AppSpacing.md,
            ),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 0.65,
              crossAxisSpacing: AppSpacing.md,
              mainAxisSpacing: AppSpacing.md,
            ),
            itemCount: page.books.length,
            itemBuilder: (context, index) {
              return _BookCard(book: page.books[index]);
            },
          ),
        ),
        // 分页控制
        if (page.totalPages > 1)
          _PaginationBar(
            currentPage: page.currentPage,
            totalPages: page.totalPages,
          ),
      ],
    );
  }
}

class _SortBar extends ConsumerWidget {
  const _SortBar({required this.totalItems});

  final int totalItems;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeExt = AppThemeExtension.of(context);
    final sortAscending = ref.watch(shelfSortAscendingProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.pageHorizontal,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        children: [
          Text(
            '$totalItems 本',
            style: AppTypography.bodySmall.copyWith(color: themeExt.muted),
          ),
          const Spacer(),
          IconButton(
            icon: Icon(
              sortAscending
                  ? Icons.arrow_upward
                  : Icons.arrow_downward,
              size: 18,
              color: themeExt.muted,
            ),
            tooltip: sortAscending ? '升序' : '降序',
            onPressed: () {
              ref.read(shelfSortAscendingProvider.notifier).state =
                  !sortAscending;
            },
          ),
          const SizedBox(width: AppSpacing.xs),
          PopupMenuButton<ShelfSortBy>(
            icon: Icon(Icons.sort, size: 18, color: themeExt.muted),
            tooltip: '排序方式',
            onSelected: (value) {
              ref.read(shelfSortByProvider.notifier).state = value;
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: ShelfSortBy.addedAt,
                child: Text('添加时间'),
              ),
              const PopupMenuItem(
                value: ShelfSortBy.title,
                child: Text('书名'),
              ),
              const PopupMenuItem(
                value: ShelfSortBy.author,
                child: Text('作者'),
              ),
              const PopupMenuItem(
                value: ShelfSortBy.lastOpenedAt,
                child: Text('最近阅读'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BookCard extends StatelessWidget {
  const _BookCard({required this.book});

  final Book book;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: themeExt.accentSoft,
              borderRadius: BorderRadius.circular(themeExt.radiusMd),
            ),
            alignment: Alignment.center,
            child: Icon(
              Icons.auto_stories_outlined,
              color: themeExt.accent,
              size: 32,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          book.title,
          style: AppTypography.bodySmall.copyWith(color: themeExt.ink),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

class _PaginationBar extends ConsumerWidget {
  const _PaginationBar({
    required this.currentPage,
    required this.totalPages,
  });

  final int currentPage;
  final int totalPages;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeExt = AppThemeExtension.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.pageHorizontal,
        vertical: AppSpacing.sm,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: Icon(Icons.chevron_left, color: themeExt.muted),
            onPressed: currentPage > 1
                ? () {
                    ref.read(shelfCurrentPageProvider.notifier).state =
                        currentPage - 1;
                  }
                : null,
          ),
          Text(
            '$currentPage / $totalPages',
            style: AppTypography.bodyMedium.copyWith(color: themeExt.muted),
          ),
          IconButton(
            icon: Icon(Icons.chevron_right, color: themeExt.muted),
            onPressed: currentPage < totalPages
                ? () {
                    ref.read(shelfCurrentPageProvider.notifier).state =
                        currentPage + 1;
                  }
                : null,
          ),
        ],
      ),
    );
  }
}
