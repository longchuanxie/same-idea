// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CharacterRelationshipImpl _$$CharacterRelationshipImplFromJson(
        Map<String, dynamic> json) =>
    _$CharacterRelationshipImpl(
      targetCharacterId: json['targetCharacterId'] as String,
      relationType: json['relationType'] as String,
      description: json['description'] as String? ?? '',
    );

Map<String, dynamic> _$$CharacterRelationshipImplToJson(
        _$CharacterRelationshipImpl instance) =>
    <String, dynamic>{
      'targetCharacterId': instance.targetCharacterId,
      'relationType': instance.relationType,
      'description': instance.description,
    };

_$ConsistencyFactImpl _$$ConsistencyFactImplFromJson(
        Map<String, dynamic> json) =>
    _$ConsistencyFactImpl(
      key: json['key'] as String,
      value: json['value'] as String,
      sourceChapterId: json['sourceChapterId'] as String?,
    );

Map<String, dynamic> _$$ConsistencyFactImplToJson(
        _$ConsistencyFactImpl instance) =>
    <String, dynamic>{
      'key': instance.key,
      'value': instance.value,
      'sourceChapterId': instance.sourceChapterId,
    };

_$CharacterImpl _$$CharacterImplFromJson(Map<String, dynamic> json) =>
    _$CharacterImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      name: json['name'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      aliases: (json['aliases'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      role: $enumDecodeNullable(_$CharacterRoleEnumMap, json['role']) ??
          CharacterRole.supporting,
      description: json['description'] as String? ?? '',
      appearance: json['appearance'] as String? ?? '',
      personality: json['personality'] as String? ?? '',
      goals: json['goals'] as String? ?? '',
      conflicts: json['conflicts'] as String? ?? '',
      secrets: json['secrets'] as String? ?? '',
      relationships: (json['relationships'] as List<dynamic>?)
              ?.map((e) =>
                  CharacterRelationship.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      firstAppearanceChapterId: json['firstAppearanceChapterId'] as String?,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      consistencyFacts: (json['consistencyFacts'] as List<dynamic>?)
              ?.map((e) => ConsistencyFact.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$CharacterImplToJson(_$CharacterImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'name': instance.name,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'aliases': instance.aliases,
      'role': _$CharacterRoleEnumMap[instance.role]!,
      'description': instance.description,
      'appearance': instance.appearance,
      'personality': instance.personality,
      'goals': instance.goals,
      'conflicts': instance.conflicts,
      'secrets': instance.secrets,
      'relationships': instance.relationships,
      'firstAppearanceChapterId': instance.firstAppearanceChapterId,
      'tags': instance.tags,
      'consistencyFacts': instance.consistencyFacts,
      'schemaVersion': instance.schemaVersion,
    };

const _$CharacterRoleEnumMap = {
  CharacterRole.protagonist: 'protagonist',
  CharacterRole.antagonist: 'antagonist',
  CharacterRole.supporting: 'supporting',
  CharacterRole.minor: 'minor',
  CharacterRole.custom: 'custom',
};
