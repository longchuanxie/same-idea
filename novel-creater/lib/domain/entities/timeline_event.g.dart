// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'timeline_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TimelineEventImpl _$$TimelineEventImplFromJson(Map<String, dynamic> json) =>
    _$TimelineEventImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      characterId: json['characterId'] as String,
      chapterId: json['chapterId'] as String,
      description: json['description'] as String,
      chapterOrder: (json['chapterOrder'] as num?)?.toInt() ?? 0,
      eventType: json['eventType'] as String? ?? '',
      relatedCharacterIds: (json['relatedCharacterIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$TimelineEventImplToJson(_$TimelineEventImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'characterId': instance.characterId,
      'chapterId': instance.chapterId,
      'description': instance.description,
      'chapterOrder': instance.chapterOrder,
      'eventType': instance.eventType,
      'relatedCharacterIds': instance.relatedCharacterIds,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };
