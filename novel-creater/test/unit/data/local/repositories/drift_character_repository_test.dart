import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_character_repository.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';

void main() {
  late AppDatabase db;
  late DriftCharacterRepository repo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    repo = DriftCharacterRepository(db);
  });

  tearDown(() async => await db.close());

  group('DriftCharacterRepository', () {
    test('create inserts and returns success', () async {
      final now = DateTime.utc(2025, 6, 1);

      final character = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice',
        description: 'Main protagonist.',
        role: CharacterRole.protagonist,
        traits: {'brave': 'Never gives up'},
        background: 'From a small village.',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.create(character);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'char_001');
      expect(result.valueOrNull?.name, 'Alice');
      expect(result.valueOrNull?.role, CharacterRole.protagonist);
    });

    test('list filters by projectId and orders by name ascending', () async {
      final baseTime = DateTime.utc(2025, 6, 1);

      // Characters for proj_01
      await repo.create(Character(
        id: 'char_b',
        projectId: 'proj_01',
        name: 'Bob',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));
      await repo.create(Character(
        id: 'char_a',
        projectId: 'proj_01',
        name: 'Alice',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));

      // Character for different project
      await repo.create(Character(
        id: 'char_c',
        projectId: 'proj_02',
        name: 'Charlie',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));

      final result = await repo.list('proj_01');

      expect(result.isSuccess, true);
      expect(result.valueOrNull, hasLength(2));
      // Ordered by name ascending
      expect(result.valueOrNull!.first.name, 'Alice');
      expect(result.valueOrNull!.last.name, 'Bob');
      // All belong to proj_01
      expect(
        result.valueOrNull!.every((c) => c.projectId == 'proj_01'),
        true,
      );
    });

    test('get returns character by id', () async {
      final now = DateTime.utc(2025, 6, 1);

      final character = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice',
        description: 'Protagonist.',
        role: CharacterRole.protagonist,
        avatarUrl: 'https://example.com/alice.png',
        traits: {'brave': 'Courageous'},
        background: 'Village origin.',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(character);

      final result = await repo.get('char_001');

      expect(result.isSuccess, true);
      expect(result.valueOrNull != null, true);
      expect(result.valueOrNull!.name, 'Alice');
      expect(result.valueOrNull!.description, 'Protagonist.');
      expect(result.valueOrNull!.role, CharacterRole.protagonist);
      expect(result.valueOrNull!.avatarUrl, 'https://example.com/alice.png');
      expect(result.valueOrNull!.traits, {'brave': 'Courageous'});
      expect(result.valueOrNull!.background, 'Village origin.');
    });

    test('get returns null for missing id', () async {
      final result = await repo.get('nonexistent');

      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('update updates character and returns updated entity', () async {
      final now = DateTime.utc(2025, 6, 1);

      final original = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice',
        description: 'Original description.',
        role: CharacterRole.supporting,
        traits: {},
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(original);

      final updated = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice Updated',
        description: 'Updated description.',
        role: CharacterRole.protagonist,
        avatarUrl: 'https://example.com/new.png',
        traits: {'brave': 'Very brave'},
        background: 'New background story.',
        createdAt: now,
        updatedAt: now.add(const Duration(days: 1)),
      );

      final result = await repo.update(updated);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.name, 'Alice Updated');
      expect(result.valueOrNull?.description, 'Updated description.');
      expect(result.valueOrNull?.role, CharacterRole.protagonist);
      expect(result.valueOrNull?.avatarUrl, 'https://example.com/new.png');
      expect(result.valueOrNull?.traits, {'brave': 'Very brave'});
      expect(result.valueOrNull?.background, 'New background story.');
    });

    test('update returns failure for missing character', () async {
      final now = DateTime.utc(2025, 6, 1);

      final ghost = Character(
        id: 'ghost_char',
        projectId: 'proj_01',
        name: 'Ghost',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.update(ghost);

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });

    test('delete removes existing character', () async {
      final now = DateTime.utc(2025, 6, 1);

      final character = Character(
        id: 'char_001',
        projectId: 'proj_01',
        name: 'Alice',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(character);

      final result = await repo.delete('char_001');

      expect(result.isSuccess, true);

      // Verify it is gone
      final get = await repo.get('char_001');
      expect(get.valueOrNull == null, true);
    });

    test('delete returns failure for missing character', () async {
      final result = await repo.delete('nonexistent');

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });
  });
}
