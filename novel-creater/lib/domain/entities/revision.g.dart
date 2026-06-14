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
      patch: RevisionPatch.fromJson(json['patch'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      status: $enumDecodeNullable(_$RevisionStatusEnumMap, json['status']) ??
          RevisionStatus.pending,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$RevisionImplToJson(_$RevisionImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'chapterId': instance.chapterId,
      'patch': instance.patch,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'status': _$RevisionStatusEnumMap[instance.status]!,
      'schemaVersion': instance.schemaVersion,
    };

const _$RevisionStatusEnumMap = {
  RevisionStatus.pending: 'pending',
  RevisionStatus.accepted: 'accepted',
  RevisionStatus.rejected: 'rejected',
  RevisionStatus.superseded: 'superseded',
};
