import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/series_service.dart';

/// 系列详情页
class SeriesDetailPage extends ConsumerWidget {
  const SeriesDetailPage({super.key, required this.seriesId});

  final int seriesId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(seriesDetailProvider(seriesId));

    return detailAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('加载失败: $error')),
      ),
      data: (detail) => _SeriesDetailContent(detail: detail),
    );
  }
}

class _SeriesDetailContent extends StatelessWidget {
  const _SeriesDetailContent({required this.detail});

  final SeriesDetail detail;

  @override
  Widget build(BuildContext context) {
    final themeExt = AppThemeExtension.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(detail.series.title)),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 系列信息头
          Padding(
            padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  detail.series.title,
                  style: AppTypography.headlineLarge.copyWith(
                    color: themeExt.ink,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '${detail.totalVolumes} 卷',
                  style: AppTypography.bodyMedium.copyWith(
                    color: themeExt.muted,
                  ),
                ),
              ],
            ),
          ),
          // 卷册列表
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.pageHorizontal,
              ),
              itemCount: detail.books.length,
              itemBuilder: (context, index) {
                final book = detail.books[index];
                return _VolumeItem(
                  book: book,
                  volumeNumber: index + 1,
                  themeExt: themeExt,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _VolumeItem extends StatelessWidget {
  const _VolumeItem({
    required this.book,
    required this.volumeNumber,
    required this.themeExt,
  });

  final Book book;
  final int volumeNumber;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final isReading = book.lastOpenedAt != null;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.listItemGap),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(themeExt.radiusMd),
        ),
        tileColor: themeExt.surfaceSolid,
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: themeExt.accentSoft,
            borderRadius: BorderRadius.circular(themeExt.radiusSm),
          ),
          alignment: Alignment.center,
          child: Text(
            volumeNumber.toString().padLeft(2, '0'),
            style: AppTypography.labelMedium.copyWith(
              color: themeExt.accent,
            ),
          ),
        ),
        title: Text(
          book.title,
          style: AppTypography.bodyMedium.copyWith(color: themeExt.ink),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          isReading ? '阅读中' : '未读',
          style: AppTypography.bodySmall.copyWith(
            color: isReading ? themeExt.accent : themeExt.muted,
          ),
        ),
        trailing: isReading
            ? Chip(
                label: const Text('继续'),
                backgroundColor: themeExt.accentSoft,
                labelStyle: AppTypography.labelSmall.copyWith(
                  color: themeExt.accent,
                ),
              )
            : Chip(
                label: const Text('打开'),
                backgroundColor: themeExt.surfaceSecondary,
                labelStyle: AppTypography.labelSmall.copyWith(
                  color: themeExt.muted,
                ),
              ),
      ),
    );
  }
}
