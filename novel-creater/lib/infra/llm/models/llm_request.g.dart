// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmRequestImpl _$$LlmRequestImplFromJson(Map<String, dynamic> json) =>
    _$LlmRequestImpl(
      baseUrl: json['baseUrl'] as String,
      apiKey: json['apiKey'] as String,
      model: json['model'] as String,
      messages: (json['messages'] as List<dynamic>)
          .map((e) => LlmMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
      temperature: (json['temperature'] as num?)?.toDouble() ?? 0.7,
      topP: (json['topP'] as num?)?.toDouble() ?? 0.9,
      maxTokens: (json['maxTokens'] as num?)?.toInt() ?? 2048,
      stream: json['stream'] as bool? ?? true,
    );

Map<String, dynamic> _$$LlmRequestImplToJson(_$LlmRequestImpl instance) =>
    <String, dynamic>{
      'baseUrl': instance.baseUrl,
      'apiKey': instance.apiKey,
      'model': instance.model,
      'messages': instance.messages.map((e) => e.toJson()).toList(),
      'temperature': instance.temperature,
      'topP': instance.topP,
      'maxTokens': instance.maxTokens,
      'stream': instance.stream,
    };
