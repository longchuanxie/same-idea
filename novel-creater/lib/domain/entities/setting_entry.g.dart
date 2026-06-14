// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'setting_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SettingEntryImpl _$$SettingEntryImplFromJson(Map<String, dynamic> json) =>
    _$SettingEntryImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      category:
          $enumDecodeNullable(_$SettingCategoryEnumMap, json['category']) ??
              SettingCategory.other,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$SettingEntryImplToJson(_$SettingEntryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'content': instance.content,
      'category': _$SettingCategoryEnumMap[instance.category]!,
      'tags': instance.tags,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };

const _$SettingCategoryEnumMap = {
  SettingCategory.geography: 'geography',
  SettingCategory.history: 'history',
  SettingCategory.magicSystem: 'magicSystem',
  SettingCategory.politics: 'politics',
  SettingCategory.culture: 'culture',
  SettingCategory.technology: 'technology',
  SettingCategory.organization: 'organization',
  SettingCategory.items: 'items',
  SettingCategory.other: 'other',
};
