import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/consistency_check_type.dart';
import 'package:novel_creator/domain/services/consistency_check_result.dart';
import 'package:novel_creator/domain/services/rule_based_consistency_checker.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';

void main() {
  group('RuleBasedConsistencyChecker', () {
    const checker = RuleBasedConsistencyChecker();
    final now = DateTime.now().toUtc();

    test('returns empty issues for consistent data', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
              id: 'c1',
              projectId: 'p1',
              name: 'Alice',
              createdAt: now,
              updatedAt: now),
        ],
        settingEntries: [],
        notes: [],
      );
      expect(result.hasIssues, isFalse);
      expect(result.issues, isEmpty);
    });

    test('detects naming inconsistency when two characters share a name',
        () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
              id: 'c1',
              projectId: 'p1',
              name: 'Alice',
              createdAt: now,
              updatedAt: now),
          Character(
              id: 'c2',
              projectId: 'p1',
              name: 'Alice',
              createdAt: now,
              updatedAt: now),
        ],
        settingEntries: [],
        notes: [],
      );
      final namingIssues =
          result.issuesByType(ConsistencyCheckType.namingInconsistency);
      expect(namingIssues, isNotEmpty);
      expect(namingIssues.first.characterIds.length, 2);
    });

    test('detects relationship logic conflict - missing reciprocal', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
            id: 'c1',
            projectId: 'p1',
            name: 'Alice',
            relationships: [
              CharacterRelationship(
                targetCharacterId: 'c2',
                relationType: '父母',
              ),
            ],
            createdAt: now,
            updatedAt: now,
          ),
          Character(
            id: 'c2',
            projectId: 'p1',
            name: 'Bob',
            createdAt: now,
            updatedAt: now,
          ),
        ],
        settingEntries: [],
        notes: [],
      );
      final relIssues =
          result.issuesByType(ConsistencyCheckType.relationshipLogic);
      expect(relIssues, isNotEmpty);
    });

    test('detects relationship to non-existent character', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
            id: 'c1',
            projectId: 'p1',
            name: 'Alice',
            relationships: [
              CharacterRelationship(
                targetCharacterId: 'nonexistent',
                relationType: '朋友',
              ),
            ],
            createdAt: now,
            updatedAt: now,
          ),
        ],
        settingEntries: [],
        notes: [],
      );
      final relIssues =
          result.issuesByType(ConsistencyCheckType.relationshipLogic);
      expect(relIssues, isNotEmpty);
      expect(relIssues.first.severity, ConsistencyIssueSeverity.error);
    });

    test('detects character behavior contradiction via negation', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
            id: 'c1',
            projectId: 'p1',
            name: 'Alice',
            consistencyFacts: ['Alice不会说谎', 'Alice会说谎'],
            createdAt: now,
            updatedAt: now,
          ),
        ],
        settingEntries: [],
        notes: [],
      );
      final behaviorIssues =
          result.issuesByType(ConsistencyCheckType.characterBehavior);
      expect(behaviorIssues, isNotEmpty);
    });

    test('can filter checks by type', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
              id: 'c1',
              projectId: 'p1',
              name: 'Alice',
              createdAt: now,
              updatedAt: now),
          Character(
              id: 'c2',
              projectId: 'p1',
              name: 'Alice',
              createdAt: now,
              updatedAt: now),
        ],
        settingEntries: [],
        notes: [],
        types: [ConsistencyCheckType.characterBehavior],
      );
      // Only characterBehavior was checked, so naming issues should not appear
      final namingIssues =
          result.issuesByType(ConsistencyCheckType.namingInconsistency);
      expect(namingIssues, isEmpty);
      expect(result.typesChecked, [ConsistencyCheckType.characterBehavior]);
    });

    test('detects alias naming conflict', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [
          Character(
            id: 'c1',
            projectId: 'p1',
            name: 'Alice',
            aliases: ['小白'],
            createdAt: now,
            updatedAt: now,
          ),
          Character(
            id: 'c2',
            projectId: 'p1',
            name: 'Bob',
            aliases: ['小白'],
            createdAt: now,
            updatedAt: now,
          ),
        ],
        settingEntries: [],
        notes: [],
      );
      final namingIssues =
          result.issuesByType(ConsistencyCheckType.namingInconsistency);
      expect(namingIssues, isNotEmpty);
    });

    test('result tracks checked types and timestamp', () async {
      final result = await checker.check(
        projectId: 'p1',
        chapters: [],
        characters: [],
        settingEntries: [],
        notes: [],
        types: [ConsistencyCheckType.namingInconsistency],
      );
      expect(result.projectId, 'p1');
      expect(result.typesChecked,
          contains(ConsistencyCheckType.namingInconsistency));
      expect(result.checkedAt, isNotNull);
    });
  });
}
