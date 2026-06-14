import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/events/domain_events.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/services/export_service.dart';
import 'package:novel_creator/features/export/bloc/export_event.dart';
import 'package:novel_creator/features/export/bloc/export_state.dart';

class ExportBloc extends Bloc<ExportEvent, ExportState> {
  ExportBloc({
    required ExportService exportService,
    required ProjectRepository projectRepository,
    required ChapterRepository chapterRepository,
    required RevisionRepository revisionRepository,
    required AppEventBus eventBus,
  })  : _exportService = exportService,
        _projectRepository = projectRepository,
        _chapterRepository = chapterRepository,
        _revisionRepository = revisionRepository,
        _eventBus = eventBus,
        super(const ExportState()) {
    on<ExportLoaded>(_onLoaded);
    on<ExportFormatSelected>(_onFormatSelected);
    on<ExportOnlyAcceptedToggled>(_onOnlyAcceptedToggled);
    on<ExportIncludeTocToggled>(_onIncludeTocToggled);
    on<ExportAuthorChanged>(_onAuthorChanged);
    on<ExportPreviewRequested>(_onPreviewRequested);
    on<ExportConfirmed>(_onConfirmed);
    on<ExportRevisionWarningDismissed>(_onRevisionWarningDismissed);
  }

  final ExportService _exportService;
  final ProjectRepository _projectRepository;
  final ChapterRepository _chapterRepository;
  final RevisionRepository _revisionRepository;
  final AppEventBus _eventBus;

  Future<void> _onLoaded(
    ExportLoaded event,
    Emitter<ExportState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    // Load project
    final projectResult = await _projectRepository.get(event.projectId);
    if (projectResult.isFailure) {
      emit(state.copyWith(
        isLoading: false,
        error: projectResult.errorOrNull,
      ));
      return;
    }
    final project = projectResult.valueOrNull;
    if (project == null) {
      emit(state.copyWith(
        isLoading: false,
        error: const AppError(
          code: 'export.project_not_found',
          message: 'Project not found.',
          userMessage: '未找到项目。',
          source: AppErrorSource.export,
        ),
      ));
      return;
    }

    // Load chapters
    final chaptersResult = await _chapterRepository.list(event.projectId);
    if (chaptersResult.isFailure) {
      emit(state.copyWith(
        isLoading: false,
        error: chaptersResult.errorOrNull,
      ));
      return;
    }
    final chapters = chaptersResult.valueOrNull!;

    // Count pending revisions
    int pendingCount = 0;
    for (final Chapter chapter in chapters) {
      final pendingResult = await _revisionRepository.listPending(chapter.id);
      if (pendingResult.isSuccess) {
        pendingCount += pendingResult.valueOrNull!.length;
      }
    }

    final totalWordCount = chapters.fold<int>(
      0,
      (sum, ch) => sum + ch.effectiveWordCount,
    );

    emit(state.copyWith(
      projectId: event.projectId,
      projectName: project.name,
      chapterCount: chapters.length,
      totalWordCount: totalWordCount,
      pendingRevisionCount: pendingCount,
      showRevisionWarning: pendingCount > 0,
      isLoading: false,
    ));
  }

  void _onFormatSelected(
    ExportFormatSelected event,
    Emitter<ExportState> emit,
  ) {
    emit(state.copyWith(
      format: event.format,
      clearPreview: true,
      clearExportResult: true,
    ));
  }

  void _onOnlyAcceptedToggled(
    ExportOnlyAcceptedToggled event,
    Emitter<ExportState> emit,
  ) {
    emit(state.copyWith(
      onlyAcceptedContent: event.onlyAccepted,
      clearPreview: true,
    ));
  }

  void _onIncludeTocToggled(
    ExportIncludeTocToggled event,
    Emitter<ExportState> emit,
  ) {
    emit(state.copyWith(
      includeToc: event.includeToc,
      clearPreview: true,
    ));
  }

  void _onAuthorChanged(
    ExportAuthorChanged event,
    Emitter<ExportState> emit,
  ) {
    emit(state.copyWith(author: event.author));
  }

  Future<void> _onPreviewRequested(
    ExportPreviewRequested event,
    Emitter<ExportState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    final result = await _exportService.export(state.config);

    if (result.isFailure) {
      emit(state.copyWith(isLoading: false, error: result.errorOrNull));
      return;
    }

    final exportResult = result.valueOrNull!;
    // Limit preview to first 5000 characters
    final preview = exportResult.content.length > 5000
        ? '${exportResult.content.substring(0, 5000)}\n\n... (预览截断，共 ${exportResult.content.length} 字符)'
        : exportResult.content;

    emit(state.copyWith(
      isLoading: false,
      previewContent: preview,
    ));
  }

  Future<void> _onConfirmed(
    ExportConfirmed event,
    Emitter<ExportState> emit,
  ) async {
    // Warn about pending revisions
    if (state.hasPendingRevisions && state.onlyAcceptedContent && !state.showRevisionWarning) {
      emit(state.copyWith(showRevisionWarning: true));
      return;
    }

    emit(state.copyWith(isExporting: true, clearError: true));

    final result = await _exportService.export(state.config);

    if (result.isFailure) {
      emit(state.copyWith(isExporting: false, error: result.errorOrNull));
      return;
    }

    emit(state.copyWith(
      isExporting: false,
      exportResult: result.valueOrNull,
      showRevisionWarning: false,
    ));

    final exportData = result.valueOrNull;
    if (exportData != null && state.projectId != null) {
      _eventBus.publish(
        ExportCompleted(
          projectId: state.projectId!,
          format: state.format.name,
          filePath: exportData.fileName ?? '',
        ),
      );
    }
  }

  void _onRevisionWarningDismissed(
    ExportRevisionWarningDismissed event,
    Emitter<ExportState> emit,
  ) {
    emit(state.copyWith(showRevisionWarning: false));
  }
}
