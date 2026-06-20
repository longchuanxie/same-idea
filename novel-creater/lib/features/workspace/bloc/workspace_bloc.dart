import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/agent/agent_mode_service.dart';
import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/cancellation_token.dart';
import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/events/domain_events.dart' as domain_events;
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';
import 'package:novel_creator/editor/revision/revision_service.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_event.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_state.dart';

export 'package:novel_creator/features/workspace/bloc/workspace_state.dart';

final class WorkspaceBloc extends Bloc<WorkspaceEvent, WorkspaceState> {
  WorkspaceBloc({
    required ProjectRepository projectRepository,
    required ChapterRepository chapterRepository,
    required RevisionRepository revisionRepository,
    required RevisionService revisionService,
    required AgentModeService agentModeService,
    required AgentWritingTool writingTool,
    required CharacterRepository characterRepository,
    required SettingEntryRepository settingEntryRepository,
    required NoteRepository noteRepository,
    required AppEventBus eventBus,
    Duration debounceDuration = const Duration(milliseconds: 1200),
  })  : _projectRepository = projectRepository,
        _chapterRepository = chapterRepository,
        _revisionRepository = revisionRepository,
        _revisionService = revisionService,
        _agentModeService = agentModeService,
        _writingTool = writingTool,
        _characterRepository = characterRepository,
        _settingEntryRepository = settingEntryRepository,
        _noteRepository = noteRepository,
        _eventBus = eventBus,
        _debounceDuration = debounceDuration,
        super(const WorkspaceState.initial()) {
    on<WorkspaceStarted>(_onWorkspaceStarted);
    on<WorkspaceProjectLoaded>(_onWorkspaceProjectLoaded);
    on<ChapterSelected>(_onChapterSelected);
    on<ChapterCreated>(_onChapterCreated);
    on<ChapterContentChanged>(_onChapterContentChanged);
    on<ChapterSaveDebounced>(_onChapterSaveDebounced);
    on<AgentSuggestionRequested>(_onAgentSuggestionRequested);
    on<AgentWriteRequested>(_onAgentWriteRequested);
    on<AgentRewriteRequested>(_onAgentRewriteRequested);
    on<AgentExpandRequested>(_onAgentExpandRequested);
    on<AgentCondenseRequested>(_onAgentCondenseRequested);
    on<AgentPolishRequested>(_onAgentPolishRequested);
    on<AgentCancelled>(_onAgentCancelled);
    on<PendingRevisionCreated>(_onPendingRevisionCreated);
    on<RevisionAccepted>(_onRevisionAccepted);
    on<RevisionRejected>(_onRevisionRejected);
    on<NavItemSelected>(_onNavItemSelected);
    on<ChapterTreeToggled>(_onChapterTreeToggled);
  }

  final ProjectRepository _projectRepository;
  final ChapterRepository _chapterRepository;
  final RevisionRepository _revisionRepository;
  final RevisionService _revisionService;
  final AgentModeService _agentModeService;
  final AgentWritingTool _writingTool;
  final CharacterRepository _characterRepository;
  final SettingEntryRepository _settingEntryRepository;
  final NoteRepository _noteRepository;
  final AppEventBus _eventBus;
  final Duration _debounceDuration;
  Timer? _saveDebounceTimer;
  String? _pendingSaveChapterId;
  String? _pendingSaveMarkdown;
  CancellationToken? _activeCancellationToken;

