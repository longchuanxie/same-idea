// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'outline_node.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OutlineNodeImpl _$$OutlineNodeImplFromJson(Map<String, dynamic> json) =>
    _$OutlineNodeImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      summary: json['summary'] as String? ?? '',
      chapterId: json['chapterId'] as String? ?? '',
      parentId: json['parentId'] as String? ?? '',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$OutlineNodeImplToJson(_$OutlineNodeImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'summary': instance.summary,
      'chapterId': instance.chapterId,
      'parentId': instance.parentId,
      'sortOrder': instance.sortOrder,
      'tags': instance.tags,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };
