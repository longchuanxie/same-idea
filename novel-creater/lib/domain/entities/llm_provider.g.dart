// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_provider.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmProviderImpl _$$LlmProviderImplFromJson(Map<String, dynamic> json) =>
    _$LlmProviderImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      name: json['name'] as String,
      baseUrl: json['baseUrl'] as String,
      secretKeyRef: json['secretKeyRef'] as String,
      selectedModelId: json['selectedModelId'] as String?,
      status: $enumDecode(_$ProviderStatusEnumMap, json['status']),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      cachedModels: (json['cachedModels'] as List<dynamic>?)
              ?.map((e) => LlmModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const <LlmModel>[],
      temperature: (json['temperature'] as num?)?.toDouble() ?? 0.7,
      topP: (json['topP'] as num?)?.toDouble() ?? 0.9,
      streamingEnabled: json['streamingEnabled'] as bool? ?? true,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$LlmProviderImplToJson(_$LlmProviderImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'name': instance.name,
      'baseUrl': instance.baseUrl,
      'secretKeyRef': instance.secretKeyRef,
      'selectedModelId': instance.selectedModelId,
      'status': _$ProviderStatusEnumMap[instance.status]!,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'cachedModels': instance.cachedModels.map((e) => e.toJson()).toList(),
      'temperature': instance.temperature,
      'topP': instance.topP,
      'streamingEnabled': instance.streamingEnabled,
      'schemaVersion': instance.schemaVersion,
    };

const _$ProviderStatusEnumMap = {
  ProviderStatus.pendingConfig: 'pendingConfig',
  ProviderStatus.connected: 'connected',
  ProviderStatus.error: 'error',
  ProviderStatus.local: 'local',
};
