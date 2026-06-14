// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmModelImpl _$$LlmModelImplFromJson(Map<String, dynamic> json) =>
    _$LlmModelImpl(
      id: json['id'] as String,
      modelId: json['modelId'] as String,
      name: json['name'] as String,
      contextLength: (json['contextLength'] as num?)?.toInt(),
      maxOutput: (json['maxOutput'] as num?)?.toInt(),
      supportsStreaming: json['supportsStreaming'] as bool? ?? true,
      temperature: (json['temperature'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$LlmModelImplToJson(_$LlmModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'modelId': instance.modelId,
      'name': instance.name,
      'contextLength': instance.contextLength,
      'maxOutput': instance.maxOutput,
      'supportsStreaming': instance.supportsStreaming,
      'temperature': instance.temperature,
    };
