// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'agent_task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TokenUsageImpl _$$TokenUsageImplFromJson(Map<String, dynamic> json) =>
    _$TokenUsageImpl(
      promptTokens: (json['promptTokens'] as num?)?.toInt() ?? 0,
      completionTokens: (json['completionTokens'] as num?)?.toInt() ?? 0,
      isEstimated: json['isEstimated'] as bool? ?? false,
    );

Map<String, dynamic> _$$TokenUsageImplToJson(_$TokenUsageImpl instance) =>
    <String, dynamic>{
      'promptTokens': instance.promptTokens,
      'completionTokens': instance.completionTokens,
      'isEstimated': instance.isEstimated,
    };

_$AgentTaskImpl _$$AgentTaskImplFromJson(Map<String, dynamic> json) =>
    _$AgentTaskImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      taskType: $enumDecode(_$AgentTaskTypeEnumMap, json['taskType']),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      status: $enumDecodeNullable(_$AgentTaskStatusEnumMap, json['status']) ??
          AgentTaskStatus.created,
      inputJson: json['inputJson'] as String? ?? '',
      outputJson: json['outputJson'] as String? ?? '',
      model: json['model'] as String?,
      tokenUsage: json['tokenUsage'] == null
          ? null
          : TokenUsage.fromJson(json['tokenUsage'] as Map<String, dynamic>),
      error: json['error'] as String?,
      sideEffects: (json['sideEffects'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      startedAt: json['startedAt'] == null
          ? null
          : DateTime.parse(json['startedAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$AgentTaskImplToJson(_$AgentTaskImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'taskType': _$AgentTaskTypeEnumMap[instance.taskType]!,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'status': _$AgentTaskStatusEnumMap[instance.status]!,
      'inputJson': instance.inputJson,
      'outputJson': instance.outputJson,
      'model': instance.model,
      'tokenUsage': instance.tokenUsage,
      'error': instance.error,
      'sideEffects': instance.sideEffects,
      'startedAt': instance.startedAt?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };

const _$AgentTaskTypeEnumMap = {
  AgentTaskType.write: 'write',
  AgentTaskType.continueWrite: 'continueWrite',
  AgentTaskType.rewrite: 'rewrite',
  AgentTaskType.expand: 'expand',
  AgentTaskType.condense: 'condense',
  AgentTaskType.polish: 'polish',
  AgentTaskType.consistencyCheck: 'consistencyCheck',
  AgentTaskType.search: 'search',
  AgentTaskType.brainstorm: 'brainstorm',
};

const _$AgentTaskStatusEnumMap = {
  AgentTaskStatus.created: 'created',
  AgentTaskStatus.queued: 'queued',
  AgentTaskStatus.running: 'running',
  AgentTaskStatus.succeeded: 'succeeded',
  AgentTaskStatus.failed: 'failed',
  AgentTaskStatus.cancelled: 'cancelled',
};
