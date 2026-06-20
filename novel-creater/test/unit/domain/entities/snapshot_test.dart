import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';

void main() {
  group('Snapshot', () {
    test('keeps required fields and defaults', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);

      final snapshot = Snapshot(
        id: 'snap-1',
        projectId: 'project-1',
        name: 'Chapter 1 draft',
        type: SnapshotType.manual,
        contentHash: 'abc123',
        contentSnapshot: '{"content": "Hello world"}',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      expect(snapshot.id, 'snap-1');
      expect(snapshot.projectId, 'project-1');
      expect(snapshot.name, 'Chapter 1 draft');
      expect(snapshot.type, SnapshotType.manual);
      expect(snapshot.contentHash, 'abc123');
      expect(snapshot.contentSnapshot, '{"content": "Hello world"}');
      expect(snapshot.createdAt, createdAt);
      expect(snapshot.updatedAt, updatedAt);
      expect(snapshot.schemaVersion, 1);
      expect(snapshot.chapterId, isNull);
      expect(snapshot.description, isNull);
    });

    test('accepts optional fields', () {
      final snapshot = Snapshot(
        id: 'snap-2',
        projectId: 'project-1',
        name: 'Auto save',
        type: SnapshotType.auto,
        contentHash: 'def456',
        contentSnapshot: '{"content": "Updated"}',
        chapterId: 'chapter-1',
        description: 'Automatic checkpoint before revision',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(snapshot.chapterId, 'chapter-1');
      expect(snapshot.description, 'Automatic checkpoint before revision');
    });

    test('serializes to and from json', () {
      final snapshot = Snapshot(
        id: 'snap-3',
        projectId: 'project-1',
        name: 'Milestone',
        type: SnapshotType.milestone,
        contentHash: 'ghi789',
        contentSnapshot: '{"content": "Milestone content"}',
        chapterId: 'chapter-2',
        description: 'End of act 1',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026, 1, 2),
      );

      final restored = Snapshot.fromJson(snapshot.toJson());

      expect(restored, snapshot);
    });

    test('serializes with minimal fields', () {
      final snapshot = Snapshot(
        id: 'snap-4',
        projectId: 'project-1',
        name: 'Quick save',
        type: SnapshotType.auto,
        contentHash: 'jkl012',
        contentSnapshot: '{}',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final restored = Snapshot.fromJson(snapshot.toJson());

      expect(restored.chapterId, isNull);
      expect(restored.description, isNull);
      expect(restored.type, SnapshotType.auto);
    });

    test('all snapshot types round-trip through json', () {
      for (final type in SnapshotType.values) {
        final snapshot = Snapshot(
          id: 'snap-${type.name}',
          projectId: 'project-1',
          name: 'Test $type',
          type: type,
          contentHash: 'hash',
          contentSnapshot: '{}',
          createdAt: DateTime.utc(2026),
          updatedAt: DateTime.utc(2026),
        );

        final restored = Snapshot.fromJson(snapshot.toJson());
        expect(restored.type, type, reason: '$type should round-trip');
      }
    });
  });
}
