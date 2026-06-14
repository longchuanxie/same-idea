// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'snapshot.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SnapshotImpl _$$SnapshotImplFromJson(Map<String, dynamic> json) =>
    _$SnapshotImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      name: json['name'] as String,
      type: $enumDecode(_$SnapshotTypeEnumMap, json['type']),
      contentHash: json['contentHash'] as String,
      contentSnapshot: json['contentSnapshot'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
      chapterId: json['chapterId'] as String?,
      description: json['description'] as String?,
    );

Map<String, dynamic> _$$SnapshotImplToJson(_$SnapshotImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'name': instance.name,
      'type': _$SnapshotTypeEnumMap[instance.type]!,
      'contentHash': instance.contentHash,
      'contentSnapshot': instance.contentSnapshot,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
      'chapterId': instance.chapterId,
      'description': instance.description,
    };

const _$SnapshotTypeEnumMap = {
  SnapshotType.manual: 'manual',
  SnapshotType.auto: 'auto',
  SnapshotType.milestone: 'milestone',
};
