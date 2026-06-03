// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SessionMessageImpl _$$SessionMessageImplFromJson(Map<String, dynamic> json) =>
    _$SessionMessageImpl(
      id: json['id'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      agentTaskId: json['agentTaskId'] as String?,
    );

Map<String, dynamic> _$$SessionMessageImplToJson(
        _$SessionMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'role': instance.role,
      'content': instance.content,
      'createdAt': instance.createdAt?.toIso8601String(),
      'agentTaskId': instance.agentTaskId,
    };

_$SessionImpl _$$SessionImplFromJson(Map<String, dynamic> json) =>
    _$SessionImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      stage: $enumDecodeNullable(_$SessionStageEnumMap, json['stage']) ??
          SessionStage.writing,
      parentSessionId: json['parentSessionId'] as String?,
      branchName: json['branchName'] as String?,
      messages: (json['messages'] as List<dynamic>?)
              ?.map((e) => SessionMessage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      contextSnapshotId: json['contextSnapshotId'] as String?,
      archived: json['archived'] as bool? ?? false,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$SessionImplToJson(_$SessionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'stage': _$SessionStageEnumMap[instance.stage]!,
      'parentSessionId': instance.parentSessionId,
      'branchName': instance.branchName,
      'messages': instance.messages,
      'contextSnapshotId': instance.contextSnapshotId,
      'archived': instance.archived,
      'schemaVersion': instance.schemaVersion,
    };

const _$SessionStageEnumMap = {
  SessionStage.brainstorm: 'brainstorm',
  SessionStage.research: 'research',
  SessionStage.outline: 'outline',
  SessionStage.writing: 'writing',
  SessionStage.polish: 'polish',
  SessionStage.custom: 'custom',
};
