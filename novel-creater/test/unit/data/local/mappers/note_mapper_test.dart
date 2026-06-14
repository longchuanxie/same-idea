import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/note_mapper.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/enums/note_category.dart';

void main() {
  const mapper = NoteMapper();

  group('NoteMapper', () {
    test('roundtrips note with all fields', () {
      final createdAt = DateTime.utc(2025, 6, 1, 10, 0, 0);
      final updatedAt = DateTime.utc(2025, 6, 4, 20, 0, 0);

      final entity = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'Plot Outline - Act I',
        content: 'Introduction of the hero and the inciting incident.',
        category: NoteCategory.plot,
        tags: ['plot', 'act1', 'outline'],
        createdAt: createdAt,
        updatedAt: updatedAt,
        schemaVersion: 1,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'note_001');
      expect(restored.projectId, 'proj_01');
      expect(restored.title, 'Plot Outline - Act I');
      expect(
        restored.content,
        'Introduction of the hero and the inciting incident.',
      );
      expect(restored.category, NoteCategory.plot);
      expect(restored.tags, ['plot', 'act1', 'outline']);
      expect(restored.createdAt, createdAt);
      expect(restored.updatedAt, updatedAt);
      expect(restored.schemaVersion, 1);
    });

    test('roundtrips note with default values', () {
      final now = DateTime.utc(2025, 6, 1);

      final entity = Note(
        id: 'note_002',
        projectId: 'proj_01',
        title: 'Quick Note',
        content: '',
        createdAt: now,
        updatedAt: now,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'note_002');
      expect(restored.title, 'Quick Note');
      expect(restored.content, '');
      expect(restored.category, NoteCategory.misc);
      expect(restored.tags, isEmpty);
      expect(restored.schemaVersion, 1);
    });

    test('serializes tags List to JSON and deserializes correctly', () {
      final entity = Note(
        id: 'note_tags',
        projectId: 'proj_01',
        title: 'Character Arc Ideas',
        content: 'Potential growth paths for secondary characters.',
        tags: ['character', 'arc', 'growth', 'secondary'],
        createdAt: DateTime.utc(2025, 6, 1),
        updatedAt: DateTime.utc(2025, 6, 1),
      );

      final row = mapper.toRow(entity);

      // Verify JSON array representation
      expect(row.tagsJson, startsWith('['));
      expect(row.tagsJson, endsWith(']'));

      // Verify roundtrip preserves list
      final restored = mapper.fromRow(row);
      expect(restored.tags.length, 4);
      expect(restored.tags, ['character', 'arc', 'growth', 'secondary']);
    });

    test('converts category enum to string and back for each value', () {
      final categories = NoteCategory.values;

      for (final category in categories) {
        final entity = Note(
          id: 'note_cat_${category.name}',
          projectId: 'proj_01',
          title: 'Test Note',
          content: 'Content',
          category: category,
          createdAt: DateTime.utc(2025, 6, 1),
          updatedAt: DateTime.utc(2025, 6, 1),
        );

        final row = mapper.toRow(entity);
        expect(row.category, category.name);

        final restored = mapper.fromRow(row);
        expect(restored.category, category);
      }
    });

    test('preserves millisecond-precision timestamps', () {
      final createdAt =
          DateTime.utc(2025, 6, 1, 7, 30, 0, 100);
      final updatedAt =
          DateTime.utc(2025, 6, 5, 23, 59, 59, 999);

      final entity = Note(
        id: 'note_ts',
        projectId: 'proj_01',
        title: 'Timestamp Test',
        content: 'Content here',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      final restored = mapper.fromRow(mapper.toRow(entity));

      expect(restored.createdAt, createdAt);
      expect(restored.updatedAt, updatedAt);
    });
  });
}
