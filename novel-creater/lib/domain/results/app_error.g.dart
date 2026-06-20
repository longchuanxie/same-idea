// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_error.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AppErrorImpl _$$AppErrorImplFromJson(Map<String, dynamic> json) =>
    _$AppErrorImpl(
      code: json['code'] as String,
      message: json['message'] as String,
      userMessage: json['userMessage'] as String,
      technicalDetail: json['technicalDetail'] as String?,
      recoverable: json['recoverable'] as bool? ?? true,
      suggestedAction: json['suggestedAction'] as String?,
      source: $enumDecodeNullable(_$AppErrorSourceEnumMap, json['source']) ??
          AppErrorSource.unknown,
    );

Map<String, dynamic> _$$AppErrorImplToJson(_$AppErrorImpl instance) =>
    <String, dynamic>{
      'code': instance.code,
      'message': instance.message,
      'userMessage': instance.userMessage,
      'technicalDetail': instance.technicalDetail,
      'recoverable': instance.recoverable,
      'suggestedAction': instance.suggestedAction,
      'source': _$AppErrorSourceEnumMap[instance.source]!,
    };

const _$AppErrorSourceEnumMap = {
  AppErrorSource.storage: 'storage',
  AppErrorSource.llm: 'llm',
  AppErrorSource.search: 'search',
  AppErrorSource.editor: 'editor',
  AppErrorSource.export: 'export',
  AppErrorSource.unknown: 'unknown',
};
