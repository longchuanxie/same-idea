import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/app_shell_widget.dart';
import '../features/book_detail/book_detail_page.dart';
import '../features/book_detail/book_edit_page.dart';
import '../features/home/home_page.dart';
import '../features/import_scan/import_page.dart';
import '../features/search/search_page.dart';
import '../features/series/series_detail_page.dart';
import '../features/series/series_list_page.dart';
import '../features/shelf/shelf_page.dart';

/// 应用路由配置
final router = GoRouter(
  initialLocation: '/home',
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return AppShell(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/shelf',
          builder: (context, state) => const ShelfPage(),
        ),
        GoRoute(
          path: '/import',
          builder: (context, state) => const ImportPage(),
        ),
        GoRoute(
          path: '/book/:bookId',
          builder: (context, state) {
            final bookId = int.parse(state.pathParameters['bookId']!);
            return BookDetailPage(bookId: bookId);
          },
        ),
        GoRoute(
          path: '/book/:bookId/edit',
          builder: (context, state) {
            final bookId = int.parse(state.pathParameters['bookId']!);
            return BookEditPage(bookId: bookId);
          },
        ),
        GoRoute(
          path: '/series',
          builder: (context, state) => const SeriesListPage(),
        ),
        GoRoute(
          path: '/series/:seriesId',
          builder: (context, state) {
            final seriesId = int.parse(state.pathParameters['seriesId']!);
            return SeriesDetailPage(seriesId: seriesId);
          },
        ),
        GoRoute(
          path: '/search',
          builder: (context, state) => const SearchPage(),
        ),
        GoRoute(
          path: '/notes',
          builder: (context, state) => const _PlaceholderPage(title: '笔记'),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const _PlaceholderPage(title: '设置'),
        ),
      ],
    ),
  ],
);

/// 占位页面（后续阶段替换为真实页面）
class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Text(
        title,
        style: theme.textTheme.displayMedium,
      ),
    );
  }
}
