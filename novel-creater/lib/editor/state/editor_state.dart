import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/editor/commands/editor_command.dart';

/// Maximum undo history depth.
const int _maxUndoDepth = 100;

/// Immutable editor state with undo/redo support.
final class EditorState {
  const EditorState({
    required this.content,
    required this.undoStack,
    required this.redoStack,
  });

  /// Create an initial editor state with the given content.
  factory EditorState.initial(String content) => EditorState(
        content: content,
        undoStack: <EditorCommand>[],
        redoStack: <EditorCommand>[],
      );

  /// Current editor content.
  final String content;

  /// Stack of commands that can be undone.
  final List<EditorCommand> undoStack;

  /// Stack of commands that can be redone.
  final List<EditorCommand> redoStack;

  bool get canUndo => undoStack.isNotEmpty;
  bool get canRedo => redoStack.isNotEmpty;

  /// Execute a command, returning the new state.
  AppResult<EditorState> execute(EditorCommand command) {
    final result = command.apply(content);
    if (result case AppFailure<String>()) {
      return AppResult<EditorState>.failure(result.error);
    }
    final newContent = result.valueOrNull!;
    final newUndoStack = List<EditorCommand>.from(undoStack)
      ..add(command);
    // Trim undo stack if it exceeds max depth
    if (newUndoStack.length > _maxUndoDepth) {
      newUndoStack.removeRange(0, newUndoStack.length - _maxUndoDepth);
    }
    return AppResult<EditorState>.success(
      EditorState(
        content: newContent,
        undoStack: List<EditorCommand>.unmodifiable(newUndoStack),
        redoStack: const <EditorCommand>[],
      ),
    );
  }

  /// Undo the last command, returning the new state.
  AppResult<EditorState> undo() {
    if (!canUndo) {
      return const AppResult<EditorState>.failure(
        AppError(
          code: 'editor.nothing_to_undo',
          message: 'No command to undo.',
          userMessage: '没有可撤销的操作。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    final command = undoStack.last;
    final result = command.reverse(content);
    if (result case AppFailure<String>()) {
      return AppResult<EditorState>.failure(result.error);
    }
    final newContent = result.valueOrNull!;
    return AppResult<EditorState>.success(
      EditorState(
        content: newContent,
        undoStack: List<EditorCommand>.unmodifiable(
          undoStack.sublist(0, undoStack.length - 1),
        ),
        redoStack: List<EditorCommand>.unmodifiable(
          <EditorCommand>[...redoStack, command],
        ),
      ),
    );
  }

  /// Redo the last undone command, returning the new state.
  AppResult<EditorState> redo() {
    if (!canRedo) {
      return const AppResult<EditorState>.failure(
        AppError(
          code: 'editor.nothing_to_redo',
          message: 'No command to redo.',
          userMessage: '没有可重做的操作。',
          source: AppErrorSource.editor,
          recoverable: true,
        ),
      );
    }
    final command = redoStack.last;
    final result = command.apply(content);
    if (result case AppFailure<String>()) {
      return AppResult<EditorState>.failure(result.error);
    }
    final newContent = result.valueOrNull!;
    return AppResult<EditorState>.success(
      EditorState(
        content: newContent,
        undoStack: List<EditorCommand>.unmodifiable(
          <EditorCommand>[...undoStack, command],
        ),
        redoStack: List<EditorCommand>.unmodifiable(
          redoStack.sublist(0, redoStack.length - 1),
        ),
      ),
    );
  }
}
