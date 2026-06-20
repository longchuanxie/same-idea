import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_chapter_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_project_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_revision_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/export_config.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/features/export/services/default_export_service.dart';

void main() {
  late InMemoryProjectRepository projectRepository;
  late InMemoryChapterRepository chapterRepository;
  late InMemoryRevisionRepository revisionRepository;
  late DefaultExportService service;

  const projectId = 'test-project';

  setUp(() async {
    projectRepository = InMemoryProjectRepository();
    chapterRepository = InMemoryChapterRepository();
    revisionRepository = InMemoryRevisionRepository();
    service = DefaultExportService(
      projectRepository: projectRepository,
      chapterRepository: chapterRepository,
      revisionRepository: revisionRepository,
    );

    final now = DateTime.utc(2026);
    await projectRepository.create(Project(
      id: projectId,
      name: '测试小说',
      createdAt: now,
      updatedAt: now,
    ));
  });

  Future<void> addChapter({
    required String id,
    required String title,
    required String markdownContent,
    required String plainTextCache,
  }) async {
    final now = DateTime.utc(2026);
    await chapterRepository.create(Chapter(
      id: id,
      projectId: projectId,
      title: title,
      markdownContent: markdownContent,
      plainTextCache: plainTextCache,
      createdAt: now,
      updatedAt: now,
    ));
  }

  group('DefaultExportService', () {
    test('TXT export produces plain text with chapter titles and content',
        () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '那是一个雨夜。',
        plainTextCache: '那是一个雨夜。',
      );
      await addChapter(
        id: 'ch2',
        title: '重逢',
        markdownContent: '多年以后。',
        plainTextCache: '多年以后。',
      );

      final config = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
        titleOverride: '测试小说',
      );
      final result = await service.export(config);

      expect(result.isSuccess, isTrue);
      final exportResult = result.valueOrNull!;
      expect(exportResult.format, ExportFormat.txt);
      expect(exportResult.chapterCount, 2);
      expect(exportResult.content, contains('测试小说'));
      expect(exportResult.content, contains('第1章 初遇'));
      expect(exportResult.content, contains('那是一个雨夜。'));
      expect(exportResult.content, contains('第2章 重逢'));
      expect(exportResult.content, contains('多年以后。'));
    });

    test('Markdown export produces markdown with headers and content', () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '那是一个**雨夜**。',
        plainTextCache: '那是一个雨夜。',
      );

      final config = ExportConfig(
        projectId: projectId,
        format: ExportFormat.markdown,
        titleOverride: '测试小说',
      );
      final result = await service.export(config);

      expect(result.isSuccess, isTrue);
      final exportResult = result.valueOrNull!;
      expect(exportResult.format, ExportFormat.markdown);
      expect(exportResult.content, contains('# 测试小说'));
      expect(exportResult.content, contains('## 第1章 初遇'));
      expect(exportResult.content, contains('那是一个**雨夜**。'));
    });

    test('Export with includeToc generates table of contents', () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '内容一',
        plainTextCache: '内容一',
      );
      await addChapter(
        id: 'ch2',
        title: '重逢',
        markdownContent: '内容二',
        plainTextCache: '内容二',
      );

      // TXT with TOC
      final txtConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
        includeToc: true,
        titleOverride: '测试小说',
      );
      final txtResult = await service.export(txtConfig);
      expect(txtResult.isSuccess, isTrue);
      final txtContent = txtResult.valueOrNull!.content;
      expect(txtContent, contains('目录'));
      expect(txtContent, contains('1. 初遇'));
      expect(txtContent, contains('2. 重逢'));

      // Markdown with TOC
      final mdConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.markdown,
        includeToc: true,
        titleOverride: '测试小说',
      );
      final mdResult = await service.export(mdConfig);
      expect(mdResult.isSuccess, isTrue);
      final mdContent = mdResult.valueOrNull!.content;
      expect(mdContent, contains('## 目录'));
      expect(mdContent, contains('[初遇]'));
      expect(mdContent, contains('[重逢]'));
    });

    test('Export with author includes author metadata (Markdown only)',
        () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '内容',
        plainTextCache: '内容',
      );

      // Markdown with author
      final mdConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.markdown,
        author: '张三',
        titleOverride: '测试小说',
      );
      final mdResult = await service.export(mdConfig);
      expect(mdResult.isSuccess, isTrue);
      expect(mdResult.valueOrNull!.content, contains('> 作者：张三'));

      // TXT with author — should NOT include author metadata
      final txtConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
        author: '张三',
        titleOverride: '测试小说',
      );
      final txtResult = await service.export(txtConfig);
      expect(txtResult.isSuccess, isTrue);
      expect(txtResult.valueOrNull!.content, isNot(contains('作者')));
    });

    test('Export with no chapters returns export.no_content failure', () async {
      final config = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
      );
      final result = await service.export(config);

      expect(result.isFailure, isTrue);
      final error = result.errorOrNull!;
      expect(error.code, 'export.no_content');
      expect(error.source.name, 'export');
    });

    test('Export with unsupported format returns export.format_not_supported failure',
        () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '内容',
        plainTextCache: '内容',
      );

      final config = ExportConfig(
        projectId: projectId,
        format: ExportFormat.epub,
      );
      final result = await service.export(config);

      expect(result.isFailure, isTrue);
      final error = result.errorOrNull!;
      expect(error.code, 'export.format_not_supported');
      expect(error.source.name, 'export');
    });

    test('Export with missing project returns export.project_not_found failure',
        () async {
      final config = ExportConfig(
        projectId: 'nonexistent-project',
        format: ExportFormat.txt,
      );
      final result = await service.export(config);

      expect(result.isFailure, isTrue);
      final error = result.errorOrNull!;
      expect(error.code, 'export.project_not_found');
      expect(error.source.name, 'export');
    });

    test('TXT export includes title header when titleOverride is set',
        () async {
      await addChapter(
        id: 'ch1',
        title: '初遇',
        markdownContent: '内容',
        plainTextCache: '内容',
      );

      // With titleOverride
      final withTitleConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
        titleOverride: '自定义书名',
      );
      final withTitleResult = await service.export(withTitleConfig);
      expect(withTitleResult.isSuccess, isTrue);
      expect(withTitleResult.valueOrNull!.content, contains('自定义书名'));
      expect(withTitleResult.valueOrNull!.fileName, '自定义书名');

      // Without titleOverride — no title header in TXT
      final noTitleConfig = ExportConfig(
        projectId: projectId,
        format: ExportFormat.txt,
      );
      final noTitleResult = await service.export(noTitleConfig);
      expect(noTitleResult.isSuccess, isTrue);
      // When no titleOverride, title is empty string, so no title header
      expect(noTitleResult.valueOrNull!.fileName, '测试小说');
    });
  });
}
