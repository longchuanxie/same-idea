// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_provider.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmProviderImpl _$$LlmProviderImplFromJson(Map<String, dynamic> json) =>
    _$LlmProviderImpl(
      id: json['id'] as String,
      displayName: json['displayName'] as String,
      baseUrl: json['baseUrl'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      apiKey: json['apiKey'] as String? ?? '',
      defaultModel: json['defaultModel'] as String? ?? 'gpt-4o-mini',
      temperature: (json['temperature'] as num?)?.toDouble() ?? 0.7,
      maxTokens: (json['maxTokens'] as num?)?.toInt() ?? 2048,
      enabled: json['enabled'] as bool? ?? true,
    );

Map<String, dynamic> _$$LlmProviderImplToJson(_$LlmProviderImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'displayName': instance.displayName,
      'baseUrl': instance.baseUrl,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'apiKey': instance.apiKey,
      'defaultModel': instance.defaultModel,
      'temperature': instance.temperature,
      'maxTokens': instance.maxTokens,
      'enabled': instance.enabled,
    };
