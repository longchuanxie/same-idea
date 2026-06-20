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
      markdownContent: json['markdownContent'] as String,
      plainTextCache: json['plainTextCache'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      status: $enumDecodeNullable(_$ChapterStatusEnumMap, json['status']) ??
          ChapterStatus.draft,
      wordCount: (json['wordCount'] as num?)?.toInt() ?? 0,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$ChapterImplToJson(_$ChapterImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'markdownContent': instance.markdownContent,
      'plainTextCache': instance.plainTextCache,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'status': _$ChapterStatusEnumMap[instance.status]!,
      'wordCount': instance.wordCount,
      'schemaVersion': instance.schemaVersion,
    };

const _$ChapterStatusEnumMap = {
  ChapterStatus.draft: 'draft',
  ChapterStatus.reviewing: 'reviewing',
  ChapterStatus.revised: 'revised',
  ChapterStatus.published: 'published',
  ChapterStatus.locked: 'locked',
};
