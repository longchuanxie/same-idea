// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'agent_task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AgentTaskImpl _$$AgentTaskImplFromJson(Map<String, dynamic> json) =>
    _$AgentTaskImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      taskType: json['taskType'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      status: $enumDecodeNullable(_$AgentTaskStatusEnumMap, json['status']) ??
          AgentTaskStatus.created,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
      chapterId: json['chapterId'] as String?,
      instruction: json['instruction'] as String?,
      result: json['result'] as String?,
      errorMessage: json['errorMessage'] as String?,
    );

Map<String, dynamic> _$$AgentTaskImplToJson(_$AgentTaskImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'taskType': instance.taskType,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'status': _$AgentTaskStatusEnumMap[instance.status]!,
      'schemaVersion': instance.schemaVersion,
      'chapterId': instance.chapterId,
      'instruction': instance.instruction,
      'result': instance.result,
      'errorMessage': instance.errorMessage,
    };

const _$AgentTaskStatusEnumMap = {
  AgentTaskStatus.created: 'created',
  AgentTaskStatus.queued: 'queued',
  AgentTaskStatus.running: 'running',
  AgentTaskStatus.succeeded: 'succeeded',
  AgentTaskStatus.failed: 'failed',
  AgentTaskStatus.cancelled: 'cancelled',
};
