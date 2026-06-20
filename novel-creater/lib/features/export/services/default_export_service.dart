import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/export_config.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/services/export_service.dart';

/// Default implementation of [ExportService].
///
/// Supports TXT and Markdown formats. Higher formats (EPUB, PDF, DOCX)
/// are deferred to later milestones.
final class DefaultExportService implements ExportService {
  const DefaultExportService({
    required ProjectRepository projectRepository,
    required ChapterRepository chapterRepository,
    required RevisionRepository revisionRepository,
  })  : _projectRepository = projectRepository,
        _chapterRepository = chapterRepository,
        _revisionRepository = revisionRepository;

  final ProjectRepository _projectRepository;
  final ChapterRepository _chapterRepository;
  final RevisionRepository _revisionRepository;

  @override
  Future<AppResult<ExportResult>> export(ExportConfig config) async {
    if (!config.format.isImplemented) {
      return AppResult<ExportResult>.failure(const AppError(
        code: 'export.format_not_supported',
        message: 'Export format is not yet implemented.',
        userMessage: '该导出格式暂未实现。',
        source: AppErrorSource.export,
        recoverable: false,
        suggestedAction: '请选择 TXT 或 Markdown 格式。',
      ));
    }

    // Load project
    final projectResult = await _projectRepository.get(config.projectId);
    if (projectResult.isFailure) {
      return AppResult<ExportResult>.failure(projectResult.errorOrNull!);
    }
    final project = projectResult.valueOrNull;
    if (project == null) {
      return AppResult<ExportResult>.failure(const AppError(
        code: 'export.project_not_found',
        message: 'Project not found.',
        userMessage: '未找到项目。',
        source: AppErrorSource.export,
        recoverable: true,
      ));
    }

    // Load chapters
    final chaptersResult = await _chapterRepository.list(config.projectId);
    if (chaptersResult.isFailure) {
      return AppResult<ExportResult>.failure(chaptersResult.errorOrNull!);
    }
    final chapters = chaptersResult.valueOrNull!;

    if (chapters.isEmpty) {
      return AppResult<ExportResult>.failure(const AppError(
        code: 'export.no_content',
        message: 'Project has no chapters to export.',
        userMessage: '项目没有可导出的章节。',
        source: AppErrorSource.export,
        recoverable: true,
        suggestedAction: '请先创建至少一个章节。',
      ));
    }

    // Check for pending revisions if only exporting accepted content
    int pendingRevisionCount = 0;
    if (config.onlyAcceptedContent) {
      for (final chapter in chapters) {
        final pendingResult =
            await _revisionRepository.listPending(chapter.id);
        if (pendingResult.isSuccess) {
          pendingRevisionCount += pendingResult.valueOrNull!.length;
        }
      }
    }

    // Build content
    final content = _buildContent(config, chapters);
    final totalWordCount = chapters.fold<int>(
      0,
      (sum, ch) => sum + ch.effectiveWordCount,
    );

    return AppResult<ExportResult>.success(ExportResult(
      content: content,
      format: config.format,
      chapterCount: chapters.length,
      totalWordCount: totalWordCount,
      fileName: config.titleOverride ?? project.name,
    ));
  }

  String _buildContent(ExportConfig config, List<Chapter> chapters) {
    return switch (config.format) {
      ExportFormat.txt => _buildTxt(config, chapters),
      ExportFormat.markdown => _buildMarkdown(config, chapters),
      _ => '', // unreachable due to isImplemented check
    };
  }

  String _buildTxt(ExportConfig config, List<Chapter> chapters) {
    final buffer = StringBuffer();

    // Title
    final title = config.titleOverride ?? '';
    if (title.isNotEmpty) {
      buffer.writeln(title);
      buffer.writeln();
    }

    if (config.includeToc) {
      buffer.writeln('目录');
      buffer.writeln('─' * 30);
      for (var i = 0; i < chapters.length; i++) {
        buffer.writeln('${i + 1}. ${chapters[i].title}');
      }
      buffer.writeln();
    }

    for (var i = 0; i < chapters.length; i++) {
      final chapter = chapters[i];
      buffer.writeln('第${i + 1}章 ${chapter.title}');
      buffer.writeln('─' * 30);
      buffer.writeln(chapter.plainTextCache);
      buffer.writeln();
    }

    return buffer.toString();
  }

  String _buildMarkdown(ExportConfig config, List<Chapter> chapters) {
    final buffer = StringBuffer();

    // Title
    final title = config.titleOverride ?? '';
    if (title.isNotEmpty) {
      buffer.writeln('# $title');
      buffer.writeln();
    }

    // Metadata
    if (config.author != null && config.author!.isNotEmpty) {
      buffer.writeln('> 作者：${config.author}');
      buffer.writeln();
    }

    if (config.includeToc) {
      buffer.writeln('## 目录');
      buffer.writeln();
      for (var i = 0; i < chapters.length; i++) {
        buffer.writeln('${i + 1}. [${chapters[i].title}](#第${i + 1}章-${chapters[i].title})');
      }
      buffer.writeln();
    }

    for (var i = 0; i < chapters.length; i++) {
      final chapter = chapters[i];
      buffer.writeln('## 第${i + 1}章 ${chapter.title}');
      buffer.writeln();
      buffer.writeln(chapter.markdownContent);
      buffer.writeln();
    }

    return buffer.toString();
  }
}
