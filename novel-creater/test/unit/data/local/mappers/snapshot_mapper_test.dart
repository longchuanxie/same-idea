import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';

void main() {
  group('SnapshotMapper', () {
    test('type enum name round-trips correctly', () {
      for (final type in SnapshotType.values) {
        final name = type.name;
        final restored = SnapshotType.values.byName(name);
        expect(restored, type, reason: '$type should round-trip');
      }
    });

    test('entity serializes with all fields', () {
      final entity = Snapshot(
        id: 'snap-1',
        projectId: 'project-1',
        name: 'Chapter 1 draft',
        type: SnapshotType.manual,
        contentHash: 'abc123',
        contentSnapshot: '{"content": "Hello world"}',
        chapterId: 'chapter-1',
        description: 'Manual checkpoint',
        createdAt: DateTime.utc(2026, 1, 1),
        updatedAt: DateTime.utc(2026, 1, 2),
        schemaVersion: 1,
      );

      final json = entity.toJson();
      final restored = Snapshot.fromJson(json);

      expect(restored, entity);
      expect(restored.type, SnapshotType.manual);
      expect(restored.chapterId, 'chapter-1');
      expect(restored.description, 'Manual checkpoint');
    });

    test('entity handles nullable fields as null', () {
      final entity = Snapshot(
        id: 'snap-2',
        projectId: 'project-1',
        name: 'Auto save',
        type: SnapshotType.auto,
        contentHash: 'def456',
        contentSnapshot: '{}',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final json = entity.toJson();
      final restored = Snapshot.fromJson(json);

      expect(restored.chapterId, isNull);
      expect(restored.description, isNull);
    });

    test('entity handles milestone snapshot', () {
      final entity = Snapshot(
        id: 'snap-3',
        projectId: 'project-1',
        name: 'End of act 1',
        type: SnapshotType.milestone,
        contentHash: 'ghi789',
        contentSnapshot: '{"content": "Milestone"}',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final json = entity.toJson();
      final restored = Snapshot.fromJson(json);

      expect(restored.type, SnapshotType.milestone);
    });
  });
}
