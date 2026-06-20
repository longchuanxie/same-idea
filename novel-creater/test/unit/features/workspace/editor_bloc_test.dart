import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';

void main() {
  late _FakeChapterRepository repository;
  late EditorBloc bloc;
  final fixedNow = DateTime(2026, 6, 4, 10, 30);

  Chapter chapter({
    String id = 'chapter-1',
    String title = 'Chapter One',
    String content = '',
  }) =>
      Chapter(
        id: id,
        projectId: 'project-1',
        title: title,
        order: 1,
        content: content,
        createdAt: fixedNow,
        updatedAt: fixedNow,
      );

  setUp(() {
    repository = _FakeChapterRepository();
    bloc = EditorBloc(
      chapterRepository: repository,
      clock: FixedClock(fixedNow),
    );
  });

  tearDown(() async {
    await bloc.close();
  });

  group('EditorBloc', () {
    test('saves title content cache and word count together', () async {
      final initial = chapter(content: 'Old content');
      repository.chapters[initial.id] = initial;

      bloc
        ..add(EditorChapterLoaded(chapter: initial))
        ..add(const EditorTitleChanged(title: 'Updated Title'))
        ..add(const EditorContentChanged(content: '# 你好 world'));

      final saved = await _requestSave(bloc);

      expect(saved, isTrue);
      final persisted = repository.chapters[initial.id]!;
      expect(persisted.title, 'Updated Title');
      expect(persisted.content, '# 你好 world');
      expect(persisted.plainTextCache, '你好 world');
      expect(persisted.wordCount, 3);
      expect(persisted.updatedAt, fixedNow);
      expect(bloc.state.hasUnsavedChanges, isFalse);
    });

    test('flushes unsaved content before loading another chapter', () async {
      final first = chapter(id: 'chapter-1', content: 'Draft');
      final second = chapter(id: 'chapter-2', title: 'Chapter Two');
      repository.chapters[first.id] = first;
      repository.chapters[second.id] = second;

      bloc.add(EditorChapterLoaded(chapter: first));
      await _pumpEventQueue();
      bloc.add(const EditorContentChanged(content: '切章前保存'));
      bloc.add(EditorChapterLoaded(chapter: second));

      await bloc.stream.firstWhere(
        (state) => state.chapter?.id == second.id,
      );

      expect(repository.chapters[first.id]!.content, '切章前保存');
      expect(repository.chapters[first.id]!.wordCount, 5);
      expect(bloc.state.chapter?.id, second.id);
    });

    test('keeps in-memory edits when save fails', () async {
      final initial = chapter(content: 'Original');
      repository
        ..chapters[initial.id] = initial
        ..shouldFailUpdate = true;

      bloc
        ..add(EditorChapterLoaded(chapter: initial))
        ..add(const EditorContentChanged(content: 'Unsaved text'));

      final saved = await _requestSave(bloc);

      expect(saved, isFalse);
      expect(bloc.state.content, 'Unsaved text');
      expect(bloc.state.saveError, 'Failed to update chapter');
      expect(repository.chapters[initial.id]!.content, 'Original');
    });

    test('counts mixed Chinese and English text', () async {
      final initial = chapter();
      repository.chapters[initial.id] = initial;

      bloc
        ..add(EditorChapterLoaded(chapter: initial))
        ..add(const EditorContentChanged(content: '你好 world，朋友 2026'));

      await _pumpEventQueue();

      expect(bloc.state.wordCount, 6);
    });
  });
}

Future<bool> _requestSave(EditorBloc bloc) async {
  await _pumpEventQueue();
  final completer = Completer<bool>();
  bloc.add(EditorSaveRequested(completer: completer));
  return completer.future;
}

Future<void> _pumpEventQueue() async {
  await Future<void>.delayed(Duration.zero);
}

class _FakeChapterRepository implements ChapterRepository {
  final chapters = <String, Chapter>{};
  bool shouldFailUpdate = false;

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) async {
    chapters[chapter.id] = chapter;
    return AppResult.success(chapter);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    chapters.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Chapter>> getById(String id) async {
    final chapter = chapters[id];
    if (chapter == null) {
      return AppResult.failure(_notFoundError);
    }
    return AppResult.success(chapter);
  }

  @override
  Future<AppResult<List<Chapter>>> getByProjectId(String projectId) async {
    return AppResult.success(
      chapters.values
          .where((chapter) => chapter.projectId == projectId)
          .toList(),
    );
  }

  @override
  Future<AppResult<Chapter>> saveContent(String id, String content) async {
    final chapter = chapters[id];
    if (chapter == null) {
      return AppResult.failure(_notFoundError);
    }
    final updated = chapter.copyWith(content: content);
    chapters[id] = updated;
    return AppResult.success(updated);
  }

  @override
  Future<AppResult<Chapter>> update(Chapter chapter) async {
    if (shouldFailUpdate) {
      return AppResult.failure(
        const AppError(
          code: 'STORAGE_ERROR',
          message: 'write failed',
          userMessage: 'Failed to update chapter',
          recoverable: true,
          source: AppErrorSource.storage,
        ),
      );
    }
    chapters[chapter.id] = chapter;
    return AppResult.success(chapter);
  }

  @override
  Stream<AppResult<Chapter>> watchById(String id) async* {
    final chapter = chapters[id];
    if (chapter == null) {
      yield AppResult.failure(_notFoundError);
    } else {
      yield AppResult.success(chapter);
    }
  }

  @override
  Stream<AppResult<List<Chapter>>> watchByProjectId(String projectId) async* {
    yield AppResult.success(
      chapters.values
          .where((chapter) => chapter.projectId == projectId)
          .toList(),
    );
  }

  static const _notFoundError = AppError(
    code: 'NOT_FOUND',
    message: 'Chapter not found',
    userMessage: 'Chapter not found',
    recoverable: false,
    source: AppErrorSource.storage,
  );
}
