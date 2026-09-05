import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/search_service.dart';

/// Command Search 页面
class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);
    final resultsAsync = ref.watch(searchResultsProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: InputDecoration(
            hintText: '搜索书库或输入命令...',
            hintStyle: AppTypography.bodyMedium.copyWith(
              color: themeExt.subtle,
            ),
            border: InputBorder.none,
          ),
          style: AppTypography.bodyMedium.copyWith(color: themeExt.ink),
          onChanged: (value) {
            ref.read(searchQueryProvider.notifier).state = value;
          },
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: Icon(Icons.clear, color: themeExt.muted),
              onPressed: () {
                _searchController.clear();
                ref.read(searchQueryProvider.notifier).state = '';
              },
            ),
        ],
      ),
      body: resultsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('搜索出错: $error')),
        data: (results) {
          if (_searchController.text.trim().isEmpty) {
            return _EmptySearchState(themeExt: themeExt);
          }
          if (results.isEmpty) {
            return _NoResultsState(themeExt: themeExt);
          }
          return _SearchResultsList(results: results, themeExt: themeExt);
        },
      ),
    );
  }
}

class _EmptySearchState extends StatelessWidget {
  const _EmptySearchState({required this.themeExt});

  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.search,
            size: 64,
            color: themeExt.subtle,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            '输入关键词搜索',
            style: AppTypography.bodyMedium.copyWith(
              color: themeExt.muted,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '可搜索书名、作者、标签、笔记',
            style: AppTypography.bodySmall.copyWith(
              color: themeExt.subtle,
            ),
          ),
        ],
      ),
    );
  }
}

class _NoResultsState extends StatelessWidget {
  const _NoResultsState({required this.themeExt});

  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: themeExt.subtle,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            '未找到结果',
            style: AppTypography.bodyMedium.copyWith(
              color: themeExt.muted,
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchResultsList extends StatelessWidget {
  const _SearchResultsList({
    required this.results,
    required this.themeExt,
  });

  final List<SearchResult> results;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
      itemCount: results.length,
      itemBuilder: (context, index) {
        final result = results[index];
        return _SearchResultItem(result: result, themeExt: themeExt);
      },
    );
  }
}

class _SearchResultItem extends StatelessWidget {
  const _SearchResultItem({
    required this.result,
    required this.themeExt,
  });

  final SearchResult result;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final (icon, routePath) = switch (result) {
      BookSearchResult(:final bookId) => (
          Icons.auto_stories_outlined,
          '/book/$bookId',
        ),
      NoteSearchResult(:final bookId) => (
          Icons.edit_note_outlined,
          '/book/$bookId',
        ),
      CommandSearchResult() => (
          Icons.terminal,
          (result as CommandSearchResult).routePath,
        ),
    };

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.listItemGap),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(themeExt.radiusMd),
        ),
        tileColor: themeExt.surfaceSolid,
        leading: Icon(icon, color: themeExt.accent, size: 24),
        title: Text(
          result.title,
          style: AppTypography.bodyMedium.copyWith(color: themeExt.ink),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: result.subtitle.isNotEmpty
            ? Text(
                result.subtitle,
                style: AppTypography.bodySmall.copyWith(
                  color: themeExt.muted,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              )
            : null,
        onTap: () => context.go(routePath),
      ),
    );
  }
}
