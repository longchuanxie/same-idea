import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/editor/commands/editor_command.dart';
import 'package:novel_creator/editor/state/editor_state.dart';

void main() {
  group('EditorCommand', () {
    group('InsertTextCommand', () {
      test('inserts text at the given offset', () {
        const command = InsertTextCommand(offset: 5, text: ' beautiful');
        final result = command.apply('Hello world');
        expect(result.valueOrNull, 'Hello beautiful world');
      });

      test('inserts at the beginning', () {
        const command = InsertTextCommand(offset: 0, text: 'Start: ');
        final result = command.apply('Hello');
        expect(result.valueOrNull, 'Start: Hello');
      });

      test('inserts at the end', () {
        const command = InsertTextCommand(offset: 5, text: ' world');
        final result = command.apply('Hello');
        expect(result.valueOrNull, 'Hello world');
      });

      test('reverses insertion by deleting the inserted text', () {
        const command = InsertTextCommand(offset: 5, text: ' beautiful');
        final applied = command.apply('Hello world').valueOrNull!;
        final reversed = command.reverse(applied);
        expect(reversed.valueOrNull, 'Hello world');
      });

      test('fails for negative offset', () {
        const command = InsertTextCommand(offset: -1, text: 'x');
        expect(command.apply('Hello').isFailure, isTrue);
      });

      test('fails for offset beyond content length', () {
        const command = InsertTextCommand(offset: 10, text: 'x');
        expect(command.apply('Hello').isFailure, isTrue);
      });
    });

    group('ReplaceTextCommand', () {
      test('replaces text in the given range', () {
        const command = ReplaceTextCommand(
          startOffset: 6,
          endOffset: 11,
          originalText: 'world',
          newText: 'Dart',
        );
        final result = command.apply('Hello world');
        expect(result.valueOrNull, 'Hello Dart');
      });

      test('reverses replacement', () {
        const command = ReplaceTextCommand(
          startOffset: 6,
          endOffset: 11,
          originalText: 'world',
          newText: 'Dart',
        );
        final applied = command.apply('Hello world').valueOrNull!;
        final reversed = command.reverse(applied);
        expect(reversed.valueOrNull, 'Hello world');
      });

      test('fails for invalid range', () {
        const command = ReplaceTextCommand(
          startOffset: 11,
          endOffset: 6,
          originalText: 'world',
          newText: 'Dart',
        );
        expect(command.apply('Hello world').isFailure, isTrue);
      });

      test('fails for range beyond content', () {
        const command = ReplaceTextCommand(
          startOffset: 6,
          endOffset: 100,
          originalText: 'world',
          newText: 'Dart',
        );
        expect(command.apply('Hello world').isFailure, isTrue);
      });
    });

    group('DeleteTextCommand', () {
      test('deletes text in the given range', () {
        const command = DeleteTextCommand(
          startOffset: 5,
          endOffset: 11,
          deletedText: ' world',
        );
        final result = command.apply('Hello world');
        expect(result.valueOrNull, 'Hello');
      });

      test('reverses deletion by inserting the deleted text', () {
        const command = DeleteTextCommand(
          startOffset: 5,
          endOffset: 11,
          deletedText: ' world',
        );
        final applied = command.apply('Hello world').valueOrNull!;
        final reversed = command.reverse(applied);
        expect(reversed.valueOrNull, 'Hello world');
      });

      test('fails for invalid range', () {
        const command = DeleteTextCommand(
          startOffset: 11,
          endOffset: 5,
          deletedText: ' world',
        );
        expect(command.apply('Hello world').isFailure, isTrue);
      });
    });
  });

  group('EditorState', () {
    test('initial state has empty undo/redo stacks', () {
      final state = EditorState.initial('Hello');
      expect(state.content, 'Hello');
      expect(state.canUndo, isFalse);
      expect(state.canRedo, isFalse);
    });

    test('execute adds command to undo stack and clears redo', () {
      final state = EditorState.initial('Hello');
      const command = InsertTextCommand(offset: 5, text: ' world');

      final result = state.execute(command);
      final newState = result.valueOrNull!;

      expect(newState.content, 'Hello world');
      expect(newState.canUndo, isTrue);
      expect(newState.canRedo, isFalse);
      expect(newState.undoStack.length, 1);
    });

    test('undo reverses the last command', () {
      final state = EditorState.initial('Hello');
      const command = InsertTextCommand(offset: 5, text: ' world');
      final afterExecute = state.execute(command).valueOrNull!;

      final afterUndo = afterExecute.undo().valueOrNull!;

      expect(afterUndo.content, 'Hello');
      expect(afterUndo.canUndo, isFalse);
      expect(afterUndo.canRedo, isTrue);
    });

    test('redo re-applies the last undone command', () {
      final state = EditorState.initial('Hello');
      const command = InsertTextCommand(offset: 5, text: ' world');
      final afterExecute = state.execute(command).valueOrNull!;
      final afterUndo = afterExecute.undo().valueOrNull!;

      final afterRedo = afterUndo.redo().valueOrNull!;

      expect(afterRedo.content, 'Hello world');
      expect(afterRedo.canUndo, isTrue);
      expect(afterRedo.canRedo, isFalse);
    });

    test('execute clears redo stack', () {
      final state = EditorState.initial('Hello');
      const command1 = InsertTextCommand(offset: 5, text: ' world');
      final afterExecute = state.execute(command1).valueOrNull!;
      final afterUndo = afterExecute.undo().valueOrNull!;

      expect(afterUndo.canRedo, isTrue);

      const command2 = InsertTextCommand(offset: 0, text: 'Say: ');
      final afterNewExecute = afterUndo.execute(command2).valueOrNull!;

      expect(afterNewExecute.canRedo, isFalse);
      expect(afterNewExecute.content, 'Say: Hello');
    });

    test('multiple undo/redo operations work correctly', () {
      final state = EditorState.initial('');
      const insert1 = InsertTextCommand(offset: 0, text: 'Hello');
      const insert2 = InsertTextCommand(offset: 5, text: ' world');
      const insert3 = InsertTextCommand(offset: 11, text: '!');

      var current = state.execute(insert1).valueOrNull!;
      expect(current.content, 'Hello');

      current = current.execute(insert2).valueOrNull!;
      expect(current.content, 'Hello world');

      current = current.execute(insert3).valueOrNull!;
      expect(current.content, 'Hello world!');

      current = current.undo().valueOrNull!;
      expect(current.content, 'Hello world');

      current = current.undo().valueOrNull!;
      expect(current.content, 'Hello');

      current = current.redo().valueOrNull!;
      expect(current.content, 'Hello world');

      current = current.redo().valueOrNull!;
      expect(current.content, 'Hello world!');
    });

    test('undo fails when undo stack is empty', () {
      final state = EditorState.initial('Hello');
      final result = state.undo();
      expect(result.isFailure, isTrue);
    });

    test('redo fails when redo stack is empty', () {
      final state = EditorState.initial('Hello');
      final result = state.redo();
      expect(result.isFailure, isTrue);
    });

    test('execute fails when command fails', () {
      final state = EditorState.initial('Hello');
      const command = InsertTextCommand(offset: 100, text: 'x');
      final result = state.execute(command);
      expect(result.isFailure, isTrue);
    });

    test('undo stack is trimmed at max depth', () {
      var state = EditorState.initial('');
      for (var i = 0; i < 110; i++) {
        final command = InsertTextCommand(
          offset: state.content.length,
          text: 'a',
        );
        state = state.execute(command).valueOrNull!;
      }
      expect(state.undoStack.length, 100);
      expect(state.content.length, 110);
    });

    test('replace command undo/redo round-trip', () {
      final state = EditorState.initial('The quick brown fox');
      const command = ReplaceTextCommand(
        startOffset: 4,
        endOffset: 9,
        originalText: 'quick',
        newText: 'slow',
      );

      final afterExecute = state.execute(command).valueOrNull!;
      expect(afterExecute.content, 'The slow brown fox');

      final afterUndo = afterExecute.undo().valueOrNull!;
      expect(afterUndo.content, 'The quick brown fox');

      final afterRedo = afterUndo.redo().valueOrNull!;
      expect(afterRedo.content, 'The slow brown fox');
    });

    test('delete command undo/redo round-trip', () {
      final state = EditorState.initial('Hello world');
      const command = DeleteTextCommand(
        startOffset: 5,
        endOffset: 11,
        deletedText: ' world',
      );

      final afterExecute = state.execute(command).valueOrNull!;
      expect(afterExecute.content, 'Hello');

      final afterUndo = afterExecute.undo().valueOrNull!;
      expect(afterUndo.content, 'Hello world');

      final afterRedo = afterUndo.redo().valueOrNull!;
      expect(afterRedo.content, 'Hello');
    });
  });
}
