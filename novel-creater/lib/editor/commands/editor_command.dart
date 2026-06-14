import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

/// A command that modifies editor content.
/// Each command is reversible, enabling undo/redo.
sealed class EditorCommand {
  const EditorCommand();

  /// Apply this command to [content], returning the new content.
  AppResult<String> apply(String content);

  /// Reverse this command on [content], returning the previous content.
  AppResult<String> reverse(String content);
}

/// Insert text at a specific offset.
final class InsertTextCommand extends EditorCommand {
  const InsertTextCommand({
    required this.offset,
    required this.text,
  });

  final int offset;
  final String text;

  @override
  AppResult<String> apply(String content) {
    if (offset < 0 || offset > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_offset',
          message: 'Insert offset is out of range.',
          userMessage: '插入位置无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(offset, offset, text),
    );
  }

  @override
  AppResult<String> reverse(String content) {
    final deleteEnd = offset + text.length;
    if (offset < 0 || deleteEnd > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_offset',
          message: 'Reverse insert offset is out of range.',
          userMessage: '撤销插入位置无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(offset, deleteEnd, ''),
    );
  }
}

/// Replace text in a range with new text.
final class ReplaceTextCommand extends EditorCommand {
  const ReplaceTextCommand({
    required this.startOffset,
    required this.endOffset,
    required this.originalText,
    required this.newText,
  });

  final int startOffset;
  final int endOffset;
  final String originalText;
  final String newText;

  @override
  AppResult<String> apply(String content) {
    if (startOffset < 0 ||
        endOffset < startOffset ||
        endOffset > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_range',
          message: 'Replace range is out of bounds.',
          userMessage: '替换范围无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(startOffset, endOffset, newText),
    );
  }

  @override
  AppResult<String> reverse(String content) {
    final newEnd = startOffset + newText.length;
    if (startOffset < 0 || newEnd > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_range',
          message: 'Reverse replace range is out of bounds.',
          userMessage: '撤销替换范围无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(startOffset, newEnd, originalText),
    );
  }
}

/// Delete text in a range.
final class DeleteTextCommand extends EditorCommand {
  const DeleteTextCommand({
    required this.startOffset,
    required this.endOffset,
    required this.deletedText,
  });

  final int startOffset;
  final int endOffset;
  final String deletedText;

  @override
  AppResult<String> apply(String content) {
    if (startOffset < 0 ||
        endOffset < startOffset ||
        endOffset > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_range',
          message: 'Delete range is out of bounds.',
          userMessage: '删除范围无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(startOffset, endOffset, ''),
    );
  }

  @override
  AppResult<String> reverse(String content) {
    if (startOffset < 0 || startOffset > content.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'editor.invalid_offset',
          message: 'Reverse delete offset is out of range.',
          userMessage: '撤销删除位置无效。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    return AppResult<String>.success(
      content.replaceRange(startOffset, startOffset, deletedText),
    );
  }
}
