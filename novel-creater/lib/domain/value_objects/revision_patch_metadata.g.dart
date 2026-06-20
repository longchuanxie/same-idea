// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revision_patch_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RevisionPatchMetadataImpl _$$RevisionPatchMetadataImplFromJson(
        Map<String, dynamic> json) =>
    _$RevisionPatchMetadataImpl(
      prompt: json['prompt'] as String,
      model: json['model'] as String,
      summary: json['summary'] as String,
      taskId: json['taskId'] as String?,
    );

Map<String, dynamic> _$$RevisionPatchMetadataImplToJson(
        _$RevisionPatchMetadataImpl instance) =>
    <String, dynamic>{
      'prompt': instance.prompt,
      'model': instance.model,
      'summary': instance.summary,
      'taskId': instance.taskId,
    };
