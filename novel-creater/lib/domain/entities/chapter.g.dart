// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chapter.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChapterImpl _$$ChapterImplFromJson(Map<String, dynamic> json) =>
    _$ChapterImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      order: (json['order'] as num).toInt(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      outlineNodeId: json['outlineNodeId'] as String?,
      contentFormat:
          $enumDecodeNullable(_$ContentFormatEnumMap, json['contentFormat']) ??
              ContentFormat.markdown,
      content: json['content'] as String? ?? '',
      plainTextCache: json['plainTextCache'] as String? ?? '',
      wordCount: (json['wordCount'] as num?)?.toInt() ?? 0,
      status: $enumDecodeNullable(_$ChapterStatusEnumMap, json['status']) ??
          ChapterStatus.draft,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$ChapterImplToJson(_$ChapterImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'order': instance.order,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'outlineNodeId': instance.outlineNodeId,
      'contentFormat': _$ContentFormatEnumMap[instance.contentFormat]!,
      'content': instance.content,
      'plainTextCache': instance.plainTextCache,
      'wordCount': instance.wordCount,
      'status': _$ChapterStatusEnumMap[instance.status]!,
      'schemaVersion': instance.schemaVersion,
    };

const _$ContentFormatEnumMap = {
  ContentFormat.markdown: 'markdown',
  ContentFormat.delta: 'delta',
  ContentFormat.html: 'html',
};

const _$ChapterStatusEnumMap = {
  ChapterStatus.draft: 'draft',
  ChapterStatus.reviewing: 'reviewing',
  ChapterStatus.revised: 'revised',
  ChapterStatus.locked: 'locked',
  ChapterStatus.published: 'published',
};
