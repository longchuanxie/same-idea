// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'snapshot.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SnapshotImpl _$$SnapshotImplFromJson(Map<String, dynamic> json) =>
    _$SnapshotImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      trigger: $enumDecodeNullable(_$SnapshotTriggerEnumMap, json['trigger']) ??
          SnapshotTrigger.manual,
      dataSnapshot: json['dataSnapshot'] as String? ?? '',
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$SnapshotImplToJson(_$SnapshotImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'description': instance.description,
      'createdAt': instance.createdAt.toIso8601String(),
      'trigger': _$SnapshotTriggerEnumMap[instance.trigger]!,
      'dataSnapshot': instance.dataSnapshot,
      'schemaVersion': instance.schemaVersion,
    };

const _$SnapshotTriggerEnumMap = {
  SnapshotTrigger.manual: 'manual',
  SnapshotTrigger.autoMigration: 'autoMigration',
  SnapshotTrigger.autoBatchRevision: 'autoBatchRevision',
  SnapshotTrigger.autoImport: 'autoImport',
};
