import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';

final class CharacterMapper {
  const CharacterMapper();

  CharacterRow toRow(Character entity) => CharacterRow(
        id: entity.id,
        projectId: entity.projectId,
        name: entity.name,
        description: entity.description,
        role: entity.role.name,
        avatarUrl: entity.avatarUrl,
        traitsJson: jsonEncode(entity.traits),
        background: entity.background,
        aliasesJson: jsonEncode(entity.aliases),
        appearance: entity.appearance,
        personality: entity.personality,
        goals: entity.goals,
        conflicts: entity.conflicts,
        secrets: entity.secrets,
        relationshipsJson:
            jsonEncode(entity.relationships.map((r) => r.toJson()).toList()),
        consistencyFactsJson: jsonEncode(entity.consistencyFacts),
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  Character fromRow(CharacterRow row) => Character(
        id: row.id,
        projectId: row.projectId,
        name: row.name,
        description: row.description,
        role: CharacterRole.values.byName(row.role),
        avatarUrl: row.avatarUrl,
        traits: (jsonDecode(row.traitsJson) as Map<String, dynamic>)
            .map((k, v) => MapEntry(k, v.toString())),
        background: row.background,
        aliases: (jsonDecode(row.aliasesJson) as List<dynamic>)
            .cast<String>(),
        appearance: row.appearance,
        personality: row.personality,
        goals: row.goals,
        conflicts: row.conflicts,
        secrets: row.secrets,
        relationships: (jsonDecode(row.relationshipsJson) as List<dynamic>)
            .map((e) => CharacterRelationship.fromJson(e as Map<String, dynamic>))
            .toList(),
        consistencyFacts: (jsonDecode(row.consistencyFactsJson) as List<dynamic>)
            .cast<String>(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
