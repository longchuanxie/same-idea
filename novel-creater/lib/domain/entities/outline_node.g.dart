// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'outline_node.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OutlineNodeImpl _$$OutlineNodeImplFromJson(Map<String, dynamic> json) =>
    _$OutlineNodeImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      order: (json['order'] as num).toInt(),
      title: json['title'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      parentId: json['parentId'] as String?,
      nodeType:
          $enumDecodeNullable(_$OutlineNodeTypeEnumMap, json['nodeType']) ??
              OutlineNodeType.chapter,
      summary: json['summary'] as String? ?? '',
      linkedChapterId: json['linkedChapterId'] as String?,
      status: $enumDecodeNullable(_$OutlineNodeStatusEnumMap, json['status']) ??
          OutlineNodeStatus.planned,
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$OutlineNodeImplToJson(_$OutlineNodeImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'order': instance.order,
      'title': instance.title,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'parentId': instance.parentId,
      'nodeType': _$OutlineNodeTypeEnumMap[instance.nodeType]!,
      'summary': instance.summary,
      'linkedChapterId': instance.linkedChapterId,
      'status': _$OutlineNodeStatusEnumMap[instance.status]!,
      'schemaVersion': instance.schemaVersion,
    };

const _$OutlineNodeTypeEnumMap = {
  OutlineNodeType.volume: 'volume',
  OutlineNodeType.chapter: 'chapter',
  OutlineNodeType.scene: 'scene',
  OutlineNodeType.beat: 'beat',
  OutlineNodeType.custom: 'custom',
};

const _$OutlineNodeStatusEnumMap = {
  OutlineNodeStatus.planned: 'planned',
  OutlineNodeStatus.writing: 'writing',
  OutlineNodeStatus.done: 'done',
  OutlineNodeStatus.archived: 'archived',
};
