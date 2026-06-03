// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'writing_preferences.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WritingPreferencesImpl _$$WritingPreferencesImplFromJson(
        Map<String, dynamic> json) =>
    _$WritingPreferencesImpl(
      language: json['language'] as String? ?? 'zh',
      defaultStyle: json['defaultStyle'] as String? ?? '',
      autoSuggest: json['autoSuggest'] as bool? ?? false,
      defaultGenerateLength:
          (json['defaultGenerateLength'] as num?)?.toInt() ?? 2000,
    );

Map<String, dynamic> _$$WritingPreferencesImplToJson(
        _$WritingPreferencesImpl instance) =>
    <String, dynamic>{
      'language': instance.language,
      'defaultStyle': instance.defaultStyle,
      'autoSuggest': instance.autoSuggest,
      'defaultGenerateLength': instance.defaultGenerateLength,
    };
