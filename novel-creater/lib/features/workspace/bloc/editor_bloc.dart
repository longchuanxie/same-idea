import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/domain/domain.dart';

part 'editor_event.dart';
part 'editor_state.dart';

class EditorBloc extends Bloc<EditorEvent, EditorState> {
  EditorBloc({
    required ChapterRepository chapterRepository,
  })  : _chapterRepository = chapterRepository,
        super(const EditorState()) {
    on<EditorChapterLoaded>(_onChapterLoaded);
    on<EditorContentChanged>(_onContentChanged);
    on<EditorSaveRequested>(_onSaveRequested);
  }

  final ChapterRepository _chapterRepository;
  Timer? _debounceTimer;

  void _onChapterLoaded(
    EditorChapterLoaded event,
    Emitter<EditorState> emit,
  ) {
    emit(EditorState(
      chapter: event.chapter,
      content: event.chapter.content,
      lastSavedAt: event.chapter.updatedAt,
    ));
  }

  Future<void> _onContentChanged(
    EditorContentChanged event,
    Emitter<EditorState> emit,
  ) async {
    emit(state.copyWith(content: event.content));
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 1500), () {
      add(const EditorSaveRequested());
    });
  }

  Future<void> _onSaveRequested(
    EditorSaveRequested event,
    Emitter<EditorState> emit,
  ) async {
    _debounceTimer?.cancel();
    if (state.chapter == null) return;
    if (state.content == state.chapter!.content) return;

    emit(state.copyWith(isSaving: true, saveError: null));

    final result = await _chapterRepository.saveContent(
      state.chapter!.id,
      state.content,
    );

    if (result.isSuccess) {
      emit(state.copyWith(
        chapter: result.maybeSuccess!,
        isSaving: false,
        lastSavedAt: DateTime.now(),
      ));
    } else {
      emit(state.copyWith(
        isSaving: false,
        saveError: result.maybeFailure?.userMessage ?? 'Save failed',
      ));
    }
  }

  @override
  Future<void> close() {
    _debounceTimer?.cancel();
    return super.close();
  }
}
