// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revision_patch_metadata.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RevisionPatchMetadataImpl _$$RevisionPatchMetadataImplFromJson(
        Map<String, dynamic> json) =>
    _$RevisionPatchMetadataImpl(
      prompt: json['prompt'] as String?,
      model: json['model'] as String?,
      taskId: json['taskId'] as String?,
      summary: json['summary'] as String?,
      changeSummary: json['changeSummary'] as String?,
      baseContentHash: json['baseContentHash'] as String?,
    );

Map<String, dynamic> _$$RevisionPatchMetadataImplToJson(
        _$RevisionPatchMetadataImpl instance) =>
    <String, dynamic>{
      'prompt': instance.prompt,
      'model': instance.model,
      'taskId': instance.taskId,
      'summary': instance.summary,
      'changeSummary': instance.changeSummary,
      'baseContentHash': instance.baseContentHash,
    };
