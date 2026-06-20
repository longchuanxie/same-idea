import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/services/relationship_graph.dart';

/// Widget that visualizes character relationships as a graph.
class RelationshipGraphWidget extends StatelessWidget {
  const RelationshipGraphWidget({
    required this.graph,
    super.key,
    this.selectedCharacterId,
    this.onNodeTap,
  });

  final RelationshipGraph graph;
  final ValueChanged<String>? onNodeTap;
  final String? selectedCharacterId;

  @override
  Widget build(BuildContext context) {
    if (graph.nodes.isEmpty) {
      return const Center(
        child: Text(
          '暂无角色关系数据',
          style: TextStyle(color: MorandiColors.clay),
        ),
      );
    }
    return LayoutBuilder(
      builder: (context, constraints) => InteractiveViewer(
        minScale: 0.5,
        maxScale: 2,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapUp: (details) {
            if (onNodeTap == null) return;
            final centerX = constraints.maxWidth / 2;
            final centerY = constraints.maxHeight / 2;
            final localX = details.localPosition.dx;
            final localY = details.localPosition.dy;
            for (final node in graph.nodes) {
              final nx = centerX + node.x;
              final ny = centerY + node.y;
              final dist = math.sqrt(
                (localX - nx) * (localX - nx) +
                    (localY - ny) * (localY - ny),
              );
              if (dist <= _RelationshipGraphPainter.nodeRadius) {
                onNodeTap!(node.characterId);
                return;
              }
            }
          },
          child: CustomPaint(
            size: Size(constraints.maxWidth, constraints.maxHeight),
            painter: _RelationshipGraphPainter(
              graph: graph,
              selectedCharacterId: selectedCharacterId,
            ),
          ),
        ),
      ),
    );
  }
}

class _RelationshipGraphPainter extends CustomPainter {
  _RelationshipGraphPainter({
    required this.graph,
    this.selectedCharacterId,
  });

  final RelationshipGraph graph;
  final String? selectedCharacterId;

  static const double nodeRadius = 24;
  static const double fontSize = 12;

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Build node index for fast lookup
    final nodeMap = <String, GraphNode>{};
    for (final node in graph.nodes) {
      nodeMap[node.characterId] = node;
    }

    // Draw edges
    for (final edge in graph.edges) {
      final sourceNode = nodeMap[edge.sourceId];
      final targetNode = nodeMap[edge.targetId];
      if (sourceNode == null || targetNode == null) continue;

      final startX = centerX + sourceNode.x;
      final startY = centerY + sourceNode.y;
      final endX = centerX + targetNode.x;
      final endY = centerY + targetNode.y;

      final paint = Paint()
        ..color = _edgeColor(edge.relationType)
        ..strokeWidth = edge.isBidirectional ? 2.0 : 1.5
        ..style = PaintingStyle.stroke;

      if (edge.isBidirectional) {
        canvas.drawLine(
          Offset(startX, startY),
          Offset(endX, endY),
          paint,
        );
      } else {
        _drawArrow(canvas, startX, startY, endX, endY, paint);
      }

      // Draw relation type label at midpoint
      final midX = (startX + endX) / 2;
      final midY = (startY + endY) / 2;
      final textSpan = TextSpan(
        text: edge.relationType,
        style: const TextStyle(
          color: MorandiColors.clay,
          fontSize: 10,
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(
          midX - textPainter.width / 2,
          midY - textPainter.height / 2,
        ),
      );
    }

    // Draw nodes
    for (final node in graph.nodes) {
      final x = centerX + node.x;
      final y = centerY + node.y;
      final isSelected = node.characterId == selectedCharacterId;

      final nodePaint = Paint()
        ..color = isSelected ? MorandiColors.sage : _roleColor(node.role)
        ..style = PaintingStyle.fill;

      final borderPaint = Paint()
        ..color = isSelected ? MorandiColors.ink : MorandiColors.mist
        ..style = PaintingStyle.stroke
        ..strokeWidth = isSelected ? 3.0 : 1.5;

      canvas.drawCircle(Offset(x, y), nodeRadius, nodePaint);
      canvas.drawCircle(Offset(x, y), nodeRadius, borderPaint);

      // Draw name
      final textSpan = TextSpan(
        text: node.name,
        style: TextStyle(
          color: isSelected ? Colors.white : MorandiColors.ink,
          fontSize: fontSize,
          fontWeight:
              isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
        textAlign: TextAlign.center,
      )..layout(maxWidth: nodeRadius * 2);

      // Position text below the node
      textPainter.paint(
        canvas,
        Offset(x - textPainter.width / 2, y + nodeRadius + 4),
      );
    }
  }

  void _drawArrow(
    Canvas canvas,
    double startX,
    double startY,
    double endX,
    double endY,
    Paint paint,
  ) {
    canvas.drawLine(
      Offset(startX, startY),
      Offset(endX, endY),
      paint,
    );

    // Draw arrowhead
    final angle = math.atan2(endY - startY, endX - startX);
    const arrowSize = 8.0;
    const arrowAngle = math.pi / 6;

    final path = Path()
      ..moveTo(endX, endY)
      ..lineTo(
        endX - arrowSize * math.cos(angle - arrowAngle),
        endY - arrowSize * math.sin(angle - arrowAngle),
      )
      ..lineTo(
        endX - arrowSize * math.cos(angle + arrowAngle),
        endY - arrowSize * math.sin(angle + arrowAngle),
      )
      ..close();

    canvas.drawPath(path, paint..style = PaintingStyle.fill);
  }

  Color _edgeColor(String relationType) {
    const hostileTypes = {
      '敌人',
      '对手',
      'enemy',
      'rival',
    };
    const familyTypes = {
      '父母',
      '子女',
      '兄弟',
      '姐妹',
      '兄妹',
      '夫妻',
      'parent',
      'child',
      'sibling',
      'spouse',
    };
    const friendTypes = {
      '朋友',
      '盟友',
      'friend',
      'ally',
    };

    if (hostileTypes.contains(relationType)) return MorandiColors.clay;
    if (familyTypes.contains(relationType)) return MorandiColors.sage;
    if (friendTypes.contains(relationType)) return MorandiColors.mist;
    return MorandiColors.clay;
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'protagonist':
        return MorandiColors.sage;
      case 'antagonist':
        return MorandiColors.clay;
      case 'supporting':
        return MorandiColors.mist;
      default:
        return MorandiColors.paper;
    }
  }

  @override
  bool shouldRepaint(covariant _RelationshipGraphPainter oldDelegate) =>
      graph != oldDelegate.graph ||
      selectedCharacterId != oldDelegate.selectedCharacterId;
}
