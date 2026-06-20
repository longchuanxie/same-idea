import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/chapter.dart';

class ChapterEditorWidget extends StatefulWidget {
  const ChapterEditorWidget({
    required this.chapter,
    required this.saveStatusLabel,
    required this.onContentChanged,
    this.isDark = false,
    super.key,
  });

  final Chapter chapter;
  final String saveStatusLabel;
  final ValueChanged<String> onContentChanged;
  final bool isDark;

  @override
  State<ChapterEditorWidget> createState() => _ChapterEditorWidgetState();
}

class _ChapterEditorWidgetState extends State<ChapterEditorWidget> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.chapter.markdownContent);
  }

  @override
  void didUpdateWidget(covariant ChapterEditorWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    final prev = oldWidget.chapter.markdownContent;
    final next = widget.chapter.markdownContent;
    final shouldSync = oldWidget.chapter.id != widget.chapter.id ||
        (_controller.text == prev && _controller.text != next);
    if (shouldSync) {
      _controller.value = TextEditingValue(
        text: next,
        selection: TextSelection.collapsed(offset: next.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = widget.isDark ? MorandiColors.darkText : MorandiColors.text;
    final faint = widget.isDark ? MorandiColors.darkFaint : MorandiColors.faint;
    final green = widget.isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = widget.isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final surface = widget.isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = widget.isDark ? MorandiColors.darkLine : MorandiColors.line;
    final background = widget.isDark ? MorandiColors.darkBackground : MorandiColors.background;

    return ColoredBox(
        color: background,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.workspacePadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              // 标题行
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Expanded(
                    child: Text(
                      widget.chapter.title,
                      style: AppTypography.headline(color: text),
                    ),
                  ),
                  // 保存状态药丸
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxx, vertical: AppSpacing.md),
                    decoration: BoxDecoration(
                      color: green2,
                      borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.save, size: AppSpacing.iconSmall - 3, color: green),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          widget.saveStatusLabel,
                          style: AppTypography.caption(color: green, weight: AppTypography.weightBold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xxxx),
              // 编辑器
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: surface,
                    border: Border.all(color: line),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.cardPadding),
                    child: TextField(
                      controller: _controller,
                      expands: true,
                      maxLines: null,
                      keyboardType: TextInputType.multiline,
                      textAlignVertical: TextAlignVertical.top,
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: '在这里开始写作...',
                        hintStyle: AppTypography.body(color: faint),
                      ),
                      style: AppTypography.body(color: text).copyWith(height: 1.7),
                      onChanged: widget.onContentChanged,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }
}
