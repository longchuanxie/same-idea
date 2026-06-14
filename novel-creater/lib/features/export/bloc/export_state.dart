import 'package:equatable/equatable.dart';
import 'package:novel_creator/domain/entities/export_config.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/services/export_service.dart';

class ExportState extends Equatable {
  const ExportState({
    this.projectId = '',
    this.projectName = '',
    this.format = ExportFormat.txt,
    this.onlyAcceptedContent = true,
    this.includeToc = false,
    this.author = '',
    this.isLoading = false,
    this.isExporting = false,
    this.pendingRevisionCount = 0,
    this.chapterCount = 0,
    this.totalWordCount = 0,
    this.previewContent,
    this.exportResult,
    this.showRevisionWarning = false,
    this.error,
  });

  final String projectId;
  final String projectName;
  final ExportFormat format;
  final bool onlyAcceptedContent;
  final bool includeToc;
  final String author;
  final bool isLoading;
  final bool isExporting;
  final int pendingRevisionCount;
  final int chapterCount;
  final int totalWordCount;
  final String? previewContent;
  final ExportResult? exportResult;
  final bool showRevisionWarning;
  final AppError? error;

  ExportConfig get config => ExportConfig(
        projectId: projectId,
        format: format,
        onlyAcceptedContent: onlyAcceptedContent,
        includeToc: includeToc,
        author: author.isEmpty ? null : author,
        titleOverride: projectName,
      );

  bool get hasPendingRevisions => pendingRevisionCount > 0;

  ExportState copyWith({
    String? projectId,
    String? projectName,
    ExportFormat? format,
    bool? onlyAcceptedContent,
    bool? includeToc,
    String? author,
    bool? isLoading,
    bool? isExporting,
    int? pendingRevisionCount,
    int? chapterCount,
    int? totalWordCount,
    String? previewContent,
    ExportResult? exportResult,
    bool? showRevisionWarning,
    AppError? error,
    bool clearError = false,
    bool clearPreview = false,
    bool clearExportResult = false,
  }) {
    return ExportState(
      projectId: projectId ?? this.projectId,
      projectName: projectName ?? this.projectName,
      format: format ?? this.format,
      onlyAcceptedContent: onlyAcceptedContent ?? this.onlyAcceptedContent,
      includeToc: includeToc ?? this.includeToc,
      author: author ?? this.author,
      isLoading: isLoading ?? this.isLoading,
      isExporting: isExporting ?? this.isExporting,
      pendingRevisionCount: pendingRevisionCount ?? this.pendingRevisionCount,
      chapterCount: chapterCount ?? this.chapterCount,
      totalWordCount: totalWordCount ?? this.totalWordCount,
      previewContent: clearPreview ? null : (previewContent ?? this.previewContent),
      exportResult: clearExportResult ? null : (exportResult ?? this.exportResult),
      showRevisionWarning: showRevisionWarning ?? this.showRevisionWarning,
      error: clearError ? null : (error ?? this.error),
    );
  }

  @override
  List<Object?> get props => [
        projectId,
        projectName,
        format,
        onlyAcceptedContent,
        includeToc,
        author,
        isLoading,
        isExporting,
        pendingRevisionCount,
        chapterCount,
        totalWordCount,
        previewContent,
        exportResult,
        showRevisionWarning,
        error,
      ];
}
