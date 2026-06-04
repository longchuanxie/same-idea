import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';

class ChapterEditorWidget extends StatefulWidget {
  const ChapterEditorWidget({super.key});

  @override
  State<ChapterEditorWidget> createState() => _ChapterEditorWidgetState();
}

class _ChapterEditorWidgetState extends State<ChapterEditorWidget> {
  TextEditingController? _controller;
  String? _lastChapterId;
  late TextEditingController _titleController;
  String _lastTitle = '';

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _titleController.dispose();
    super.dispose();
  }

  void _syncTitleFromState(EditorState state) {
    final title = state.title;
    if (title != _lastTitle && title != _titleController.text) {
      _titleController.text = title;
      _lastTitle = title;
    }
  }

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return BlocBuilder<EditorBloc, EditorState>(
      builder: (context, state) {
        if (state.chapter == null) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.edit_note,
                  size: 64,
                  color: morandi.soft.withOpacity(0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  '选择章节开始写作',
                  style: TextStyle(
                    fontSize: 16,
                    color: morandi.muted,
                  ),
                ),
              ],
            ),
          );
        }

        if (_lastChapterId != state.chapter!.id) {
          _controller?.dispose();
          _controller = TextEditingController(text: state.content);
          _lastChapterId = state.chapter!.id;
          _titleController.text = state.title;
          _lastTitle = state.title;
        } else {
          _syncTitleFromState(state);
        }

        return Column(
          children: [
            _CrumbBar(morandi: morandi, state: state),
            _EditorToolbar(morandi: morandi),
            Expanded(
              child: ColoredBox(
                color: morandi.canvas,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(12, 20, 12, 120),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 830),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextField(
                            controller: _titleController,
                            style: TextStyle(
                              fontFamily: 'serif',
                              fontSize: 31,
                              fontWeight: FontWeight.w700,
                              height: 1.4,
                              color: morandi.ink,
                              letterSpacing: 0.04,
                            ),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                              isDense: true,
                              hintText: '输入章节标题...',
                              hintStyle: TextStyle(
                                fontFamily: 'serif',
                                fontSize: 31,
                                color: morandi.soft,
                              ),
                            ),
                            onChanged: (value) {
                              _lastTitle = value;
                              context
                                  .read<EditorBloc>()
                                  .add(EditorTitleChanged(title: value));
                            },
                          ),
                          const SizedBox(height: 28),
                          TextField(
                            controller: _controller,
                            maxLines: null,
                            style: TextStyle(
                              fontFamily: 'serif',
                              fontSize: 20,
                              height: 2.05,
                              color: morandi.text,
                            ),
                            decoration: InputDecoration(
                              filled: false,
                              hintText: '开始写作...',
                              hintStyle: TextStyle(
                                fontFamily: 'serif',
                                fontSize: 20,
                                color: morandi.soft,
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                              isDense: true,
                            ),
                            onChanged: (value) {
                              context
                                  .read<EditorBloc>()
                                  .add(EditorContentChanged(content: value));
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            _WordBar(morandi: morandi, state: state),
          ],
        );
      },
    );
  }
}

class _CrumbBar extends StatelessWidget {
  const _CrumbBar({required this.morandi, required this.state});

  final MorandiColors morandi;
  final EditorState state;

  @override
  Widget build(BuildContext context) => Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        decoration: BoxDecoration(
          color: morandi.canvas,
          border: Border(bottom: BorderSide(color: morandi.line)),
        ),
        child: Row(
          children: [
            Text(
              '章节',
              style: TextStyle(
                fontSize: 13,
                color: morandi.muted,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 9),
              child: Text(
                '›',
                style: TextStyle(
                  fontSize: 13,
                  color: morandi.muted,
                ),
              ),
            ),
            Text(
              state.title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: morandi.ink,
              ),
            ),
            const Spacer(),
            Text(
              '字数 ${state.wordCount}',
              style: TextStyle(
                fontSize: 13,
                color: morandi.muted,
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () {},
              child: Icon(
                Icons.check_circle_outline,
                size: 18,
                color: morandi.muted,
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () {},
              child: Icon(
                Icons.more_horiz,
                size: 18,
                color: morandi.muted,
              ),
            ),
          ],
        ),
      );
}

