import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/domain/domain.dart';

part 'editor_event.dart';
part 'editor_state.dart';

class EditorBloc extends Bloc<EditorEvent, EditorState> {
  EditorBloc({
    required ChapterRepository chapterRepository,
    required AppClock clock,
  })  : _chapterRepository = chapterRepository,
        _clock = clock,
        super(const EditorState()) {
    on<EditorChapterLoaded>(_onChapterLoaded);
    on<EditorContentChanged>(_onContentChanged);
    on<EditorTitleChanged>(_onTitleChanged);
    on<EditorSaveRequested>(_onSaveRequested);
  }

  final ChapterRepository _chapterRepository;
  final AppClock _clock;
  Timer? _debounceTimer;

  Future<void> _onChapterLoaded(
    EditorChapterLoaded event,
    Emitter<EditorState> emit,
  ) async {
    if (state.chapter != null &&
        state.chapter!.id != event.chapter.id &&
        state.hasUnsavedChanges) {
      final saved = await _save(emit);
      if (!saved) return;
    }

    _debounceTimer?.cancel();
    emit(
      EditorState(
        chapter: event.chapter,
        title: event.chapter.title,
        content: event.chapter.content,
        lastSavedAt: state.lastSavedAt,
      ),
    );
  }

  void _onContentChanged(
    EditorContentChanged event,
    Emitter<EditorState> emit,
  ) {
    emit(state.copyWith(content: event.content));
    _scheduleSave();
  }

  void _onTitleChanged(
    EditorTitleChanged event,
    Emitter<EditorState> emit,
  ) {
    emit(state.copyWith(title: event.title));
    _scheduleSave();
  }

  Future<void> _onSaveRequested(
    EditorSaveRequested event,
    Emitter<EditorState> emit,
  ) async {
    final saved = await _save(emit);
    event.completer?.complete(saved);
  }

  void _scheduleSave() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(seconds: 2), () {
      add(const EditorSaveRequested());
    });
  }

  Future<bool> _save(Emitter<EditorState> emit) async {
    if (state.chapter == null) return true;
    if (!state.hasUnsavedChanges) return true;

    _debounceTimer?.cancel();
    emit(state.copyWith(isSaving: true));

    final now = _clock.now();
    final plainText = plainTextFromMarkdown(state.content);
    final updated = state.chapter!.copyWith(
      title: state.title.trim().isEmpty ? state.chapter!.title : state.title,
      content: state.content,
      plainTextCache: plainText,
      wordCount: countWritingUnits(state.content),
      updatedAt: now,
    );

    final result = await _chapterRepository.update(updated);
    if (result.isSuccess) {
      emit(
        state.copyWith(
          chapter: result.maybeSuccess,
          title: result.maybeSuccess?.title,
          isSaving: false,
          lastSavedAt: now,
        ),
      );
      return true;
    } else {
      emit(
        state.copyWith(
          isSaving: false,
          saveError:
              result.maybeFailure?.userMessage ?? 'Failed to save chapter',
        ),
      );
      return false;
    }
  }

  @override
  Future<void> close() {
    _debounceTimer?.cancel();
    return super.close();
  }
}
