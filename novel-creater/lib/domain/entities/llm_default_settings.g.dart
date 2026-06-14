// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'llm_default_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LlmDefaultSettingsImpl _$$LlmDefaultSettingsImplFromJson(
        Map<String, dynamic> json) =>
    _$LlmDefaultSettingsImpl(
      writingProviderId: json['writingProviderId'] as String?,
      writingModelId: json['writingModelId'] as String?,
      reasoningProviderId: json['reasoningProviderId'] as String?,
      reasoningModelId: json['reasoningModelId'] as String?,
      embeddingProviderId: json['embeddingProviderId'] as String?,
      embeddingModelId: json['embeddingModelId'] as String?,
      defaultTemperature:
          (json['defaultTemperature'] as num?)?.toDouble() ?? 0.7,
      defaultTopP: (json['defaultTopP'] as num?)?.toDouble() ?? 0.9,
      streamingEnabled: json['streamingEnabled'] as bool? ?? true,
    );

Map<String, dynamic> _$$LlmDefaultSettingsImplToJson(
        _$LlmDefaultSettingsImpl instance) =>
    <String, dynamic>{
      'writingProviderId': instance.writingProviderId,
      'writingModelId': instance.writingModelId,
      'reasoningProviderId': instance.reasoningProviderId,
      'reasoningModelId': instance.reasoningModelId,
      'embeddingProviderId': instance.embeddingProviderId,
      'embeddingModelId': instance.embeddingModelId,
      'defaultTemperature': instance.defaultTemperature,
      'defaultTopP': instance.defaultTopP,
      'streamingEnabled': instance.streamingEnabled,
    };
