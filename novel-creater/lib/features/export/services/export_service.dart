import 'dart:convert';
import 'package:novel_creator/domain/domain.dart';

enum ExportFormat { txt, markdown, projectPackage }

class ExportResult {
  const ExportResult({
    required this.content,
    required this.format,
    required this.fileName,
  });

  final String content;
  final ExportFormat format;
  final String fileName;
}

class ExportService {
  ExportService({
    required ProjectRepository projectRepository,
    required ChapterRepository chapterRepository,
  })  : _projectRepository = projectRepository,
        _chapterRepository = chapterRepository;

  final ProjectRepository _projectRepository;
  final ChapterRepository _chapterRepository;

  Future<AppResult<ExportResult>> exportProject(
    String projectId, {
    ExportFormat format = ExportFormat.markdown,
  }) async {
    final projectResult = await _projectRepository.getById(projectId);
    if (projectResult.isFailure) {
      return AppResult.failure(projectResult.maybeFailure!);
    }
    final project = projectResult.maybeSuccess!;

    final chaptersResult = await _chapterRepository.getByProjectId(projectId);
    if (chaptersResult.isFailure) {
      return AppResult.failure(chaptersResult.maybeFailure!);
    }
    final chapters = chaptersResult.maybeSuccess!
      ..sort((a, b) => a.order.compareTo(b.order));

    return switch (format) {
      ExportFormat.txt => AppResult.success(_exportTxt(project, chapters)),
      ExportFormat.markdown =>
        AppResult.success(_exportMarkdown(project, chapters)),
      ExportFormat.projectPackage =>
        AppResult.success(_exportProjectPackage(project, chapters)),
    };
  }

  ExportResult _exportTxt(Project project, List<Chapter> chapters) {
    final buffer = StringBuffer()
      ..writeln(project.title)
      ..writeln('=' * project.title.length * 2)
      ..writeln();
    if (project.author.isNotEmpty) {
      buffer
        ..writeln('Author: ${project.author}')
        ..writeln();
    }
    for (final chapter in chapters) {
      buffer
        ..writeln(chapter.title)
        ..writeln('-' * chapter.title.length)
        ..writeln()
        ..writeln(chapter.content)
        ..writeln();
    }
    return ExportResult(
      content: buffer.toString(),
      format: ExportFormat.txt,
      fileName: '${_sanitizeFileName(project.title)}.txt',
    );
  }

  ExportResult _exportMarkdown(Project project, List<Chapter> chapters) {
    final buffer = StringBuffer()
      ..writeln('# ${project.title}')
      ..writeln();
    if (project.author.isNotEmpty) {
      buffer
        ..writeln('> ${project.author}')
        ..writeln();
    }
    if (project.description.isNotEmpty) {
      buffer
        ..writeln(project.description)
        ..writeln();
    }
    for (final chapter in chapters) {
      buffer
        ..writeln('## ${chapter.title}')
        ..writeln()
        ..writeln(chapter.content)
        ..writeln();
    }
    return ExportResult(
      content: buffer.toString(),
      format: ExportFormat.markdown,
      fileName: '${_sanitizeFileName(project.title)}.md',
    );
  }

  ExportResult _exportProjectPackage(Project project, List<Chapter> chapters) {
    final package = {
      'schemaVersion': 1,
      'exportedAt': DateTime.now().toIso8601String(),
      'project': project.toJson(),
      'chapters': chapters.map((c) => c.toJson()).toList(),
    };
    return ExportResult(
      content: const JsonEncoder.withIndent('  ').convert(package),
      format: ExportFormat.projectPackage,
      fileName: '${_sanitizeFileName(project.title)}.novel.json',
    );
  }

  String _sanitizeFileName(String name) =>
      name.replaceAll(RegExp(r'[<>:"/\\|?*]'), '_').trim();
}
