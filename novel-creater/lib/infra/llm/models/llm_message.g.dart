// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmMessageImpl _$$LlmMessageImplFromJson(Map<String, dynamic> json) =>
    _$LlmMessageImpl(
      role: json['role'] as String,
      content: json['content'] as String,
    );

Map<String, dynamic> _$$LlmMessageImplToJson(_$LlmMessageImpl instance) =>
    <String, dynamic>{
      'role': instance.role,
      'content': instance.content,
    };
