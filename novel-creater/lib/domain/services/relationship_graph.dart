import 'dart:math' as math;

import 'package:novel_creator/domain/entities/character.dart';

/// A node in the relationship graph.
final class GraphNode {
  GraphNode({
    required this.characterId,
    required this.name,
    required this.role,
    this.x = 0.0,
    this.y = 0.0,
  });

  final String characterId;
  final String name;
  final String role;
  double x;
  double y;
}

/// An edge in the relationship graph.
final class GraphEdge {
  const GraphEdge({
    required this.sourceId,
    required this.targetId,
    required this.relationType,
    this.description = '',
  });

  final String sourceId;
  final String targetId;
  final String relationType;
  final String description;

  /// Whether this edge is bidirectional (e.g., friend, spouse).
  bool get isBidirectional => _bidirectionalTypes.contains(relationType);

  static const _bidirectionalTypes = {
    '夫妻',
    '朋友',
    '敌人',
    '盟友',
    '兄弟',
    '姐妹',
    '兄妹',
    'spouse',
    'friend',
    'enemy',
    'ally',
    'sibling',
  };
}

/// The complete relationship graph for a project.
final class RelationshipGraph {
  RelationshipGraph({
    required this.nodes,
    required this.edges,
    required this.projectId,
  });

  /// Build a RelationshipGraph from a list of characters.
  RelationshipGraph.fromCharacters(
    this.projectId,
    List<Character> characters,
  )   : nodes = [],
        edges = [] {
    final charById = <String, Character>{};
    for (final char in characters) {
      charById[char.id] = char;
    }

    final addedEdges = <String>{};

    for (final char in characters) {
      nodes.add(GraphNode(
        characterId: char.id,
        name: char.name,
        role: char.role.name,
      ),);

      for (final rel in char.relationships) {
        // Only add edge if target character exists
        if (!charById.containsKey(rel.targetCharacterId)) continue;

        // Avoid duplicate edges for bidirectional relationships
        final edgeKey = _edgeKey(
          char.id,
          rel.targetCharacterId,
          rel.relationType,
        );
        final reverseKey = _edgeKey(
          rel.targetCharacterId,
          char.id,
          rel.relationType,
        );
        if (addedEdges.contains(edgeKey) ||
            addedEdges.contains(reverseKey)) continue;

        addedEdges.add(edgeKey);
        edges.add(GraphEdge(
          sourceId: char.id,
          targetId: rel.targetCharacterId,
          relationType: rel.relationType,
          description: rel.description,
        ),);
      }
    }

    // Apply simple circular layout
    _applyCircularLayout();
  }

  final List<GraphNode> nodes;
  final List<GraphEdge> edges;
  final String projectId;

  /// Apply a circular layout to nodes.
  void _applyCircularLayout() {
    if (nodes.isEmpty) return;
    final count = nodes.length;
    final radius = 150.0 + (count > 8 ? (count - 8) * 20.0 : 0.0);
    for (var i = 0; i < count; i++) {
      final angle = 2 * math.pi * i / count - math.pi / 2;
      nodes[i].x = radius * math.cos(angle);
      nodes[i].y = radius * math.sin(angle);
    }
  }

  /// Get all edges connected to a character.
  List<GraphEdge> edgesForCharacter(String characterId) => edges
      .where(
        (e) => e.sourceId == characterId || e.targetId == characterId,
      )
      .toList();

  /// Get all characters connected to a given character.
  List<String> connectedCharacterIds(String characterId) {
    final ids = <String>{};
    for (final edge in edgesForCharacter(characterId)) {
      if (edge.sourceId == characterId) {
        ids.add(edge.targetId);
      } else {
        ids.add(edge.sourceId);
      }
    }
    return ids.toList();
  }

  static String _edgeKey(String a, String b, String type) =>
      '$a->$b:$type';
}
