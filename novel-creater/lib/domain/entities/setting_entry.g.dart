// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'setting_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SettingEntryImpl _$$SettingEntryImplFromJson(Map<String, dynamic> json) =>
    _$SettingEntryImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      category: json['category'] as String,
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      content: json['content'] as String? ?? '',
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$SettingEntryImplToJson(_$SettingEntryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'category': instance.category,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'content': instance.content,
      'tags': instance.tags,
      'schemaVersion': instance.schemaVersion,
    };
