// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NoteImpl _$$NoteImplFromJson(Map<String, dynamic> json) => _$NoteImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category: $enumDecodeNullable(_$NoteCategoryEnumMap, json['category']) ??
          NoteCategory.misc,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$NoteImplToJson(_$NoteImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'content': instance.content,
      'category': _$NoteCategoryEnumMap[instance.category]!,
      'tags': instance.tags,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };

const _$NoteCategoryEnumMap = {
  NoteCategory.plot: 'plot',
  NoteCategory.character: 'character',
  NoteCategory.worldbuilding: 'worldbuilding',
  NoteCategory.research: 'research',
  NoteCategory.idea: 'idea',
  NoteCategory.decision: 'decision',
  NoteCategory.issue: 'issue',
  NoteCategory.misc: 'misc',
};
