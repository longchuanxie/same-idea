import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';

part 'create_project_event.dart';
part 'create_project_state.dart';

class CreateProjectBloc extends Bloc<CreateProjectEvent, CreateProjectState> {
  CreateProjectBloc({
    required ProjectRepository projectRepository,
    required ChapterRepository chapterRepository,
    required OutlineNodeRepository outlineNodeRepository,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _projectRepository = projectRepository,
        _chapterRepository = chapterRepository,
        _outlineNodeRepository = outlineNodeRepository,
        _idGenerator = idGenerator,
        _clock = clock,
        super(const CreateProjectState()) {
    on<CreateProjectTitleChanged>(_onTitleChanged);
    on<CreateProjectAuthorChanged>(_onAuthorChanged);
    on<CreateProjectGenreChanged>(_onGenreChanged);
    on<CreateProjectLanguageChanged>(_onLanguageChanged);
    on<CreateProjectSubmitted>(_onSubmitted);
  }

  final ProjectRepository _projectRepository;
  final ChapterRepository _chapterRepository;
  final OutlineNodeRepository _outlineNodeRepository;
  final IdGenerator _idGenerator;
  final AppClock _clock;

  void _onTitleChanged(
    CreateProjectTitleChanged event,
    Emitter<CreateProjectState> emit,
  ) {
    emit(state.copyWith(title: event.title));
  }

  void _onAuthorChanged(
    CreateProjectAuthorChanged event,
    Emitter<CreateProjectState> emit,
  ) {
    emit(state.copyWith(author: event.author));
  }

  void _onGenreChanged(
    CreateProjectGenreChanged event,
    Emitter<CreateProjectState> emit,
  ) {
    emit(state.copyWith(genre: event.genre));
  }

  void _onLanguageChanged(
    CreateProjectLanguageChanged event,
    Emitter<CreateProjectState> emit,
  ) {
    emit(state.copyWith(language: event.language));
  }

  Future<void> _onSubmitted(
    CreateProjectSubmitted event,
    Emitter<CreateProjectState> emit,
  ) async {
    if (state.title.trim().isEmpty) {
      emit(state.copyWith(error: 'Title is required'));
      return;
    }

    emit(state.copyWith(isSubmitting: true, error: null));

    final now = _clock.now();
    final projectId = _idGenerator.generate();
    final outlineId = _idGenerator.generate();
    final chapterId = _idGenerator.generate();

    final project = Project(
      id: projectId,
      title: state.title.trim(),
      author: state.author.trim(),
      language: state.language,
      genre: state.genre.trim(),
      activeChapterId: chapterId,
      createdAt: now,
      updatedAt: now,
    );

    final projectResult = await _projectRepository.create(project);
    if (projectResult.isFailure) {
      emit(state.copyWith(
        isSubmitting: false,
        error: projectResult.maybeFailure?.userMessage ?? 'Failed to create project',
      ));
      return;
    }

    final outline = OutlineNode(
      id: outlineId,
      projectId: projectId,
      order: 0,
      title: 'Chapter 1',
      linkedChapterId: chapterId,
      nodeType: OutlineNodeType.chapter,
      status: OutlineNodeStatus.planned,
      createdAt: now,
      updatedAt: now,
    );

    final outlineResult = await _outlineNodeRepository.create(outline);
    if (outlineResult.isFailure) {
      emit(state.copyWith(
        isSubmitting: false,
        error: outlineResult.maybeFailure?.userMessage ?? 'Failed to create outline',
      ));
      return;
    }

    final chapter = Chapter(
      id: chapterId,
      projectId: projectId,
      title: 'Chapter 1',
      order: 0,
      outlineNodeId: outlineId,
      contentFormat: ContentFormat.markdown,
      status: ChapterStatus.draft,
      createdAt: now,
      updatedAt: now,
    );

    final chapterResult = await _chapterRepository.create(chapter);
    if (chapterResult.isFailure) {
      emit(state.copyWith(
        isSubmitting: false,
        error: chapterResult.maybeFailure?.userMessage ?? 'Failed to create chapter',
      ));
      return;
    }

    emit(state.copyWith(isSubmitting: false, createdProjectId: projectId));
  }
}
