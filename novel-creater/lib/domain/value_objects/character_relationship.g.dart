// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character_relationship.dart';

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
