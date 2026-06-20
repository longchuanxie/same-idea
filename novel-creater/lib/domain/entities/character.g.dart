// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CharacterImpl _$$CharacterImplFromJson(Map<String, dynamic> json) =>
    _$CharacterImpl(
      id: json['id'] as String,
      projectId: json['projectId'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      role: $enumDecodeNullable(_$CharacterRoleEnumMap, json['role']) ??
          CharacterRole.supporting,
      avatarUrl: json['avatarUrl'] as String? ?? '',
      traits: (json['traits'] as Map<String, dynamic>?)?.map(
            (k, e) => MapEntry(k, e as String),
          ) ??
          const {},
      background: json['background'] as String? ?? '',
      aliases: (json['aliases'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
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
      consistencyFacts: (json['consistencyFacts'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$CharacterImplToJson(_$CharacterImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'projectId': instance.projectId,
      'name': instance.name,
      'description': instance.description,
      'role': _$CharacterRoleEnumMap[instance.role]!,
      'avatarUrl': instance.avatarUrl,
      'traits': instance.traits,
      'background': instance.background,
      'aliases': instance.aliases,
      'appearance': instance.appearance,
      'personality': instance.personality,
      'goals': instance.goals,
      'conflicts': instance.conflicts,
      'secrets': instance.secrets,
      'relationships': instance.relationships,
      'consistencyFacts': instance.consistencyFacts,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'schemaVersion': instance.schemaVersion,
    };

const _$CharacterRoleEnumMap = {
  CharacterRole.protagonist: 'protagonist',
  CharacterRole.antagonist: 'antagonist',
  CharacterRole.supporting: 'supporting',
  CharacterRole.minor: 'minor',
};
