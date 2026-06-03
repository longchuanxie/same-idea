// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revision.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RevisionImpl _$$RevisionImplFromJson(Map<String, dynamic> json) =>
    _$RevisionImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      chapterId: json['chapterId'] as String,
      operation: $enumDecode(_$RevisionOperationEnumMap, json['operation']),
      anchor: RevisionAnchor.fromJson(json['anchor'] as Map<String, dynamic>),
      beforeText: json['beforeText'] as String,
      afterText: json['afterText'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      source: $enumDecodeNullable(_$RevisionSourceEnumMap, json['source']) ??
          RevisionSource.agent,
      status: $enumDecodeNullable(_$RevisionStatusEnumMap, json['status']) ??
          RevisionStatus.pending,
      metadata: json['metadata'] == null
          ? null
          : RevisionPatchMetadata.fromJson(
              json['metadata'] as Map<String, dynamic>),
      resolvedAt: json['resolvedAt'] == null
          ? null
          : DateTime.parse(json['resolvedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$RevisionImplToJson(_$RevisionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'chapterId': instance.chapterId,
      'operation': _$RevisionOperationEnumMap[instance.operation]!,
      'anchor': instance.anchor,
      'beforeText': instance.beforeText,
      'afterText': instance.afterText,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'source': _$RevisionSourceEnumMap[instance.source]!,
      'status': _$RevisionStatusEnumMap[instance.status]!,
      'metadata': instance.metadata,
      'resolvedAt': instance.resolvedAt?.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
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

const _$RevisionStatusEnumMap = {
  RevisionStatus.pending: 'pending',
  RevisionStatus.accepted: 'accepted',
  RevisionStatus.rejected: 'rejected',
  RevisionStatus.superseded: 'superseded',
};
