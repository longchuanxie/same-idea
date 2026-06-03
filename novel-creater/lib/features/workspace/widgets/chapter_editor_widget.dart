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
                Icon(Icons.edit_note, size: 64, color: morandi.stone),
                const SizedBox(height: 16),
                Text(
                  'Select a chapter to start writing',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: morandi.inkLight,
                      ),
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
            _SaveStatusBar(morandi: morandi, state: state),
            Expanded(
              child: TextField(
                controller: _controller,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontFamily: 'monospace',
                      height: 1.8,
                    ),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Start writing...',
                  hintStyle: TextStyle(color: morandi.stone),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 24,
                  ),
                ),
                onChanged: (value) {
                  context
                      .read<EditorBloc>()
                      .add(EditorContentChanged(content: value));
                },
              ),
            ),
            _WordCountBar(morandi: morandi, state: state),
          ],
        );
      },
    );
  }
}

class _SaveStatusBar extends StatelessWidget {
  const _SaveStatusBar({
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
        color: Colors.white,
        border: Border(bottom: BorderSide(color: morandi.fog)),
      ),
      child: Row(
        children: [
          if (state.isSaving) ...[
            SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: morandi.sage,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              'Saving...',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: morandi.inkLight,
                  ),
            ),
          ] else if (state.saveError != null) ...[
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: morandi.dustyRose,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              state.saveError!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: morandi.dustyRose,
                  ),
            ),
          ] else ...[
            Icon(Icons.check_circle, size: 14, color: morandi.sage),
            const SizedBox(width: 6),
            Text(
              'Saved',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: morandi.sage,
                  ),
            ),
          ],
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
        color: Colors.white,
        border: Border(top: BorderSide(color: morandi.fog)),
      ),
      child: Row(
        children: [
          Text(
            '${state.wordCount} words',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: morandi.stone,
                ),
          ),
          const Spacer(),
          Text(
            state.chapter?.title ?? '',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: morandi.stone,
                ),
          ),
        ],
      ),
    );
  }
}
