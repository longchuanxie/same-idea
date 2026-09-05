import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/theme/app_theme_extension.dart';
import '../../design_system/tokens/app_spacing.dart';
import '../../design_system/tokens/app_typography.dart';
import '../../domain/entities/entities.dart';
import '../../domain/services/book_detail_service.dart';

/// 元数据编辑页
class BookEditPage extends ConsumerStatefulWidget {
  const BookEditPage({super.key, required this.bookId});

  final int bookId;

  @override
  ConsumerState<BookEditPage> createState() => _BookEditPageState();
}

class _BookEditPageState extends ConsumerState<BookEditPage> {
  late TextEditingController _titleController;
  late TextEditingController _authorController;
  late TextEditingController _volumeController;
  late TextEditingController _seriesController;
  late TextEditingController _tagInputController;
  List<Tag> _tags = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    _authorController = TextEditingController();
    _volumeController = TextEditingController();
    _seriesController = TextEditingController();
    _tagInputController = TextEditingController();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _volumeController.dispose();
    _seriesController.dispose();
    _tagInputController.dispose();
    super.dispose();
  }

  void _initControllers(BookDetailData detail) {
    _titleController.text = detail.book.title;
    _authorController.text = detail.book.author ?? '';
    _volumeController.text =
        detail.book.volumeIndex != null
            ? '第 ${detail.book.volumeIndex} 卷'
            : '';
    _seriesController.text =
        detail.series?.title ?? '';
    _tags = List.from(detail.tags);
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(bookDetailProvider(widget.bookId));
    final themeExt = AppThemeExtension.of(context);

    return detailAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('加载失败: $error')),
      ),
      data: (detail) {
        // 仅在首次加载时初始化控制器
        if (_titleController.text.isEmpty) {
          _initControllers(detail);
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('编辑元数据'),
            actions: [
              TextButton(
                onPressed: _isSaving ? null : () => _save(detail),
                child: const Text('保存'),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(AppSpacing.pageHorizontal),
            children: [
              _TextField(
                label: '标题',
                controller: _titleController,
                themeExt: themeExt,
              ),
              const SizedBox(height: AppSpacing.md),
              _TextField(
                label: '作者',
                controller: _authorController,
                themeExt: themeExt,
              ),
              const SizedBox(height: AppSpacing.md),
              _TextField(
                label: '系列',
                controller: _seriesController,
                themeExt: themeExt,
              ),
              const SizedBox(height: AppSpacing.md),
              _TextField(
                label: '卷号',
                controller: _volumeController,
                hintText: '如：第 3 卷',
                themeExt: themeExt,
              ),
              const SizedBox(height: AppSpacing.md),

              // 标签编辑区
              _TagEditor(
                tags: _tags,
                tagInputController: _tagInputController,
                themeExt: themeExt,
                onRemoveTag: _removeTag,
                onAddTag: _addTag,
              ),
              const SizedBox(height: AppSpacing.md),

              // 只读字段
              _ReadOnlyField(
                label: '格式',
                value: detail.book.format.name.toUpperCase(),
                themeExt: themeExt,
              ),
              const SizedBox(height: AppSpacing.md),
              _ReadOnlyField(
                label: '文件路径',
                value: detail.book.filePath,
                themeExt: themeExt,
              ),
            ],
          ),
        );
      },
    );
  }

  void _removeTag(Tag tag) {
    setState(() {
      _tags.remove(tag);
    });
  }

  void _addTag() {
    final name = _tagInputController.text.trim();
    if (name.isEmpty) return;
    if (_tags.any((t) => t.name == name)) return;

    setState(() {
      _tags.add(Tag(id: 0, name: name));
      _tagInputController.clear();
    });
  }

  Future<void> _save(BookDetailData detail) async {
    setState(() => _isSaving = true);

    try {
      final updatedBook = detail.book.copyWith(
        title: _titleController.text.trim(),
        author: _authorController.text.trim(),
      );

      await ref.read(bookDetailServiceProvider).updateBookMetadata(updatedBook);

      // 处理标签变更
      final service = ref.read(bookDetailServiceProvider);
      final existingTags = detail.tags;

      // 移除已删除的标签
      for (final tag in existingTags) {
        if (!_tags.any((t) => t.name == tag.name)) {
          await service.removeTagFromBook(widget.bookId, tag.id);
        }
      }

      // 添加新标签
      for (final tag in _tags) {
        if (!existingTags.any((t) => t.name == tag.name)) {
          if (tag.id == 0) {
            await service.createAndAddTag(widget.bookId, tag.name);
          } else {
            await service.addTagToBook(widget.bookId, tag.id);
          }
        }
      }

      // 刷新详情数据
      ref.invalidate(bookDetailProvider(widget.bookId));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('元数据已保存')),
        );
        context.go('/book/${widget.bookId}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('保存失败: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }
}

class _TextField extends StatelessWidget {
  const _TextField({
    required this.label,
    required this.controller,
    required this.themeExt,
    this.hintText,
  });

  final String label;
  final TextEditingController controller;
  final AppThemeExtension themeExt;
  final String? hintText;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.labelMedium.copyWith(color: themeExt.muted),
        ),
        const SizedBox(height: AppSpacing.xs),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hintText,
          ),
        ),
      ],
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({
    required this.label,
    required this.value,
    required this.themeExt,
  });

  final String label;
  final String value;
  final AppThemeExtension themeExt;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.labelMedium.copyWith(color: themeExt.muted),
        ),
        const SizedBox(height: AppSpacing.xs),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: themeExt.surfaceSecondary,
            borderRadius: BorderRadius.circular(themeExt.radiusMd),
          ),
          child: Text(
            value,
            style: AppTypography.bodyMedium.copyWith(color: themeExt.muted),
          ),
        ),
      ],
    );
  }
}

class _TagEditor extends StatelessWidget {
  const _TagEditor({
    required this.tags,
    required this.tagInputController,
    required this.themeExt,
    required this.onRemoveTag,
    required this.onAddTag,
  });

  final List<Tag> tags;
  final TextEditingController tagInputController;
  final AppThemeExtension themeExt;
  final ValueChanged<Tag> onRemoveTag;
  final VoidCallback onAddTag;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '标签',
          style: AppTypography.labelMedium.copyWith(color: themeExt.muted),
        ),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.sm,
          children: [
            ...tags.map((tag) => Chip(
                  label: Text(tag.name),
                  onDeleted: () => onRemoveTag(tag),
                  deleteIconColor: themeExt.muted,
                )),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: tagInputController,
                decoration: const InputDecoration(
                  hintText: '输入标签名',
                ),
                onSubmitted: (_) => onAddTag(),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              onPressed: onAddTag,
              icon: Icon(Icons.add, color: themeExt.accent),
              tooltip: '添加标签',
            ),
          ],
        ),
      ],
    );
  }
}
