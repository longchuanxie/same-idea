import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/repositories/in_memory_chapter_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';
import 'package:novel_creator/features/export/bloc/export_bloc.dart';
import 'package:novel_creator/features/export/bloc/export_event.dart';
import 'package:novel_creator/features/export/bloc/export_state.dart';
import 'package:novel_creator/features/export/services/default_export_service.dart';

void main() {
  const projectId = 'test-project';

  Future<ExportBloc> buildBloc({
    bool withPendingRevision = false,
  }) async {
    final projectRepo = InMemoryProjectRepository();
    final chapterRepo = InMemoryChapterRepository();
    final revisionRepo = InMemoryRevisionRepository();

    final now = DateTime.utc(2026);
    await projectRepo.create(Project(
      id: projectId,
      name: '测试小说',
      createdAt: now,
      updatedAt: now,
    ));

    await chapterRepo.create(Chapter(
      id: 'ch1',
      projectId: projectId,
      title: '初遇',
      markdownContent: '那是一个雨夜。',
      plainTextCache: '那是一个雨夜。',
      createdAt: now,
      updatedAt: now,
    ));

    await chapterRepo.create(Chapter(
      id: 'ch2',
      projectId: projectId,
      title: '重逢',
      markdownContent: '多年以后。',
      plainTextCache: '多年以后。',
      createdAt: now,
      updatedAt: now,
    ));

    if (withPendingRevision) {
      final patch = RevisionPatch(
        chapterId: 'ch1',
        baseContentHash: 'hash1',
        operation: RevisionOperation.insert,
        anchor: const RevisionAnchor(startOffset: 0, endOffset: 0),
        beforeText: '',
        afterText: '新增内容',
        source: RevisionSource.agent,
        metadata: const RevisionPatchMetadata(
          prompt: '测试',
          model: 'mock',
          summary: '测试修订',
        ),
      );
      await revisionRepo.create(Revision(
        id: 'rev1',
        projectId: projectId,
        chapterId: 'ch1',
        patch: patch,
        createdAt: now,
        updatedAt: now,
        status: RevisionStatus.pending,
      ));
    }

    final exportService = DefaultExportService(
      projectRepository: projectRepo,
      chapterRepository: chapterRepo,
      revisionRepository: revisionRepo,
    );

    return ExportBloc(
      exportService: exportService,
      projectRepository: projectRepo,
      chapterRepository: chapterRepo,
      revisionRepository: revisionRepo,
      eventBus: AppEventBus(),
    );
  }

  group('ExportBloc', () {
    test('ExportLoaded loads project info and chapter count', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.isLoading, 'isLoading', isFalse)
              .having((s) => s.projectId, 'projectId', projectId)
              .having((s) => s.projectName, 'projectName', '测试小说')
              .having((s) => s.chapterCount, 'chapterCount', 2)
              .having((s) => s.totalWordCount, 'totalWordCount', isPositive),
        ),
      );
    });

    test('ExportFormatSelected updates format and clears preview', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      // First load the project so state has a projectId
      bloc.add(const ExportLoaded(projectId: projectId));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>().having((s) => s.projectId, 'projectId', projectId),
        ),
      );

      // Set up preview content to verify it gets cleared
      bloc.add(const ExportPreviewRequested());
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.previewContent, 'previewContent', isNotNull),
        ),
      );

      bloc.add(const ExportFormatSelected(format: ExportFormat.markdown));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.format, 'format', ExportFormat.markdown)
              .having((s) => s.previewContent, 'previewContent', isNull)
              .having((s) => s.exportResult, 'exportResult', isNull),
        ),
      );
    });

    test('ExportOnlyAcceptedToggled updates onlyAcceptedContent', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>().having((s) => s.projectId, 'projectId', projectId),
        ),
      );

      bloc.add(const ExportOnlyAcceptedToggled(onlyAccepted: false));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having(
                (s) => s.onlyAcceptedContent,
                'onlyAcceptedContent',
                isFalse,
              ),
        ),
      );
    });

    test('ExportIncludeTocToggled updates includeToc', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>().having((s) => s.projectId, 'projectId', projectId),
        ),
      );

      bloc.add(const ExportIncludeTocToggled(includeToc: true));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.includeToc, 'includeToc', isTrue),
        ),
      );
    });

    test('ExportPreviewRequested generates preview content', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>().having((s) => s.projectId, 'projectId', projectId),
        ),
      );

      bloc.add(const ExportPreviewRequested());

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.isLoading, 'isLoading', isFalse)
              .having((s) => s.previewContent, 'previewContent', isNotNull)
              .having(
                (s) => s.previewContent!,
                'previewContent contains chapter',
                contains('初遇'),
              ),
        ),
      );
    });

    test('ExportConfirmed produces export result', () async {
      final bloc = await buildBloc();
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));
      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>().having((s) => s.projectId, 'projectId', projectId),
        ),
      );

      bloc.add(const ExportConfirmed());

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.isExporting, 'isExporting', isFalse)
              .having((s) => s.exportResult, 'exportResult', isNotNull)
              .having(
                (s) => s.exportResult!.chapterCount,
                'chapterCount',
                2,
              )
              .having(
                (s) => s.exportResult!.format,
                'format',
                ExportFormat.txt,
              ),
        ),
      );
    });

    test('ExportLoaded with pending revisions sets showRevisionWarning',
        () async {
      final bloc = await buildBloc(withPendingRevision: true);
      addTearDown(bloc.close);

      bloc.add(const ExportLoaded(projectId: projectId));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<ExportState>()
              .having((s) => s.isLoading, 'isLoading', isFalse)
              .having(
                (s) => s.pendingRevisionCount,
                'pendingRevisionCount',
                greaterThan(0),
              )
              .having(
                (s) => s.showRevisionWarning,
                'showRevisionWarning',
                isTrue,
              ),
        ),
      );
    });
  });
}
