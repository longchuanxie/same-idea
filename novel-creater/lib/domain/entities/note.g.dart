// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NoteImpl _$$NoteImplFromJson(Map<String, dynamic> json) => _$NoteImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      content: json['content'] as String? ?? '',
      type:
          $enumDecodeNullable(_$NoteTypeEnumMap, json['type']) ?? NoteType.idea,
      sourceUrl: json['sourceUrl'] as String?,
      agentTaskId: json['agentTaskId'] as String?,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$NoteImplToJson(_$NoteImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'content': instance.content,
      'type': _$NoteTypeEnumMap[instance.type]!,
      'sourceUrl': instance.sourceUrl,
      'agentTaskId': instance.agentTaskId,
      'tags': instance.tags,
      'schemaVersion': instance.schemaVersion,
    };

const _$NoteTypeEnumMap = {
  NoteType.idea: 'idea',
  NoteType.research: 'research',
  NoteType.decision: 'decision',
  NoteType.issue: 'issue',
};
