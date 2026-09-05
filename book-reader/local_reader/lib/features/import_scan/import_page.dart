import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_motion.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/import_scan_service.dart';

/// 导入扫描页面
class ImportPage extends ConsumerWidget {
  const ImportPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(importScanStateProvider);
    final themeExt = AppThemeExtension.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('导入书籍')),
      body: Column(
        children: [
          // 操作按钮区
          if (!state.isScanning) _ActionButtons(themeExt: themeExt),

          // 扫描状态卡
          _ScanStatusCard(state: state, themeExt: themeExt),

          // 导入明细列表
          Expanded(
            child: _ImportResultList(state: state, themeExt: themeExt),
          ),
        ],
      ),
    );
  }
}

class _ActionButtons extends ConsumerWidget {
  const _ActionButtons({required this.themeExt});

  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                ref
                    .read(importScanStateProvider.notifier)
                    .pickAndImportFiles();
              },
              icon: const Icon(Icons.insert_drive_file_outlined),
              label: const Text('选择文件'),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                ref
                    .read(importScanStateProvider.notifier)
                    .pickAndImportDirectory();
              },
              icon: const Icon(Icons.folder_outlined),
              label: const Text('扫描目录'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScanStatusCard extends ConsumerWidget {
  const _ScanStatusCard({
    required this.state,
    required this.themeExt,
  });

  final ImportScanViewState state;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!state.isScanning && state.items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.pageHorizontal,
      ),
      child: AnimatedContainer(
        duration: AppMotion.medium,
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        decoration: BoxDecoration(
          color: themeExt.surfaceSolid,
          borderRadius: BorderRadius.circular(themeExt.radiusLg),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 状态标签
            Row(
              children: [
                _StatusBadge(
                  isScanning: state.isScanning,
                  themeExt: themeExt,
                ),
                const Spacer(),
                if (state.isScanning)
                  TextButton(
                    onPressed: () {
                      ref
                          .read(importScanStateProvider.notifier)
                          .cancelScan();
                    },
                    child: const Text('取消'),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // 进度条
            if (state.isScanning)
              ClipRRect(
                borderRadius: BorderRadius.circular(themeExt.radiusSm),
                child: LinearProgressIndicator(
                  value: state.progress,
                  backgroundColor: themeExt.line,
                  valueColor: AlwaysStoppedAnimation(themeExt.accent),
                ),
              ),

            const SizedBox(height: AppSpacing.md),

            // 统计指标
            Row(
              children: [
                _StatChip(
                  label: '新增',
                  value: '${state.addedCount}',
                  color: themeExt.success,
                ),
                const SizedBox(width: AppSpacing.md),
                _StatChip(
                  label: '跳过',
                  value: '${state.skippedCount}',
                  color: themeExt.muted,
                ),
                const SizedBox(width: AppSpacing.md),
                _StatChip(
                  label: '失败',
                  value: '${state.failedCount}',
                  color: themeExt.danger,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({
    required this.isScanning,
    required this.themeExt,
  });

  final bool isScanning;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: isScanning ? themeExt.accentSoft : themeExt.surfaceSecondary,
        borderRadius: BorderRadius.circular(themeExt.radiusSm),
      ),
      child: Text(
        isScanning ? '扫描中' : '扫描完成',
        style: AppTypography.labelMedium.copyWith(
          color: isScanning ? themeExt.accent : themeExt.muted,
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        Text(
          '$label $value',
          style: AppTypography.bodySmall,
        ),
      ],
    );
  }
}

class _ImportResultList extends StatelessWidget {
  const _ImportResultList({
    required this.state,
    required this.themeExt,
  });

  final ImportScanViewState state;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    if (state.items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.cloud_upload_outlined,
              size: 64,
              color: themeExt.subtle,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              '选择文件或目录开始导入',
              style: AppTypography.bodyMedium.copyWith(
                color: themeExt.muted,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
      itemCount: state.items.length,
      itemBuilder: (context, index) {
        final item = state.items[index];
        return _ImportResultItemRow(item: item, themeExt: themeExt);
      },
    );
  }
}

class _ImportResultItemRow extends StatelessWidget {
  const _ImportResultItemRow({
    required this.item,
    required this.themeExt,
  });

  final ImportResultItem item;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final iconData = switch (item.status) {
      ImportItemStatus.added => Icons.check_circle_outline,
      ImportItemStatus.skipped => Icons.skip_next_outlined,
      ImportItemStatus.failed => Icons.error_outline,
    };

    final iconColor = switch (item.status) {
      ImportItemStatus.added => themeExt.success,
      ImportItemStatus.skipped => themeExt.muted,
      ImportItemStatus.failed => themeExt.danger,
    };

    final statusText = switch (item.status) {
      ImportItemStatus.added => '已添加',
      ImportItemStatus.skipped => '已跳过',
      ImportItemStatus.failed => '失败',
    };

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.listItemGap),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(themeExt.radiusMd),
        ),
        tileColor: themeExt.surfaceSolid,
        leading: Icon(iconData, color: iconColor, size: 24),
        title: Text(
          item.filePath,
          style: AppTypography.bodyMedium.copyWith(color: themeExt.ink),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: item.error != null
            ? Text(
                item.error!,
                style: AppTypography.bodySmall.copyWith(
                  color: themeExt.danger,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              )
            : null,
        trailing: Text(
          statusText,
          style: AppTypography.labelSmall.copyWith(color: iconColor),
        ),
      ),
    );
  }
}
