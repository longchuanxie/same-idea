import 'package:novel_creator/domain/entities/export_config.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/results/app_result.dart';

/// Result of an export operation.
final class ExportResult {
  const ExportResult({
    required this.content,
    required this.format,
    required this.chapterCount,
    required this.totalWordCount,
    this.fileName,
  });

  /// The exported content as a string.
  final String content;

  /// The format used for export.
  final ExportFormat format;

  /// Number of chapters included.
  final int chapterCount;

  /// Total word count of exported content.
  final int totalWordCount;

  /// Suggested file name (without extension).
  final String? fileName;
}

/// Service interface for exporting project content.
///
/// Implementations must NOT modify project content.
/// When pending revisions exist, the caller is responsible for
/// prompting the user; the service respects [ExportConfig.onlyAcceptedContent].
abstract interface class ExportService {
  /// Exports the project content according to [config].
  ///
  /// Returns [AppResult.failure] with code `export.no_content` if the project
  /// has no chapters, or `export.format_not_supported` if the format is not
  /// implemented.
  Future<AppResult<ExportResult>> export(ExportConfig config);
}
