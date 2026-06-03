import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';

part 'chapter_tree_event.dart';
part 'chapter_tree_state.dart';

class ChapterTreeBloc extends Bloc<ChapterTreeEvent, ChapterTreeState> {
  ChapterTreeBloc({
    required ChapterRepository chapterRepository,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _chapterRepository = chapterRepository,
        _idGenerator = idGenerator,
        _clock = clock,
        super(const ChapterTreeState()) {
    on<ChapterTreeStarted>(_onStarted);
    on<ChapterTreeChapterSelected>(_onChapterSelected);
    on<ChapterTreeChapterAdded>(_onChapterAdded);
    on<ChapterTreeChapterRenamed>(_onChapterRenamed);
    on<ChapterTreeChapterDeleted>(_onChapterDeleted);
  }

  final ChapterRepository _chapterRepository;
  final IdGenerator _idGenerator;
  final AppClock _clock;

  Future<void> _onStarted(
    ChapterTreeStarted event,
    Emitter<ChapterTreeState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _chapterRepository.getByProjectId(event.projectId);
    if (result.isSuccess) {
      final chapters = result.maybeSuccess!
        ..sort((a, b) => a.order.compareTo(b.order));
      final selectedId = chapters.isNotEmpty ? chapters.first.id : null;
      emit(state.copyWith(
        chapters: chapters,
        isLoading: false,
        selectedChapterId: selectedId,
      ));
    } else {
      emit(state.copyWith(
        isLoading: false,
        error: result.maybeFailure?.userMessage ?? 'Failed to load chapters',
      ));
    }
  }

  void _onChapterSelected(
    ChapterTreeChapterSelected event,
    Emitter<ChapterTreeState> emit,
  ) {
    emit(state.copyWith(selectedChapterId: event.chapterId));
  }

  Future<void> _onChapterAdded(
    ChapterTreeChapterAdded event,
    Emitter<ChapterTreeState> emit,
  ) async {
    final now = _clock.now();
    final chapterId = _idGenerator.generate();
    final nextOrder = state.chapters.length;
    final chapter = Chapter(
      id: chapterId,
      projectId: event.projectId,
      title: 'Chapter ${nextOrder + 1}',
      order: nextOrder,
      status: ChapterStatus.draft,
      contentFormat: ContentFormat.markdown,
      createdAt: now,
      updatedAt: now,
    );

    final result = await _chapterRepository.create(chapter);
    if (result.isSuccess) {
      final updatedChapters = List<Chapter>.from(state.chapters)
        ..add(result.maybeSuccess!);
      emit(state.copyWith(
        chapters: updatedChapters,
        selectedChapterId: chapterId,
      ));
    } else {
      emit(state.copyWith(
        error: result.maybeFailure?.userMessage ?? 'Failed to add chapter',
      ));
    }
  }

  Future<void> _onChapterRenamed(
    ChapterTreeChapterRenamed event,
    Emitter<ChapterTreeState> emit,
  ) async {
    final idx = state.chapters.indexWhere((c) => c.id == event.chapterId);
    if (idx == -1) return;

    final updated = state.chapters[idx].copyWith(
      title: event.newTitle,
      updatedAt: _clock.now(),
    );

    final result = await _chapterRepository.update(updated);
    if (result.isSuccess) {
      final chapters = List<Chapter>.from(state.chapters)
        ..[idx] = result.maybeSuccess!;
      emit(state.copyWith(chapters: chapters));
    } else {
      emit(state.copyWith(
        error: result.maybeFailure?.userMessage ?? 'Failed to rename chapter',
      ));
    }
  }

  Future<void> _onChapterDeleted(
    ChapterTreeChapterDeleted event,
    Emitter<ChapterTreeState> emit,
  ) async {
    final result = await _chapterRepository.delete(event.chapterId);
    if (result.isSuccess) {
      final chapters = state.chapters
          .where((c) => c.id != event.chapterId)
          .toList();
      final selectedId = state.selectedChapterId == event.chapterId
          ? (chapters.isNotEmpty ? chapters.first.id : null)
          : state.selectedChapterId;
      emit(state.copyWith(
        chapters: chapters,
        selectedChapterId: selectedId,
      ));
    } else {
      emit(state.copyWith(
        error: result.maybeFailure?.userMessage ?? 'Failed to delete chapter',
      ));
    }
  }
}
