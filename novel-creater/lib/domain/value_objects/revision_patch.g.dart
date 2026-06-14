// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revision_patch.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RevisionPatchImpl _$$RevisionPatchImplFromJson(Map<String, dynamic> json) =>
    _$RevisionPatchImpl(
      chapterId: json['chapterId'] as String,
      baseContentHash: json['baseContentHash'] as String,
      operation: $enumDecode(_$RevisionOperationEnumMap, json['operation']),
      anchor: RevisionAnchor.fromJson(json['anchor'] as Map<String, dynamic>),
      beforeText: json['beforeText'] as String,
      afterText: json['afterText'] as String,
      source: $enumDecode(_$RevisionSourceEnumMap, json['source']),
      metadata: RevisionPatchMetadata.fromJson(
          json['metadata'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$RevisionPatchImplToJson(_$RevisionPatchImpl instance) =>
    <String, dynamic>{
      'chapterId': instance.chapterId,
      'baseContentHash': instance.baseContentHash,
      'operation': _$RevisionOperationEnumMap[instance.operation]!,
      'anchor': instance.anchor,
      'beforeText': instance.beforeText,
      'afterText': instance.afterText,
      'source': _$RevisionSourceEnumMap[instance.source]!,
      'metadata': instance.metadata,
    };

const _$RevisionOperationEnumMap = {
  RevisionOperation.insert: 'insert',
  RevisionOperation.delete: 'delete',
  RevisionOperation.replace: 'replace',
};

const _$RevisionSourceEnumMap = {
  RevisionSource.agent: 'agent',
  RevisionSource.user: 'user',
};
