import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/services/relationship_graph.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';

void main() {
  group('RelationshipGraph', () {
    final now = DateTime.now().toUtc();

    test('builds graph from characters', () {
      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: 'Alice',
          role: CharacterRole.protagonist,
          relationships: [
            CharacterRelationship(targetCharacterId: 'c2', relationType: '朋友'),
          ],
          createdAt: now,
          updatedAt: now,
        ),
        Character(
          id: 'c2',
          projectId: 'p1',
          name: 'Bob',
          role: CharacterRole.supporting,
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      expect(graph.nodes.length, 2);
      expect(graph.edges.length, 1);
      expect(graph.edges.first.sourceId, 'c1');
      expect(graph.edges.first.targetId, 'c2');
      expect(graph.edges.first.relationType, '朋友');
    });

    test('deduplicates bidirectional edges', () {
      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: 'Alice',
          relationships: [
            CharacterRelationship(targetCharacterId: 'c2', relationType: '朋友'),
          ],
          createdAt: now,
          updatedAt: now,
        ),
        Character(
          id: 'c2',
          projectId: 'p1',
          name: 'Bob',
          relationships: [
            CharacterRelationship(targetCharacterId: 'c1', relationType: '朋友'),
          ],
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      expect(graph.edges.length, 1);
    });

    test('skips edges to non-existent characters', () {
      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: 'Alice',
          relationships: [
            CharacterRelationship(targetCharacterId: 'missing', relationType: '朋友'),
          ],
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      expect(graph.nodes.length, 1);
      expect(graph.edges.length, 0);
    });

    test('edgesForCharacter returns correct edges', () {
      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: 'Alice',
          relationships: [
            CharacterRelationship(targetCharacterId: 'c2', relationType: '朋友'),
            CharacterRelationship(targetCharacterId: 'c3', relationType: '敌人'),
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
        Character(
          id: 'c3',
          projectId: 'p1',
          name: 'Carol',
          createdAt: now,
          updatedAt: now,
        ),
      ];

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      final aliceEdges = graph.edgesForCharacter('c1');
      expect(aliceEdges.length, 2);
    });

    test('connectedCharacterIds returns neighbor IDs', () {
      final characters = [
        Character(
          id: 'c1',
          projectId: 'p1',
          name: 'Alice',
          relationships: [
            CharacterRelationship(targetCharacterId: 'c2', relationType: '朋友'),
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
      ];

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      expect(graph.connectedCharacterIds('c1'), contains('c2'));
      expect(graph.connectedCharacterIds('c2'), contains('c1'));
    });

    test('applies circular layout with non-zero coordinates', () {
      final characters = List.generate(
        5,
        (i) => Character(
          id: 'c$i',
          projectId: 'p1',
          name: 'Char$i',
          createdAt: now,
          updatedAt: now,
        ),
      );

      final graph = RelationshipGraph.fromCharacters('p1', characters);
      for (final node in graph.nodes) {
        // At least some nodes should have non-zero coordinates
        expect(node.x != 0 || node.y != 0, isTrue);
      }
    });

    test('GraphEdge.isBidirectional works correctly', () {
      const friendEdge = GraphEdge(sourceId: 'a', targetId: 'b', relationType: '朋友');
      const parentEdge = GraphEdge(sourceId: 'a', targetId: 'b', relationType: '父母');
      const enemyEdge = GraphEdge(sourceId: 'a', targetId: 'b', relationType: '敌人');

      expect(friendEdge.isBidirectional, isTrue);
      expect(parentEdge.isBidirectional, isFalse);
      expect(enemyEdge.isBidirectional, isTrue);
    });

    test('empty characters produce empty graph', () {
      final graph = RelationshipGraph.fromCharacters('p1', []);
      expect(graph.nodes, isEmpty);
      expect(graph.edges, isEmpty);
    });
  });
}
