import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/outline_node.dart';

void main() {
  group('OutlineNode', () {
    test('creates with required fields', () {
      final now = DateTime.now().toUtc();
      final node = OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Act I',
        createdAt: now,
        updatedAt: now,
      );
      expect(node.id, 'on_1');
      expect(node.projectId, 'proj_1');
      expect(node.title, 'Act I');
      expect(node.summary, '');
      expect(node.chapterId, '');
      expect(node.parentId, '');
      expect(node.sortOrder, 0);
      expect(node.tags, isEmpty);
      expect(node.schemaVersion, 1);
      expect(node.isRoot, isTrue);
      expect(node.hasLinkedChapter, isFalse);
    });

    test('isRoot is false when parentId is set', () {
      final now = DateTime.now().toUtc();
      final node = OutlineNode(
        id: 'on_2',
        projectId: 'proj_1',
        title: 'Chapter 1',
        parentId: 'on_1',
        createdAt: now,
        updatedAt: now,
      );
      expect(node.isRoot, isFalse);
    });

    test('hasLinkedChapter is true when chapterId is set', () {
      final now = DateTime.now().toUtc();
      final node = OutlineNode(
        id: 'on_3',
        projectId: 'proj_1',
        title: 'Chapter 1',
        chapterId: 'ch_1',
        createdAt: now,
        updatedAt: now,
      );
      expect(node.hasLinkedChapter, isTrue);
    });

    test('copyWith preserves unmodified fields', () {
      final now = DateTime.now().toUtc();
      final node = OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Act I',
        createdAt: now,
        updatedAt: now,
      );
      final updated = node.copyWith(title: 'Act I: Setup');
      expect(updated.title, 'Act I: Setup');
      expect(updated.id, node.id);
      expect(updated.projectId, node.projectId);
    });
  });
}
