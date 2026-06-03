// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'project.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProjectImpl _$$ProjectImplFromJson(Map<String, dynamic> json) =>
    _$ProjectImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      author: json['author'] as String? ?? '',
      description: json['description'] as String? ?? '',
      language: json['language'] as String? ?? 'zh',
      genre: json['genre'] as String? ?? '',
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      defaultStyleProfileId: json['defaultStyleProfileId'] as String?,
      activeChapterId: json['activeChapterId'] as String?,
      localEncryptionEnabled: json['localEncryptionEnabled'] as bool? ?? false,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$ProjectImplToJson(_$ProjectImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'author': instance.author,
      'description': instance.description,
      'language': instance.language,
      'genre': instance.genre,
      'tags': instance.tags,
      'defaultStyleProfileId': instance.defaultStyleProfileId,
      'activeChapterId': instance.activeChapterId,
      'localEncryptionEnabled': instance.localEncryptionEnabled,
      'schemaVersion': instance.schemaVersion,
    };
