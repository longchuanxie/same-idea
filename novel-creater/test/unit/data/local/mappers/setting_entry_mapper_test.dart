import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/mappers/setting_entry_mapper.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';

void main() {
  const mapper = SettingEntryMapper();

  group('SettingEntryMapper', () {
    test('roundtrips setting entry with all fields', () {
      final createdAt = DateTime.utc(2025, 6, 1, 10, 0, 0);
      final updatedAt = DateTime.utc(2025, 6, 3, 8, 15, 30);

      final entity = SettingEntry(
        id: 'set_001',
        projectId: 'proj_01',
        title: 'Kingdom of Eldoria',
        content:
            'A vast kingdom spanning three continents with a complex political structure.',
        category: SettingCategory.geography,
        tags: ['kingdom', 'continent', 'politics'],
        createdAt: createdAt,
        updatedAt: updatedAt,
        schemaVersion: 1,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'set_001');
      expect(restored.projectId, 'proj_01');
      expect(restored.title, 'Kingdom of Eldoria');
      expect(
        restored.content,
        'A vast kingdom spanning three continents with a complex political structure.',
      );
      expect(restored.category, SettingCategory.geography);
      expect(restored.tags, ['kingdom', 'continent', 'politics']);
      expect(restored.createdAt, createdAt);
      expect(restored.updatedAt, updatedAt);
      expect(restored.schemaVersion, 1);
    });

    test('roundtrips setting entry with default values', () {
      final now = DateTime.utc(2025, 6, 1);

      final entity = SettingEntry(
        id: 'set_002',
        projectId: 'proj_01',
        title: 'Untitled Setting',
        content: '',
        createdAt: now,
        updatedAt: now,
      );

      final row = mapper.toRow(entity);
      final restored = mapper.fromRow(row);

      expect(restored.id, 'set_002');
      expect(restored.title, 'Untitled Setting');
      expect(restored.content, '');
      expect(restored.category, SettingCategory.other);
      expect(restored.tags, isEmpty);
      expect(restored.schemaVersion, 1);
    });

    test('serializes tags List to JSON and deserializes correctly', () {
      final entity = SettingEntry(
        id: 'set_tags',
        projectId: 'proj_01',
        title: 'Magic System',
        content: 'Mana-based magic with elemental affinities.',
        tags: ['magic', 'mana', 'elements', 'affinity'],
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
      expect(restored.tags, ['magic', 'mana', 'elements', 'affinity']);
    });

    test('converts category enum to string and back for each value', () {
      final categories = SettingCategory.values;

      for (final category in categories) {
        final entity = SettingEntry(
          id: 'set_cat_${category.name}',
          projectId: 'proj_01',
          title: 'Test Entry',
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
          DateTime.utc(2025, 6, 1, 9, 15, 30, 500);
      final updatedAt =
          DateTime.utc(2025, 6, 2, 18, 45, 0, 999);

      final entity = SettingEntry(
        id: 'set_ts',
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
