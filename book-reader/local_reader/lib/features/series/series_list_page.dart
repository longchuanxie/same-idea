import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/series_service.dart';

/// 系列列表页
class SeriesListPage extends ConsumerWidget {
  const SeriesListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final seriesAsync = ref.watch(seriesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('系列')),
      body: seriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('加载失败: $error')),
        data: (seriesList) {
          if (seriesList.isEmpty) {
            return const _EmptyState();
          }
          return _SeriesGrid(seriesList: seriesList);
        },
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.collections_bookmark_outlined,
            size: 64,
            color: themeExt.subtle,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            '暂无系列',
            style: AppTypography.headlineMedium.copyWith(
              color: themeExt.muted,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '导入同一系列的书籍后将自动聚合',
            style: AppTypography.bodyMedium.copyWith(
              color: themeExt.subtle,
            ),
          ),
        ],
      ),
    );
  }
}

class _SeriesGrid extends ConsumerWidget {
  const _SeriesGrid({required this.seriesList});

  final List<Series> seriesList;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeExt = AppThemeExtension.of(context);

    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2.5,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
      ),
      itemCount: seriesList.length,
      itemBuilder: (context, index) {
        final series = seriesList[index];
        return _SeriesCard(series: series, themeExt: themeExt);
      },
    );
  }
}

class _SeriesCard extends ConsumerWidget {
  const _SeriesCard({
    required this.series,
    required this.themeExt,
  });

  final Series series;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(seriesDetailProvider(series.id));

    final volumeCount = detailAsync.whenOrNull(
          data: (detail) => detail.totalVolumes,
        ) ??
        0;

    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(themeExt.radiusMd),
        side: BorderSide(color: themeExt.line),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(themeExt.radiusMd),
        onTap: () => context.go('/series/${series.id}'),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                series.title,
                style: AppTypography.titleMedium.copyWith(
                  color: themeExt.ink,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                '$volumeCount 卷',
                style: AppTypography.bodySmall.copyWith(
                  color: themeExt.muted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
