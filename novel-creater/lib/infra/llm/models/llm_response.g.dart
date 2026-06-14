// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmResponseImpl _$$LlmResponseImplFromJson(Map<String, dynamic> json) =>
    _$LlmResponseImpl(
      content: json['content'] as String,
      finishReason: json['finishReason'] as String?,
      promptTokens: (json['promptTokens'] as num?)?.toInt(),
      completionTokens: (json['completionTokens'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$LlmResponseImplToJson(_$LlmResponseImpl instance) =>
    <String, dynamic>{
      'content': instance.content,
      'finishReason': instance.finishReason,
      'promptTokens': instance.promptTokens,
      'completionTokens': instance.completionTokens,
    };
