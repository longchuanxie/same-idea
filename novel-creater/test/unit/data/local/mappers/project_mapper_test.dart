import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/project_mapper.dart';
import 'package:novel_creator/domain/entities/project.dart';

void main() {
  const mapper = ProjectMapper();

  group('ProjectMapper', () {
    test('roundtrips basic project', () {
      final now = DateTime.utc(2026, 6, 6, 12, 0, 0);
      final entity = Project(
        id: 'p1',
        name: 'Test Project',
        description: 'A test novel',
        createdAt: now,
        updatedAt: now,
        schemaVersion: 1,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, entity.id);
      expect(restored.name, entity.name);
      expect(restored.description, entity.description);
      expect(restored.createdAt, entity.createdAt);
      expect(restored.updatedAt, entity.updatedAt);
      expect(restored.schemaVersion, entity.schemaVersion);
    });

    test('roundtrips project with empty description', () {
      final now = DateTime.utc(2026, 1, 1);
      final entity = Project(
        id: 'p2',
        name: 'Novel',
        createdAt: now,
        updatedAt: now,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'p2');
      expect(restored.name, 'Novel');
      expect(restored.description, '');
      expect(restored.schemaVersion, 1);
    });

    test('preserves millisecond-precision timestamps', () {
      final ts = DateTime.utc(2026, 6, 6, 12, 30, 45, 123);
      final entity = Project(
        id: 'p3',
        name: 'Timestamp Test',
        createdAt: ts,
        updatedAt: ts.add(const Duration(hours: 1)),
      );

      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.createdAt, ts);
      expect(restored.updatedAt, ts.add(const Duration(hours: 1)));
    });
  });
}
