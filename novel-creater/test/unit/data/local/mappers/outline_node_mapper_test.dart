import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/outline_node_mapper.dart';
import 'package:novel_creator/domain/entities/outline_node.dart';

void main() {
  group('OutlineNodeMapper', () {
    const mapper = OutlineNodeMapper();

    test('round-trips entity through mapper', () {
      final node = OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Act I',
        summary: 'The beginning',
        chapterId: 'ch_1',
        parentId: '',
        sortOrder: 0,
        tags: ['act1', 'setup'],
        createdAt: DateTime.utc(2026, 1, 1),
        updatedAt: DateTime.utc(2026, 1, 2),
        schemaVersion: 1,
      );
      final row = mapper.toRow(node);
      final restored = mapper.fromRow(row);
      expect(restored.id, node.id);
      expect(restored.projectId, node.projectId);
      expect(restored.title, node.title);
      expect(restored.summary, node.summary);
      expect(restored.chapterId, node.chapterId);
      expect(restored.parentId, node.parentId);
      expect(restored.sortOrder, node.sortOrder);
      expect(restored.tags, node.tags);
      expect(restored.schemaVersion, node.schemaVersion);
    });
  });
}
