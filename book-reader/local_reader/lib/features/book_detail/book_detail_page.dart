import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/book_detail_service.dart';

/// 书籍详情页
class BookDetailPage extends ConsumerWidget {
  const BookDetailPage({super.key, required this.bookId});

  final int bookId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(bookDetailProvider(bookId));

    return detailAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('加载失败: $error')),
      ),
      data: (detail) => _BookDetailContent(detail: detail),
    );
  }
}

class _BookDetailContent extends ConsumerWidget {
  const _BookDetailContent({required this.detail});

  final BookDetailData detail;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeExt = AppThemeExtension.of(context);
    final book = detail.book;

    return Scaffold(
      appBar: AppBar(
        title: const Text('书籍详情'),
        actions: [
          IconButton(
            icon: Icon(Icons.edit_outlined, color: themeExt.muted),
            tooltip: '编辑元数据',
            onPressed: () => context.go('/book/${book.id}/edit'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
        children: [
          // 封面 + 信息双栏
          _DetailHeader(detail: detail, themeExt: themeExt),
          const SizedBox(height: AppSpacing.sectionGap),

          // 信息网格
          _InfoGrid(detail: detail, themeExt: themeExt),
          const SizedBox(height: AppSpacing.sectionGap),

          // 操作按钮
          _ActionButtons(bookId: book.id, themeExt: themeExt),
        ],
      ),
    );
  }
}

class _DetailHeader extends StatelessWidget {
  const _DetailHeader({
    required this.detail,
    required this.themeExt,
  });

  final BookDetailData detail;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final book = detail.book;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 封面
        Container(
          width: 120,
          height: 168,
          decoration: BoxDecoration(
            color: themeExt.accentSoft,
            borderRadius: BorderRadius.circular(themeExt.radiusMd),
          ),
          alignment: Alignment.center,
          child: Icon(
            _formatIcon(book.format),
            color: themeExt.accent,
            size: 40,
          ),
        ),
        const SizedBox(width: AppSpacing.lg),
        // 信息
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 格式标签
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: themeExt.accentSoft,
                  borderRadius: BorderRadius.circular(themeExt.radiusSm),
                ),
                child: Text(
                  book.format.name.toUpperCase(),
                  style: AppTypography.labelSmall.copyWith(
                    color: themeExt.accent,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              // 书名
              Text(
                book.title,
                style: AppTypography.headlineLarge.copyWith(
                  color: themeExt.ink,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (book.author != null && book.author!.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  book.author!,
                  style: AppTypography.bodyMedium.copyWith(
                    color: themeExt.muted,
                  ),
                ),
              ],
              // 进度
              if (detail.progress != null) ...[
                const SizedBox(height: AppSpacing.md),
                _ProgressIndicator(
                  progress: detail.progress!,
                  themeExt: themeExt,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _ProgressIndicator extends StatelessWidget {
  const _ProgressIndicator({
    required this.progress,
    required this.themeExt,
  });

  final ReadingProgress progress;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final percentage = progress.percentage ?? 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '阅读进度 ${(percentage * 100).toInt()}%',
          style: AppTypography.labelSmall.copyWith(color: themeExt.muted),
        ),
        const SizedBox(height: AppSpacing.xs),
        ClipRRect(
          borderRadius: BorderRadius.circular(themeExt.radiusSm),
          child: LinearProgressIndicator(
            value: percentage,
            backgroundColor: themeExt.line,
            valueColor: AlwaysStoppedAnimation(themeExt.accent),
          ),
        ),
      ],
    );
  }
}

class _InfoGrid extends StatelessWidget {
  const _InfoGrid({
    required this.detail,
    required this.themeExt,
  });

  final BookDetailData detail;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    final book = detail.book;

    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        if (detail.series != null)
          _InfoItem(
            label: '系列',
            value: detail.series!.title,
            themeExt: themeExt,
            isAccent: true,
            onTap: () => context.go('/series/${detail.series!.id}'),
          ),
        if (book.volumeIndex != null)
          _InfoItem(
            label: '卷号',
            value: '第 ${book.volumeIndex} 卷',
            themeExt: themeExt,
          ),
        if (detail.tags.isNotEmpty)
          _InfoItem(
            label: '标签',
            value: detail.tags.map((t) => t.name).join('、'),
            themeExt: themeExt,
          ),
        _InfoItem(
          label: '文件路径',
          value: book.filePath,
          themeExt: themeExt,
        ),
        if (book.fileSizeBytes != null)
          _InfoItem(
            label: '文件大小',
            value: _formatFileSize(book.fileSizeBytes!),
            themeExt: themeExt,
          ),
      ],
    );
  }
}

class _InfoItem extends StatelessWidget {
  const _InfoItem({
    required this.label,
    required this.value,
    required this.themeExt,
    this.isAccent = false,
    this.onTap,
  });

  final String label;
  final String value;
  final AppThemeExtension themeExt;
  final bool isAccent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: themeExt.surfaceSolid,
        borderRadius: BorderRadius.circular(themeExt.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(color: themeExt.muted),
          ),
          const SizedBox(height: AppSpacing.xs),
          GestureDetector(
            onTap: onTap,
            child: Text(
              value,
              style: AppTypography.bodyMedium.copyWith(
                color: isAccent ? themeExt.accent : themeExt.ink,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButtons extends ConsumerWidget {
  const _ActionButtons({
    required this.bookId,
    required this.themeExt,
  });

  final int bookId;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              // TODO: Phase 7/8/9 根据格式跳转到对应阅读器
            },
            icon: const Icon(Icons.play_circle_outline),
            label: const Text('继续阅读'),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              _showDeleteConfirmDialog(context, ref);
            },
            icon: Icon(Icons.delete_outline, color: themeExt.danger),
            label: Text('移除', style: TextStyle(color: themeExt.danger)),
          ),
        ),
      ],
    );
  }

  void _showDeleteConfirmDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认移除'),
        content: const Text('确定要从书架移除这本书吗？原始文件不会被删除。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () async {
              await ref
                  .read(bookDetailServiceProvider)
                  .removeBook(bookId);
              if (ctx.mounted) Navigator.of(ctx).pop();
              if (context.mounted) context.go('/shelf');
            },
            child: const Text('移除'),
          ),
        ],
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

String _formatFileSize(int bytes) {
  if (bytes < 1024) return '$bytes B';
  if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
  if (bytes < 1024 * 1024 * 1024) {
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
  return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
}
