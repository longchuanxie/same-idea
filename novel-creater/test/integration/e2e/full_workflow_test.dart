import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/chapter_repository_impl.dart';
import 'package:novel_creator/data/repositories/outline_node_repository_impl.dart';
import 'package:novel_creator/data/repositories/project_repository_impl.dart';
import 'package:novel_creator/data/repositories/revision_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/export/services/export_service.dart';

void main() {
  late AppDatabase db;
  late ProjectRepositoryImpl projectRepo;
  late ChapterRepositoryImpl chapterRepo;
  late OutlineNodeRepositoryImpl outlineRepo;
  late RevisionRepositoryImpl revisionRepo;
  late ExportService exportService;
  late IdGenerator idGenerator;
  late AppClock clock;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    projectRepo = ProjectRepositoryImpl(db);
    chapterRepo = ChapterRepositoryImpl(db);
    outlineRepo = OutlineNodeRepositoryImpl(db);
    revisionRepo = RevisionRepositoryImpl(db);
    exportService = ExportService(
      projectRepository: projectRepo,
      chapterRepository: chapterRepo,
    );
    idGenerator = const IdGenerator();
    clock = const SystemClock();
  });

  tearDown(() async {
    await db.close();
  });

  group('E2E: Full writing workflow', () {
    test('create project -> add chapters -> edit -> save -> export TXT', () async {
      // Step 1: Create project (same as CreateProjectBloc logic)
      final now = clock.now();
      final projectId = idGenerator.generate();
      final outlineId = idGenerator.generate();
      final chapterId1 = idGenerator.generate();

      final project = Project(
        id: projectId,
        title: 'The Silent Garden',
        author: 'Lin Mo',
        language: 'zh',
        genre: 'Fantasy',
        activeChapterId: chapterId1,
        createdAt: now,
        updatedAt: now,
      );
      final projectResult = await projectRepo.create(project);
      expect(projectResult.isSuccess, isTrue);

      // Step 2: Create outline node
      final outline = OutlineNode(
        id: outlineId,
        projectId: projectId,
        order: 0,
        title: 'Chapter 1',
        linkedChapterId: chapterId1,
        nodeType: OutlineNodeType.chapter,
        status: OutlineNodeStatus.planned,
        createdAt: now,
        updatedAt: now,
      );
      final outlineResult = await outlineRepo.create(outline);
      expect(outlineResult.isSuccess, isTrue);

      // Step 3: Create first chapter
      final chapter1 = Chapter(
        id: chapterId1,
        projectId: projectId,
        title: 'Chapter 1',
        order: 0,
        outlineNodeId: outlineId,
        contentFormat: ContentFormat.markdown,
        status: ChapterStatus.draft,
        createdAt: now,
        updatedAt: now,
      );
      final chapterResult = await chapterRepo.create(chapter1);
      expect(chapterResult.isSuccess, isTrue);

      // Step 4: Add a second chapter
      final chapterId2 = idGenerator.generate();
      final chapter2 = Chapter(
        id: chapterId2,
        projectId: projectId,
        title: 'Chapter 2',
        order: 1,
        contentFormat: ContentFormat.markdown,
        status: ChapterStatus.draft,
        createdAt: now,
        updatedAt: now,
      );
      final chapter2Result = await chapterRepo.create(chapter2);
      expect(chapter2Result.isSuccess, isTrue);

      // Step 5: Write content to chapters (simulate EditorBloc saveContent)
      final saveResult1 = await chapterRepo.saveContent(
        chapterId1,
        'The garden was silent. No birds sang, no wind blew.\nOnly the roses seemed to breathe.',
      );
      expect(saveResult1.isSuccess, isTrue);
      expect(saveResult1.maybeSuccess!.wordCount, greaterThan(0));
      expect(saveResult1.maybeSuccess!.plainTextCache, isNotEmpty);

      final saveResult2 = await chapterRepo.saveContent(
        chapterId2,
        'She opened the gate. The hinges screamed.\n"Welcome back," whispered the roses.',
      );
      expect(saveResult2.isSuccess, isTrue);

      // Step 6: Verify content persisted
      final loadResult = await chapterRepo.getById(chapterId1);
      expect(loadResult.isSuccess, isTrue);
      expect(loadResult.maybeSuccess!.content, contains('The garden was silent'));

      // Step 7: Rename chapter (simulate ChapterTreeBloc rename)
      final renamed = loadResult.maybeSuccess!.copyWith(
        title: 'The Silent Garden',
        updatedAt: clock.now(),
      );
      final renameResult = await chapterRepo.update(renamed);
      expect(renameResult.isSuccess, isTrue);
      expect(renameResult.maybeSuccess!.title, 'The Silent Garden');

      // Step 8: Export TXT
      final txtExport = await exportService.exportProject(
        projectId,
        format: ExportFormat.txt,
      );
      expect(txtExport.isSuccess, isTrue);
      txtExport.when(
        success: (r) {
          expect(r.fileName, endsWith('.txt'));
          expect(r.content, contains('The Silent Garden'));
          expect(r.content, contains('The garden was silent'));
          expect(r.content, contains('Chapter 2'));
          expect(r.content, contains('She opened the gate'));
        },
        failure: (_) => fail('TXT export should succeed'),
      );

      // Step 9: Export Markdown
      final mdExport = await exportService.exportProject(
        projectId,
        format: ExportFormat.markdown,
      );
      expect(mdExport.isSuccess, isTrue);
      mdExport.when(
        success: (r) {
          expect(r.fileName, endsWith('.md'));
          expect(r.content, contains('# The Silent Garden'));
          expect(r.content, contains('## The Silent Garden'));
          expect(r.content, contains('## Chapter 2'));
        },
        failure: (_) => fail('Markdown export should succeed'),
      );

      // Step 10: Export Project Package JSON
      final jsonExport = await exportService.exportProject(
        projectId,
        format: ExportFormat.projectPackage,
      );
      expect(jsonExport.isSuccess, isTrue);
      jsonExport.when(
        success: (r) {
          expect(r.fileName, endsWith('.novel.json'));
          expect(r.content, contains('The Silent Garden'));
          expect(r.content, contains('Lin Mo'));
        },
        failure: (_) => fail('JSON export should succeed'),
      );
    });

    test('chapter status machine works end-to-end', () async {
      final now = clock.now();
      final projectId = idGenerator.generate();
      await projectRepo.create(Project(
        id: projectId,
        title: 'Status Test',
        createdAt: now,
        updatedAt: now,
      ));

      final chapterId = idGenerator.generate();
      await chapterRepo.create(Chapter(
        id: chapterId,
        projectId: projectId,
        title: 'Draft Chapter',
        order: 0,
        createdAt: now,
        updatedAt: now,
      ));

      // draft -> reviewing
      var result = await chapterRepo.getById(chapterId);
      expect(result.maybeSuccess!.status, ChapterStatus.draft);
      expect(ChapterStatus.draft.canTransitionTo(ChapterStatus.reviewing), isTrue);

      await chapterRepo.update(result.maybeSuccess!.copyWith(
        status: ChapterStatus.reviewing,
        updatedAt: clock.now(),
      ));

      // reviewing -> revised
      result = await chapterRepo.getById(chapterId);
      expect(result.maybeSuccess!.status, ChapterStatus.reviewing);
      expect(ChapterStatus.reviewing.canTransitionTo(ChapterStatus.revised), isTrue);

      await chapterRepo.update(result.maybeSuccess!.copyWith(
        status: ChapterStatus.revised,
        updatedAt: clock.now(),
      ));

      // revised -> published
      result = await chapterRepo.getById(chapterId);
      expect(result.maybeSuccess!.status, ChapterStatus.revised);
      expect(ChapterStatus.revised.canTransitionTo(ChapterStatus.published), isTrue);

      await chapterRepo.update(result.maybeSuccess!.copyWith(
        status: ChapterStatus.published,
        updatedAt: clock.now(),
      ));

      result = await chapterRepo.getById(chapterId);
      expect(result.maybeSuccess!.status, ChapterStatus.published);
    });

    test('revision create -> accept flow', () async {
      final now = clock.now();
      final projectId = idGenerator.generate();
      await projectRepo.create(Project(
        id: projectId,
        title: 'Revision Test',
        createdAt: now,
        updatedAt: now,
      ));

      final chapterId = idGenerator.generate();
      await chapterRepo.create(Chapter(
        id: chapterId,
        projectId: projectId,
        title: 'Chapter with Revision',
        order: 0,
        content: 'Original text',
        createdAt: now,
        updatedAt: now,
      ));

      // Agent creates a revision
      final revisionId = idGenerator.generate();
      final revision = Revision(
        id: revisionId,
        projectId: projectId,
        chapterId: chapterId,
        operation: RevisionOperation.replace,
        anchor: RevisionAnchor(type: AnchorType.selection, offset: 0, length: 13),
        beforeText: 'Original text',
        afterText: 'Improved text with better style',
        source: RevisionSource.agent,
        status: RevisionStatus.pending,
        createdAt: now,
        updatedAt: now,
      );

      var revResult = await revisionRepo.create(revision);
      expect(revResult.isSuccess, isTrue);

      // Verify pending revisions
      var pending = await revisionRepo.getPendingByProjectId(projectId);
      expect(pending.isSuccess, isTrue);
      expect(pending.maybeSuccess!.length, 1);
      expect(pending.maybeSuccess!.first.isPending, isTrue);

      // Accept the revision
      final accepted = revision.copyWith(
        status: RevisionStatus.accepted,
        resolvedAt: clock.now(),
        updatedAt: clock.now(),
      );
      await revisionRepo.update(accepted);

      // No more pending revisions
      pending = await revisionRepo.getPendingByProjectId(projectId);
      expect(pending.maybeSuccess!.length, 0);

      // Verify revision is terminal
      final loaded = await revisionRepo.getById(revisionId);
      expect(loaded.maybeSuccess!.isTerminal, isTrue);
      expect(loaded.maybeSuccess!.status, RevisionStatus.accepted);
    });

    test('delete project cascades: project gone, chapters remain (no cascade)', () async {
      final now = clock.now();
      final projectId = idGenerator.generate();
      await projectRepo.create(Project(
        id: projectId,
        title: 'To Delete',
        createdAt: now,
        updatedAt: now,
      ));

      final chapterId = idGenerator.generate();
      await chapterRepo.create(Chapter(
        id: chapterId,
        projectId: projectId,
        title: 'Orphan Chapter',
        order: 0,
        createdAt: now,
        updatedAt: now,
      ));

      // Delete project
      await projectRepo.delete(projectId);

      // Project is gone
      final projectResult = await projectRepo.getById(projectId);
      expect(projectResult.isFailure, isTrue);

      // Chapter still exists in DB (no FK cascade in Drift by default)
      final chapterResult = await chapterRepo.getById(chapterId);
      expect(chapterResult.isSuccess, isTrue);
      expect(chapterResult.maybeSuccess!.projectId, projectId);
    });

    test('word count updates correctly after multiple saves', () async {
      final now = clock.now();
      final projectId = idGenerator.generate();
      await projectRepo.create(Project(
        id: projectId,
        title: 'Word Count Test',
        createdAt: now,
        updatedAt: now,
      ));

      final chapterId = idGenerator.generate();
      await chapterRepo.create(Chapter(
        id: chapterId,
        projectId: projectId,
        title: 'Chapter',
        order: 0,
        createdAt: now,
        updatedAt: now,
      ));

      // Save short content
      var result = await chapterRepo.saveContent(chapterId, 'Hello');
      expect(result.maybeSuccess!.wordCount, greaterThan(0));
      final firstCount = result.maybeSuccess!.wordCount;

      // Save longer content
      result = await chapterRepo.saveContent(
        chapterId,
        'Hello world, this is a much longer piece of text for testing word counts.',
      );
      expect(result.maybeSuccess!.wordCount, greaterThan(firstCount));

      // Verify effectiveWordCount uses plainTextCache
      final loaded = await chapterRepo.getById(chapterId);
      expect(loaded.maybeSuccess!.effectiveWordCount, greaterThan(0));
    });
  });
}
