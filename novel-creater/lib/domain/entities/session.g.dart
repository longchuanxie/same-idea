// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SessionImpl _$$SessionImplFromJson(Map<String, dynamic> json) =>
    _$SessionImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      status: $enumDecodeNullable(_$SessionStatusEnumMap, json['status']) ??
          SessionStatus.active,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
      chapterId: json['chapterId'] as String?,
      agentMode: json['agentMode'] as String?,
      summary: json['summary'] as String?,
      startedAt: json['startedAt'] == null
          ? null
          : DateTime.parse(json['startedAt'] as String),
      endedAt: json['endedAt'] == null
          ? null
          : DateTime.parse(json['endedAt'] as String),
    );

Map<String, dynamic> _$$SessionImplToJson(_$SessionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'status': _$SessionStatusEnumMap[instance.status]!,
      'schemaVersion': instance.schemaVersion,
      'chapterId': instance.chapterId,
      'agentMode': instance.agentMode,
      'summary': instance.summary,
      'startedAt': instance.startedAt?.toIso8601String(),
      'endedAt': instance.endedAt?.toIso8601String(),
    };

const _$SessionStatusEnumMap = {
  SessionStatus.active: 'active',
  SessionStatus.paused: 'paused',
  SessionStatus.completed: 'completed',
  SessionStatus.archived: 'archived',
};
