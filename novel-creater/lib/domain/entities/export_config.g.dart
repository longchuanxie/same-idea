// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'export_config.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ExportConfigImpl _$$ExportConfigImplFromJson(Map<String, dynamic> json) =>
    _$ExportConfigImpl(
      projectId: json['projectId'] as String,
      format: $enumDecode(_$ExportFormatEnumMap, json['format']),
      onlyAcceptedContent: json['onlyAcceptedContent'] as bool? ?? true,
      includeToc: json['includeToc'] as bool? ?? false,
      author: json['author'] as String?,
      titleOverride: json['titleOverride'] as String?,
      language: json['language'] as String? ?? 'zh-CN',
    );

Map<String, dynamic> _$$ExportConfigImplToJson(_$ExportConfigImpl instance) =>
    <String, dynamic>{
      'projectId': instance.projectId,
      'format': _$ExportFormatEnumMap[instance.format]!,
      'onlyAcceptedContent': instance.onlyAcceptedContent,
      'includeToc': instance.includeToc,
      'author': instance.author,
      'titleOverride': instance.titleOverride,
      'language': instance.language,
    };

const _$ExportFormatEnumMap = {
  ExportFormat.txt: 'txt',
  ExportFormat.markdown: 'markdown',
  ExportFormat.epub: 'epub',
  ExportFormat.pdf: 'pdf',
  ExportFormat.docx: 'docx',
  ExportFormat.projectPackage: 'projectPackage',
};
