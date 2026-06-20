import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/character_mapper.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';

void main() {
  const mapper = CharacterMapper();

  group('CharacterMapper', () {
    test('roundtrips character with all fields', () {
      final createdAt = DateTime.utc(2025, 6, 1, 10, 0, 0);
      final updatedAt = DateTime.utc(2025, 6, 2, 14, 30, 0);

      final entity = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice',
        description: 'Main protagonist of the story.',
        role: CharacterRole.protagonist,
        avatarUrl: 'https://example.com/alice.png',
        traits: {
          'brave': 'Never backs down from a challenge',
          'kind': 'Always helps those in need',
        },
        background: 'Born in a small village at the edge of the forest.',
        aliases: ['The Brave One', 'Alice of the Forest'],
        appearance: 'Tall with long silver hair and green eyes.',
        personality: 'Courageous and compassionate.',
        goals: 'Defeat the dark lord and save the kingdom.',
        conflicts: 'Torn between duty and personal freedom.',
        secrets: 'Secretly the heir to the ancient throne.',
        relationships: [
          const CharacterRelationship(
            targetCharacterId: 'char_002',
            relationType: 'rival',
            description: 'Former friend turned adversary.',
          ),
        ],
        consistencyFacts: ['Left-handed', 'Scar on right cheek'],
        createdAt: createdAt,
        updatedAt: updatedAt,
        schemaVersion: 1,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'char_001');
      expect(restored.projectId, 'proj_01');
      expect(restored.name, 'Alice');
      expect(restored.description, 'Main protagonist of the story.');
      expect(restored.role, CharacterRole.protagonist);
      expect(restored.avatarUrl, 'https://example.com/alice.png');
      expect(restored.traits, {
        'brave': 'Never backs down from a challenge',
        'kind': 'Always helps those in need',
      });
      expect(
        restored.background,
        'Born in a small village at the edge of the forest.',
      );
      expect(restored.aliases, ['The Brave One', 'Alice of the Forest']);
      expect(restored.appearance, 'Tall with long silver hair and green eyes.');
      expect(restored.personality, 'Courageous and compassionate.');
      expect(restored.goals, 'Defeat the dark lord and save the kingdom.');
      expect(restored.conflicts, 'Torn between duty and personal freedom.');
      expect(restored.secrets, 'Secretly the heir to the ancient throne.');
      expect(restored.relationships.length, 1);
      expect(restored.relationships[0].targetCharacterId, 'char_002');
      expect(restored.relationships[0].relationType, 'rival');
      expect(restored.relationships[0].description, 'Former friend turned adversary.');
      expect(restored.consistencyFacts, ['Left-handed', 'Scar on right cheek']);
      expect(restored.createdAt, createdAt);
      expect(restored.updatedAt, updatedAt);
      expect(restored.schemaVersion, 1);
    });

    test('roundtrips character with default values', () {
      final now = DateTime.utc(2025, 6, 1);

      final entity = Character(
        id: 'char_002',
        projectId: 'proj_01',
        name: 'Bob',
        createdAt: now,
        updatedAt: now,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'char_002');
      expect(restored.name, 'Bob');
      expect(restored.description, '');
      expect(restored.role, CharacterRole.supporting);
      expect(restored.avatarUrl, '');
      expect(restored.traits, isEmpty);
      expect(restored.background, '');
      expect(restored.aliases, isEmpty);
      expect(restored.appearance, '');
      expect(restored.personality, '');
      expect(restored.goals, '');
      expect(restored.conflicts, '');
      expect(restored.secrets, '');
      expect(restored.relationships, isEmpty);
      expect(restored.consistencyFacts, isEmpty);
      expect(restored.schemaVersion, 1);
    });

    test('serializes traits Map to JSON and deserializes correctly', () {
      final entity = Character(
        id: 'char_003',
        projectId: 'proj_01',
        name: 'Carol',
        traits: {
          'wisdom': 'Ancient knowledge holder',
          'mystery': 'Past is unknown',
          'power': 'Controls elemental forces',
        },
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final row = mapper.toRow(entity);

      // Verify JSON string representation
      expect(row.traitsJson, contains('"wisdom"'));
      expect(row.traitsJson, contains('"mystery"'));
      expect(row.traitsJson, contains('"power"'));

      // Verify roundtrip preserves Map contents
      final restored = mapper.fromRow(row);
      expect(restored.traits.length, 3);
      expect(restored.traits['wisdom'], 'Ancient knowledge holder');
      expect(restored.traits['mystery'], 'Past is unknown');
      expect(restored.traits['power'], 'Controls elemental forces');
    });

    test('converts role enum to string and back for each value', () {
      final roles = CharacterRole.values;

      for (final role in roles) {
        final entity = Character(
          id: 'char_role_${role.name}',
          projectId: 'proj_01',
          name: 'Test',
          role: role,
          createdAt: DateTime.utc(2025, 6, 1),
          updatedAt: DateTime.utc(2025, 6, 1),
        );

        final row = mapper.toRow(entity);
        expect(row.role, role.name);

        final restored = mapper.fromRow(row);
        expect(restored.role, role);
      }
    });

    test('preserves millisecond-precision timestamps', () {
      final createdAt =
          DateTime.utc(2025, 6, 1, 12, 30, 45, 123);
      final updatedAt =
          DateTime.utc(2025, 6, 1, 15, 20, 10, 456);

      final entity = Character(
        id: 'char_ts',
        projectId: 'proj_01',
        name: 'Timestamp Test',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.createdAt, createdAt);
      expect(restored.updatedAt, updatedAt);
    });

    test('serializes and deserializes aliases list', () {
      final entity = Character(
        id: 'char_aliases',
        projectId: 'proj_01',
        name: 'Diana',
        aliases: ['The Huntress', 'Diana of Themyscira', 'Wonder Woman'],
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final row = mapper.toRow(entity);
      expect(row.aliasesJson, contains('The Huntress'));

      final restored = mapper.fromRow(row);
      expect(restored.aliases, ['The Huntress', 'Diana of Themyscira', 'Wonder Woman']);
    });

    test('serializes and deserializes relationships list', () {
      final entity = Character(
        id: 'char_rels',
        projectId: 'proj_01',
        name: 'Eve',
        relationships: [
          const CharacterRelationship(
            targetCharacterId: 'char_001',
            relationType: 'mentor',
            description: 'Trained Alice in swordsmanship.',
          ),
          const CharacterRelationship(
            targetCharacterId: 'char_002',
            relationType: 'ally',
            description: 'Fought alongside Bob.',
          ),
        ],
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final row = mapper.toRow(entity);
      expect(row.relationshipsJson, contains('mentor'));
      expect(row.relationshipsJson, contains('ally'));

      final restored = mapper.fromRow(row);
      expect(restored.relationships.length, 2);
      expect(restored.relationships[0].targetCharacterId, 'char_001');
      expect(restored.relationships[0].relationType, 'mentor');
      expect(restored.relationships[0].description, 'Trained Alice in swordsmanship.');
      expect(restored.relationships[1].targetCharacterId, 'char_002');
      expect(restored.relationships[1].relationType, 'ally');
      expect(restored.relationships[1].description, 'Fought alongside Bob.');
    });

    test('serializes and deserializes consistencyFacts list', () {
      final entity = Character(
        id: 'char_facts',
        projectId: 'proj_01',
        name: 'Frank',
        consistencyFacts: ['Never lies', 'Has a pet hawk', 'Speaks three languages'],
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final row = mapper.toRow(entity);
      expect(row.consistencyFactsJson, contains('Never lies'));

      final restored = mapper.fromRow(row);
      expect(restored.consistencyFacts, ['Never lies', 'Has a pet hawk', 'Speaks three languages']);
    });

    test('roundtrips new string fields with non-empty values', () {
      final entity = Character(
        id: 'char_strs',
        projectId: 'proj_01',
        name: 'Grace',
        appearance: 'Short black hair, wears a red cloak.',
        personality: 'Calm and analytical.',
        goals: 'Uncover the conspiracy.',
        conflicts: 'Loyalty to family vs. justice.',
        secrets: 'Is a double agent.',
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.appearance, 'Short black hair, wears a red cloak.');
      expect(restored.personality, 'Calm and analytical.');
      expect(restored.goals, 'Uncover the conspiracy.');
      expect(restored.conflicts, 'Loyalty to family vs. justice.');
      expect(restored.secrets, 'Is a double agent.');
    });
  });
}