class _EditorToolbar extends StatelessWidget {
  const _EditorToolbar({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: morandi.canvas,
          border: Border(bottom: BorderSide(color: morandi.line)),
        ),
        child: Wrap(
          spacing: 10,
          runSpacing: 10,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _ToolBtn(
              morandi: morandi,
              icon: Icons.auto_awesome,
              label: '续写',
            ),
            _ToolBtn(
              morandi: morandi,
              icon: Icons.edit_outlined,
              label: '改写',
            ),
            _ToolBtn(
              morandi: morandi,
              icon: Icons.open_in_full,
              label: '扩写',
            ),
            _ToolBtn(
              morandi: morandi,
              icon: Icons.format_indent_decrease,
              label: '缩写',
            ),
            _ToolBtn(
              morandi: morandi,
              icon: Icons.check_circle_outline,
              label: '润色',
            ),
            Container(
              width: 1,
              height: 20,
              color: morandi.line,
            ),
            _Dropdown(morandi: morandi, value: '正文'),
            _Dropdown(morandi: morandi, value: '思源宋体'),
            _Dropdown(morandi: morandi, value: '20'),
            _ToolIcon(morandi: morandi, label: 'B'),
            _ToolIcon(
              morandi: morandi,
              label: 'I',
              isItalic: true,
            ),
            _ToolIcon(
              morandi: morandi,
              label: 'U',
              isUnderline: true,
            ),
            IconButton(
              icon: Icon(
                Icons.link_outlined,
                size: 18,
                color: morandi.text,
              ),
              onPressed: () {},
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 36,
                minHeight: 36,
              ),
            ),
            IconButton(
              icon: Icon(
                Icons.image_outlined,
                size: 18,
                color: morandi.text,
              ),
              onPressed: () {},
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 36,
                minHeight: 36,
              ),
            ),
          ],
        ),
      );
}

class _ToolBtn extends StatelessWidget {
  const _ToolBtn({
    required this.morandi,
    required this.icon,
    required this.label,
  });

  final MorandiColors morandi;
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => OutlinedButton.icon(
        onPressed: () {},
        icon: Icon(icon, size: 14, color: morandi.text),
        label: Text(
          label,
          style: TextStyle(fontSize: 13, color: morandi.text),
        ),
        style: OutlinedButton.styleFrom(
          foregroundColor: morandi.text,
          side: BorderSide(color: morandi.line),
          backgroundColor: morandi.surface.withOpacity(0.72),
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 10,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      );
}

class _Dropdown extends StatelessWidget {
  const _Dropdown({required this.morandi, required this.value});

  final MorandiColors morandi;
  final String value;

  @override
  Widget build(BuildContext context) => Container(
        height: 36,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          border: Border.all(color: morandi.line),
          borderRadius: BorderRadius.circular(9),
          color: Colors.white,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 13,
                color: morandi.text,
              ),
            ),
            Icon(
              Icons.arrow_drop_down,
              size: 18,
              color: morandi.muted,
            ),
          ],
        ),
      );
}

class _ToolIcon extends StatelessWidget {
  const _ToolIcon({
    required this.morandi,
    required this.label,
    this.isItalic = false,
    this.isUnderline = false,
  });

  final MorandiColors morandi;
  final String label;
  final bool isItalic;
  final bool isUnderline;

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 36,
        width: 36,
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF4F534C),
              fontStyle: isItalic ? FontStyle.italic : FontStyle.normal,
              decoration:
                  isUnderline ? TextDecoration.underline : TextDecoration.none,
            ),
          ),
        ),
      );
}

class _WordBar extends StatelessWidget {
  const _WordBar({required this.morandi, required this.state});

  final MorandiColors morandi;
  final EditorState state;

  @override
  Widget build(BuildContext context) => Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        decoration: BoxDecoration(
          color: morandi.canvas,
          border: Border(top: BorderSide(color: morandi.line)),
        ),
        child: Row(
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '章节',
                  style: TextStyle(
                    fontSize: 13,
                    color: morandi.muted,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 9),
                  child: Text(
                    '›',
                    style: TextStyle(
                      fontSize: 13,
                      color: morandi.muted,
                    ),
                  ),
                ),
                Text(
                  state.title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: morandi.ink,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Text(
              '${state.wordCount} 字',
              style: TextStyle(
                fontSize: 13,
                color: morandi.muted,
              ),
            ),
          ],
        ),
      );
}
