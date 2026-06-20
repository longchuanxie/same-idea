import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/export_format.dart';

part 'export_config.freezed.dart';
part 'export_config.g.dart';

/// Configuration for an export operation.
@freezed
class ExportConfig with _$ExportConfig {
  const factory ExportConfig({
    required String projectId,
    required ExportFormat format,
    /// Whether to include only accepted content (default: true).
    /// When false, pending revisions are included as well.
    @Default(true) bool onlyAcceptedContent,
    /// Whether to include a table of contents.
    @Default(false) bool includeToc,
    /// Author name for metadata.
    String? author,
    /// Book title override. Defaults to project name.
    String? titleOverride,
    /// Language code (e.g. 'zh-CN').
    @Default('zh-CN') String language,
  }) = _ExportConfig;

  const ExportConfig._();

  factory ExportConfig.fromJson(Map<String, dynamic> json) =>
      _$ExportConfigFromJson(json);
}
