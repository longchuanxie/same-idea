import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';

class ChapterEditorWidget extends StatefulWidget {
  const ChapterEditorWidget({super.key});

  @override
  State<ChapterEditorWidget> createState() => _ChapterEditorWidgetState();
}

class _ChapterEditorWidgetState extends State<ChapterEditorWidget> {
  TextEditingController? _controller;
  Chapter? _lastChapter;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
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
                Icon(Icons.edit_note, size: 64, color: morandi.sage),
                const SizedBox(height: 16),
                Text(
                  '选择章节开始写作',
                  style: TextStyle(fontSize: 16, color: morandi.muted),
                ),
              ],
            ),
          );
        }

        if (_lastChapter != state.chapter) {
          _controller?.dispose();
          _controller = TextEditingController(text: state.content);
          _lastChapter = state.chapter;
        }

        return Column(
          children: [
            _EditorToolbar(morandi: morandi),
            Expanded(
              child: Container(
                color: morandi.canvas,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: TextEditingController.fromValue(
                          TextEditingValue(
                            text: state.chapter?.title ?? '',
                            selection: const TextSelection.collapsed(offset: 0),
                          ),
                        ),
                        style: TextStyle(
                          fontFamily: 'serif',
                          fontSize: 33,
                          fontWeight: FontWeight.w700,
                          height: 1.4,
                          color: morandi.ink,
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.zero,
                          isDense: true,
                        ),
                        readOnly: true,
                      ),
                      const SizedBox(height: 24),
                      TextField(
                        controller: _controller,
                        maxLines: null,
                        style: TextStyle(
                          fontFamily: 'serif',
                          fontSize: 20,
                          height: 2.0,
                          color: morandi.text,
                        ),
                        decoration: InputDecoration(
                          filled: false,
                          hintText: '开始写作...',
                          hintStyle: TextStyle(
                            fontFamily: 'serif',
                            fontSize: 20,
                            color: morandi.muted2,
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
            _WordCountBar(morandi: morandi, state: state),
          ],
        );
      },
    );
  }
}

class _EditorToolbar extends StatelessWidget {
  const _EditorToolbar({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: morandi.panel,
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: Row(
        children: [
          _ToolButton(label: '续写', icon: Icons.arrow_forward, morandi: morandi),
          _ToolButton(label: '改写', icon: Icons.edit, morandi: morandi),
          _ToolButton(label: '扩写', icon: Icons.expand, morandi: morandi),
          _ToolButton(label: '缩写', icon: Icons.compress, morandi: morandi),
          _ToolButton(label: '润色', icon: Icons.auto_fix_high, morandi: morandi),
          const SizedBox(width: 8),
          Container(width: 1, height: 20, color: morandi.line),
          const SizedBox(width: 8),
          _FontSelector(morandi: morandi),
          const SizedBox(width: 8),
          _SizeSelector(morandi: morandi),
        ],
      ),
    );
  }
}

class _ToolButton extends StatelessWidget {
  const _ToolButton({
    required this.label,
    required this.icon,
    required this.morandi,
  });

  final String label;
  final IconData icon;
  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: TextButton.icon(
        onPressed: () {},
        icon: Icon(icon, size: 14, color: morandi.green),
        label: Text(
          label,
          style: TextStyle(fontSize: 12, color: morandi.green),
        ),
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      ),
    );
  }
}

class _FontSelector extends StatelessWidget {
  const _FontSelector({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: morandi.line),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('serif', style: TextStyle(fontSize: 11, color: morandi.text)),
          Icon(Icons.arrow_drop_down, size: 14, color: morandi.muted),
        ],
      ),
    );
  }
}

class _SizeSelector extends StatelessWidget {
  const _SizeSelector({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: morandi.line),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('20', style: TextStyle(fontSize: 11, color: morandi.text)),
          Icon(Icons.arrow_drop_down, size: 14, color: morandi.muted),
        ],
      ),
    );
  }
}

class _WordCountBar extends StatelessWidget {
  const _WordCountBar({
    required this.morandi,
    required this.state,
  });

  final MorandiColors morandi;
  final EditorState state;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: morandi.panel,
        border: Border(top: BorderSide(color: morandi.line)),
      ),
      child: Row(
        children: [
          Text(
            '${state.wordCount} 字',
            style: TextStyle(fontSize: 12, color: morandi.muted),
          ),
          const Spacer(),
          Text(
            state.chapter?.title ?? '',
            style: TextStyle(fontSize: 12, color: morandi.muted2),
          ),
        ],
      ),
    );
  }
}