  Future<void> _onWorkspaceStarted(
    WorkspaceStarted event,
    Emitter<WorkspaceState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));
    final now = DateTime.now().toUtc();
    final project = Project(
      id: IdGenerator.create('project'),
      name: '示例项目',
      createdAt: now,
      updatedAt: now,
    );
    final projectResult = await _projectRepository.create(project);
    if (projectResult case AppFailure<Project>(:final error)) {
      emit(state.copyWith(isLoading: false, error: error));
      return;
    }
    _eventBus.publish(
      domain_events.ProjectCreated(
        projectId: project.id,
        projectName: project.name,
      ),
    );

    final chapter = Chapter(
      id: IdGenerator.create('chapter'),
      projectId: project.id,
      title: '第一章',
      markdownContent: '',
      plainTextCache: '',
      createdAt: now,
      updatedAt: now,
    );
    final chapterResult = await _chapterRepository.create(chapter);
    if (chapterResult case AppFailure<Chapter>(:final error)) {
      emit(state.copyWith(isLoading: false, error: error));
      return;
    }

    emit(
      state.copyWith(
        isLoading: false,
        saveStatusLabel: '已保存',
        project: project,
        chapters: <Chapter>[chapter],
        selectedChapter: chapter,
        agentMode: _inferAgentMode(
          projectId: project.id,
          chapterId: chapter.id,
        ),
        clearError: true,
      ),
    );

    // 异步加载知识库数据
    _loadAndEmitKnowledgeBase(project.id);
  }

  Future<void> _onWorkspaceProjectLoaded(
    WorkspaceProjectLoaded event,
    Emitter<WorkspaceState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    final projectResult = await _projectRepository.get(event.projectId);
    switch (projectResult) {
      case AppSuccess<Project?>(:final value):
        final project = value;
        if (project == null) {
          emit(
            state.copyWith(
              isLoading: false,
              error: const AppError(
                code: 'workspace.project_not_found',
                message: 'Project not found.',
                userMessage: '未找到项目。',
                source: AppErrorSource.storage,
                recoverable: true,
                suggestedAction: '请返回项目列表重新选择。',
              ),
            ),
          );
          return;
        }
        final chaptersResult = await _chapterRepository.list(project.id);
        switch (chaptersResult) {
          case AppSuccess<List<Chapter>>(:final value):
            final loadedChapters = value;
            final selectedChapter =
                loadedChapters.isNotEmpty ? loadedChapters.first : null;
            List<Revision> pendingRevisions = const <Revision>[];
            if (selectedChapter != null) {
              final revisionsResult =
                  await _revisionRepository.listPending(selectedChapter.id);
              if (revisionsResult case AppSuccess<List<Revision>>(:final value)) {
                pendingRevisions = value;
              }
            }
            emit(
              state.copyWith(
                isLoading: false,
                saveStatusLabel: '已保存',
                project: project,
                chapters: loadedChapters,
                selectedChapter: selectedChapter,
                pendingRevisions: pendingRevisions,
                agentMode: _inferAgentMode(
                  projectId: project.id,
                  chapterId: selectedChapter?.id,
                ),
                clearError: true,
              ),
            );
          case AppFailure<List<Chapter>>(:final error):
            emit(state.copyWith(isLoading: false, error: error));
        }
      case AppFailure<Project?>(:final error):
        emit(state.copyWith(isLoading: false, error: error));
    }
  }

  Future<void> _onChapterSelected(
    ChapterSelected event,
    Emitter<WorkspaceState> emit,
  ) async {
    final flushError = await _flushPendingSave(emit);
    final chapterResult = await _chapterRepository.get(event.chapterId);
    switch (chapterResult) {
      case AppSuccess<Chapter?>(:final value):
        if (value == null) {
          emit(state.copyWith(error: _missingChapterError));
          return;
        }
        final pendingResult = await _revisionRepository.listPending(value.id);
        switch (pendingResult) {
          case AppSuccess<List<Revision>>(value: final revisions):
            emit(
              state.copyWith(
                selectedChapter: value,
                agentMode: _inferAgentMode(
                  projectId: value.projectId,
                  chapterId: value.id,
                ),
                pendingRevisions: _mergeChapterRevisions(value.id, revisions),
                error: flushError,
                clearError: flushError == null,
              ),
            );
          case AppFailure<List<Revision>>(:final error):
            emit(state.copyWith(error: error));
        }
      case AppFailure<Chapter?>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  Future<void> _onChapterCreated(
    ChapterCreated event,
    Emitter<WorkspaceState> emit,
  ) async {
    final project = state.project;
    if (project == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final flushError = await _flushPendingSave(emit);
    final now = DateTime.now().toUtc();
    final chapter = Chapter(
      id: IdGenerator.create('chapter'),
      projectId: project.id,
      title: '第${state.chapters.length + 1}章',
      markdownContent: '',
      plainTextCache: '',
      createdAt: now,
      updatedAt: now,
    );
    final createResult = await _chapterRepository.create(chapter);
    switch (createResult) {
      case AppSuccess<Chapter>(:final value):
        final pendingResult = await _revisionRepository.listPending(value.id);
        switch (pendingResult) {
          case AppSuccess<List<Revision>>(value: final revisions):
            emit(
              state.copyWith(
                saveStatusLabel: '已保存',
                chapters: <Chapter>[...state.chapters, value],
                selectedChapter: value,
                pendingRevisions: _mergeChapterRevisions(value.id, revisions),
                agentMode: _inferAgentMode(
                  projectId: value.projectId,
                  chapterId: value.id,
                ),
                error: flushError,
                clearError: flushError == null,
              ),
            );
          case AppFailure<List<Revision>>(:final error):
            emit(state.copyWith(error: error));
        }
      case AppFailure<Chapter>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  void _onChapterContentChanged(
    ChapterContentChanged event,
    Emitter<WorkspaceState> emit,
  ) {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final changedChapter = chapter.copyWith(
      markdownContent: event.markdownContent,
      plainTextCache: event.markdownContent,
    );
    _cancelPendingSave();
    _pendingSaveChapterId = changedChapter.id;
    _pendingSaveMarkdown = event.markdownContent;
    _saveDebounceTimer = Timer(
      _debounceDuration,
      () {
        if (!isClosed) {
          add(
            ChapterSaveDebounced(
              chapterId: changedChapter.id,
              markdownContent: event.markdownContent,
            ),
          );
        }
      },
    );
    emit(
      state.copyWith(
        saveStatusLabel: '保存中',
        selectedChapter: changedChapter,
        chapters: _replaceChapter(changedChapter),
        agentMode: _inferAgentMode(
          projectId: changedChapter.projectId,
          chapterId: changedChapter.id,
        ),
        clearError: true,
      ),
    );
  }

  Future<void> _onChapterSaveDebounced(
    ChapterSaveDebounced event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null || chapter.id != event.chapterId) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final saveResult = await _chapterRepository.saveContent(
      id: event.chapterId,
      markdownContent: event.markdownContent,
      plainTextCache: event.markdownContent,
    );
    switch (saveResult) {
      case AppSuccess<Chapter>(:final value):
        if (_pendingSaveChapterId == event.chapterId &&
            _pendingSaveMarkdown == event.markdownContent) {
          _pendingSaveChapterId = null;
          _pendingSaveMarkdown = null;
        }
        _eventBus.publish(
          domain_events.ChapterContentChanged(
            projectId: value.projectId,
            chapterId: value.id,
            chapterTitle: value.title,
          ),
        );
        emit(
          state.copyWith(
            saveStatusLabel: '已保存',
            selectedChapter: value,
            chapters: _replaceChapter(value),
            agentMode: _inferAgentMode(
              projectId: value.projectId,
              chapterId: value.id,
            ),
            clearError: true,
          ),
        );
      case AppFailure<Chapter>(:final error):
        emit(state.copyWith(saveStatusLabel: '保存失败', error: error));
    }
  }

  // --- Agent tool handlers ---

  Future<void> _onAgentSuggestionRequested(
    AgentSuggestionRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    final result = await _writingTool.continueWrite(
      chapterId: chapter.id,
      cursorContext: chapter.markdownContent,
      targetLength: event.targetLength,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        emit(
          state.copyWith(
            agentSuggestion: value.continuedText,
            agentSuggestionType: AgentSuggestionType.continueWrite,
            agentSuggestionSummary: '',
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  Future<void> _onAgentWriteRequested(
    AgentWriteRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    final project = state.project;
    if (chapter == null || project == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final result = await _writingTool.write(
      projectId: project.id,
      chapterId: chapter.id,
      instruction: event.instruction,
      targetLength: event.targetLength,
      contextScope: event.contextScope,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        emit(
          state.copyWith(
            agentSuggestion: value.generatedText,
            agentSuggestionType: AgentSuggestionType.write,
            agentSuggestionSummary: value.summary,
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  Future<void> _onAgentRewriteRequested(
    AgentRewriteRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final result = await _writingTool.rewrite(
      selectedText: event.selectedText,
      instruction: event.instruction,
      styleProfile: event.styleProfile,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        emit(
          state.copyWith(
            agentSuggestion: value.revisedText,
            agentSuggestionType: AgentSuggestionType.rewrite,
            agentSuggestionSummary: value.changeSummary,
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                selectedText: event.selectedText,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  Future<void> _onAgentExpandRequested(
    AgentExpandRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final result = await _writingTool.expand(
      selectedText: event.selectedText,
      targetLength: event.targetLength,
      focus: event.focus,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        emit(
          state.copyWith(
            agentSuggestion: value.expandedText,
            agentSuggestionType: AgentSuggestionType.expand,
            agentSuggestionSummary: value.additionsSummary,
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                selectedText: event.selectedText,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  Future<void> _onAgentCondenseRequested(
    AgentCondenseRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final result = await _writingTool.condense(
      selectedText: event.selectedText,
      targetLength: event.targetLength,
      keepPoints: event.keepPoints,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        final removedDesc = value.removedPoints.isEmpty
            ? '无'
            : value.removedPoints.join('、');
        final summary = '已删除要点：$removedDesc';
        emit(
          state.copyWith(
            agentSuggestion: value.condensedText,
            agentSuggestionType: AgentSuggestionType.condense,
            agentSuggestionSummary: summary,
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                selectedText: event.selectedText,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  Future<void> _onAgentPolishRequested(
    AgentPolishRequested event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    final knowledgeData = await _loadKnowledgeBase(chapter.projectId);

    _activeCancellationToken = CancellationToken();
    emit(state.copyWith(agentIsGenerating: true));
    final result = await _writingTool.polish(
      selectedText: event.selectedText,
      styleGoal: event.styleGoal,
      strictness: event.strictness,
      cancellationToken: _activeCancellationToken,
    );
    _activeCancellationToken = null;
    switch (result) {
      case AppFailure(:final error):
        emit(state.copyWith(error: error, agentIsGenerating: false));
      case AppSuccess(:final value):
        emit(
          state.copyWith(
            agentSuggestion: value.polishedText,
            agentSuggestionType: AgentSuggestionType.polish,
            agentSuggestionSummary: value.styleNotes,
            agentProviderName: value.usedProvider ?? '',
            agentModelId: value.usedModel ?? '',
            agentIsGenerating: false,
            agentMode: _agentModeService.infer(
              AgentContext(
                projectId: chapter.projectId,
                chapterId: chapter.id,
                selectedText: event.selectedText,
                characters: knowledgeData.characters,
                settingEntries: knowledgeData.settingEntries,
                notes: knowledgeData.notes,
              ),
            ),
            clearError: true,
          ),
        );
    }
  }

  void _onAgentCancelled(
    AgentCancelled event,
    Emitter<WorkspaceState> emit,
  ) {
    _activeCancellationToken?.cancel();
    emit(state.copyWith(
      agentSuggestion: '',
      agentSuggestionSummary: '',
      agentIsGenerating: false,
    ));
  }

  // --- Revision handlers ---

  Future<void> _onPendingRevisionCreated(
    PendingRevisionCreated event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    final project = state.project;
    if (chapter == null || project == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }

    _cancelPendingSave();
    final patch = event.patch ??
        RevisionPatch(
          chapterId: chapter.id,
          baseContentHash: contentHash(chapter.markdownContent).toString(),
          operation: RevisionOperation.insert,
          anchor: RevisionAnchor(
            startOffset: chapter.markdownContent.length,
            endOffset: chapter.markdownContent.length,
          ),
          beforeText: '',
          afterText: event.afterText ?? state.agentSuggestion,
          source: RevisionSource.agent,
          metadata: const RevisionPatchMetadata(
            prompt: 'workspace suggestion',
            model: 'mock',
            summary: 'Agent suggestion pending review',
          ),
        );
    if (patch.chapterId != chapter.id) {
      emit(state.copyWith(error: _patchChapterMismatchError));
      return;
    }
    final now = DateTime.now().toUtc();
    final revision = Revision(
      id: IdGenerator.create('revision'),
      projectId: project.id,
      chapterId: patch.chapterId,
      patch: patch,
      createdAt: now,
      updatedAt: now,
    );
    final createResult = await _revisionRepository.create(revision);
    switch (createResult) {
      case AppSuccess<Revision>(:final value):
        _eventBus.publish(
          domain_events.RevisionCreated(
            projectId: project.id,
            revisionId: value.id,
            chapterId: value.chapterId,
          ),
        );
        emit(
          state.copyWith(
            pendingRevisions: <Revision>[...state.pendingRevisions, value],
            clearError: true,
          ),
        );
      case AppFailure<Revision>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  Future<void> _onRevisionAccepted(
    RevisionAccepted event,
    Emitter<WorkspaceState> emit,
  ) async {
    final chapter = state.selectedChapter;
    if (chapter == null) {
      emit(state.copyWith(error: _missingChapterError));
      return;
    }
    _cancelPendingSave();
    final revision = _revisionById(event.revisionId);
    if (revision == null) {
      emit(state.copyWith(error: _missingRevisionError));
      return;
    }
    if (revision.patch.chapterId != chapter.id) {
      emit(state.copyWith(error: _patchChapterMismatchError));
      return;
    }

    final applyResult = _revisionService.apply(
      baseContent: chapter.markdownContent,
      patch: revision.patch,
    );
    switch (applyResult) {
      case AppSuccess<String>(:final value):
        final saveResult = await _chapterRepository.saveContent(
          id: chapter.id,
          markdownContent: value,
          plainTextCache: value,
        );
        switch (saveResult) {
          case AppSuccess<Chapter>(value: final savedChapter):
            if (_pendingSaveChapterId == chapter.id) {
              _pendingSaveChapterId = null;
              _pendingSaveMarkdown = null;
            }
            final statusResult = await _revisionRepository.updateStatus(
              id: revision.id,
              status: RevisionStatus.accepted,
            );
            switch (statusResult) {
              case AppSuccess<Revision>(value: final updatedRevision):
                _eventBus.publish(
                  domain_events.RevisionAccepted(
                    projectId: revision.projectId,
                    revisionId: revision.id,
                    chapterId: revision.chapterId,
                  ),
                );
                emit(
                  state.copyWith(
                    saveStatusLabel: '已保存',
                    selectedChapter: savedChapter,
                    chapters: _replaceChapter(savedChapter),
                    pendingRevisions: _replaceRevision(updatedRevision),
                    clearError: true,
                  ),
                );
              case AppFailure<Revision>(:final error):
                emit(
                  state.copyWith(
                    saveStatusLabel: '已保存',
                    selectedChapter: savedChapter,
                    chapters: _replaceChapter(savedChapter),
                    error: error,
                  ),
                );
            }
          case AppFailure<Chapter>(:final error):
            emit(state.copyWith(saveStatusLabel: '保存失败', error: error));
        }
      case AppFailure<String>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  Future<void> _onRevisionRejected(
    RevisionRejected event,
    Emitter<WorkspaceState> emit,
  ) async {
    _cancelPendingSave();
    final revision = _revisionById(event.revisionId);
    if (revision == null) {
      emit(state.copyWith(error: _missingRevisionError));
      return;
    }

    final statusResult = await _revisionRepository.updateStatus(
      id: revision.id,
      status: RevisionStatus.rejected,
    );
    switch (statusResult) {
      case AppSuccess<Revision>(:final value):
        _eventBus.publish(
          domain_events.RevisionRejected(
            projectId: revision.projectId,
            revisionId: revision.id,
            chapterId: revision.chapterId,
          ),
        );
        emit(
          state.copyWith(
            pendingRevisions: _replaceRevision(value),
            clearError: true,
          ),
        );
      case AppFailure<Revision>(:final error):
        emit(state.copyWith(error: error));
    }
  }

  // --- Helpers ---

  void _onNavItemSelected(
    NavItemSelected event,
    Emitter<WorkspaceState> emit,
  ) {
    emit(state.copyWith(selectedNavItem: event.item));
  }

  void _onChapterTreeToggled(
    ChapterTreeToggled event,
    Emitter<WorkspaceState> emit,
  ) {
    emit(state.copyWith(chapterTreeExpanded: !state.chapterTreeExpanded));
  }

  AgentMode _inferAgentMode({String? projectId, String? chapterId}) =>
      _agentModeService.infer(
        AgentContext(projectId: projectId, chapterId: chapterId),
      );

  Future<void> _loadAndEmitKnowledgeBase(String projectId) async {
    final data = await _loadKnowledgeBase(projectId);
    if (!isClosed) {
      emit(state.copyWith(
        characters: data.characters,
        settingEntries: data.settingEntries,
        notes: data.notes,
      ));
    }
  }

  Future<({List<Character> characters, List<SettingEntry> settingEntries, List<Note> notes})>
      _loadKnowledgeBase(String projectId) async {
    final charactersResult = await _characterRepository.list(projectId);
    final settingEntriesResult =
        await _settingEntryRepository.list(projectId);
    final notesResult = await _noteRepository.list(projectId);

    final characters = switch (charactersResult) {
      AppSuccess<List<Character>>(:final value) => value,
      _ => <Character>[],
    };
    final settingEntries = switch (settingEntriesResult) {
      AppSuccess<List<SettingEntry>>(:final value) => value,
      _ => <SettingEntry>[],
    };
    final notes = switch (notesResult) {
      AppSuccess<List<Note>>(:final value) => value,
      _ => <Note>[],
    };

    return (characters: characters, settingEntries: settingEntries, notes: notes);
  }

  List<Chapter> _replaceChapter(Chapter chapter) => state.chapters
      .map((item) => item.id == chapter.id ? chapter : item)
      .toList(growable: false);

  List<Revision> _replaceRevision(Revision revision) => state.pendingRevisions
      .map((item) => item.id == revision.id ? revision : item)
      .toList(growable: false);

  List<Revision> _mergeChapterRevisions(
    String chapterId,
    List<Revision> chapterRevisions,
  ) {
    final others = state.pendingRevisions
        .where((revision) => revision.chapterId != chapterId);
    return <Revision>[...others, ...chapterRevisions];
  }

  void _cancelPendingSave() {
    _saveDebounceTimer?.cancel();
    _saveDebounceTimer = null;
  }

  Future<AppError?> _flushPendingSave(Emitter<WorkspaceState> emit) async {
    final chapterId = _pendingSaveChapterId;
    final markdown = _pendingSaveMarkdown;
    if (chapterId == null || markdown == null) {
      return null;
    }
    _cancelPendingSave();
    _pendingSaveChapterId = null;
    _pendingSaveMarkdown = null;
    final saveResult = await _chapterRepository.saveContent(
      id: chapterId,
      markdownContent: markdown,
      plainTextCache: markdown,
    );
    switch (saveResult) {
      case AppSuccess<Chapter>(:final value):
        final selected = state.selectedChapter;
        emit(
          state.copyWith(
            saveStatusLabel: '已保存',
            chapters: _replaceChapter(value),
            selectedChapter:
                selected?.id == value.id ? value : selected,
            clearError: true,
          ),
        );
        return null;
      case AppFailure<Chapter>(:final error):
        return error;
    }
  }

  Revision? _revisionById(String id) {
    for (final revision in state.pendingRevisions) {
      if (revision.id == id) {
        return revision;
      }
    }
    return null;
  }

  @override
  Future<void> close() async {
    _saveDebounceTimer?.cancel();
    _saveDebounceTimer = null;
    final chapterId = _pendingSaveChapterId;
    final markdown = _pendingSaveMarkdown;
    _pendingSaveChapterId = null;
    _pendingSaveMarkdown = null;
    if (chapterId != null && markdown != null) {
      await _chapterRepository.saveContent(
        id: chapterId,
        markdownContent: markdown,
        plainTextCache: markdown,
      );
    }
    return super.close();
  }

  static const _missingChapterError = AppError(
    code: 'workspace.chapter_missing',
    message: 'Selected chapter is missing.',
    userMessage: '未选择章节，无法执行操作。',
    source: AppErrorSource.editor,
    recoverable: true,
    suggestedAction: '请选择章节后重试。',
  );

  static const _patchChapterMismatchError = AppError(
    code: 'workspace.patch_chapter_mismatch',
    message: 'Revision patch chapter does not match selected chapter.',
    userMessage: '修订所属章节与当前章节不一致，无法执行操作。',
    source: AppErrorSource.editor,
    recoverable: true,
    suggestedAction: '请切换到修订所属章节后重试。',
  );

  static const _missingRevisionError = AppError(
    code: 'workspace.revision_missing',
    message: 'Revision is missing.',
    userMessage: '未找到修订，无法执行操作。',
    source: AppErrorSource.editor,
    recoverable: true,
    suggestedAction: '请刷新修订列表后重试。',
  );
}
