import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/search/search.dart';

part 'research_event.dart';
part 'research_state.dart';

class ResearchBloc extends Bloc<ResearchEvent, ResearchState> {
  ResearchBloc({
    required SearchProvider searchProvider,
    required NoteRepository noteRepository,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _searchProvider = searchProvider,
        _noteRepository = noteRepository,
        _idGenerator = idGenerator,
        _clock = clock,
        super(const ResearchState()) {
    on<ResearchStarted>(_onStarted);
    on<ResearchRiskConfirmed>(_onRiskConfirmed);
    on<ResearchQueryChanged>(_onQueryChanged);
    on<ResearchSearchRequested>(_onSearchRequested);
    on<ResearchSourceSaved>(_onSourceSaved);
  }

  final SearchProvider _searchProvider;
  final NoteRepository _noteRepository;
  final IdGenerator _idGenerator;
  final AppClock _clock;

  void _onStarted(
    ResearchStarted event,
    Emitter<ResearchState> emit,
  ) {
    emit(state.copyWith(projectId: event.projectId));
  }

  void _onRiskConfirmed(
    ResearchRiskConfirmed event,
    Emitter<ResearchState> emit,
  ) {
    emit(
      state.copyWith(
        hasConfirmedSearchRisk: true,
        lastMessage: '已确认联网调研边界',
      ),
    );
  }

  void _onQueryChanged(
    ResearchQueryChanged event,
    Emitter<ResearchState> emit,
  ) {
    emit(state.copyWith(query: event.query));
  }

  Future<void> _onSearchRequested(
    ResearchSearchRequested event,
    Emitter<ResearchState> emit,
  ) async {
    final projectId = state.projectId;
    if (projectId == null || projectId.isEmpty) {
      emit(state.copyWith(error: '调研模块尚未绑定项目'));
      return;
    }
    if (!state.hasConfirmedSearchRisk) {
      emit(state.copyWith(error: '请先确认联网调研会发送查询词和上下文范围'));
      return;
    }

    final query =
        event.query.trim().isEmpty ? state.query.trim() : event.query.trim();
    if (query.isEmpty) {
      emit(state.copyWith(error: '搜索词不能为空'));
      return;
    }

    emit(
      state.copyWith(
        query: query,
        isSearching: true,
      ),
    );

    final result = await _searchProvider.search(
      SearchPlan(
        projectId: projectId,
        query: query,
        maxResults: event.maxResults,
      ),
    );
    if (result.isFailure) {
      emit(
        state.copyWith(
          isSearching: false,
          error: result.maybeFailure?.userMessage ?? '搜索失败',
        ),
      );
      return;
    }

    emit(
      state.copyWith(
        isSearching: false,
        sources: result.maybeSuccess ?? const <SourceCard>[],
        lastMessage: '搜索完成',
      ),
    );
  }

  Future<void> _onSourceSaved(
    ResearchSourceSaved event,
    Emitter<ResearchState> emit,
  ) async {
    final source = event.source;
    final note = Note(
      id: _idGenerator.generate(),
      projectId: source.projectId,
      title: source.title,
      content: _buildResearchNoteContent(source),
      type: NoteType.research,
      sourceUrl: source.url,
      tags: ['research', ...source.tags],
      createdAt: _clock.now(),
      updatedAt: _clock.now(),
    );
    final result = await _noteRepository.create(note);
    if (result.isFailure) {
      emit(
        state.copyWith(
          error: result.maybeFailure?.userMessage ?? '保存调研笔记失败',
        ),
      );
      return;
    }

    emit(
      state.copyWith(
        savedNoteIds: {...state.savedNoteIds, note.id},
        lastMessage: '已保存为调研笔记',
      ),
    );
  }

  String _buildResearchNoteContent(SourceCard source) => [
        source.summary,
        '',
        'Source: ${source.title}',
        'URL: ${source.url}',
        'Domain: ${source.domain}',
        'Query: ${source.query}',
        'RetrievedAt: ${source.retrievedAt.toIso8601String()}',
        if (source.credibilityHint != null)
          'CredibilityHint: ${source.credibilityHint}',
        if (source.extractionFailed) 'Extraction: failed; summary only.',
      ].join('\n');
}
