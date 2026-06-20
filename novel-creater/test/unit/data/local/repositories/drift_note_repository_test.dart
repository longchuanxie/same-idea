import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_note_repository.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/enums/note_category.dart';

void main() {
  late AppDatabase db;
  late DriftNoteRepository repo;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    repo = DriftNoteRepository(db);
  });

  tearDown(() async => await db.close());

  group('DriftNoteRepository', () {
    test('create inserts and returns success', () async {
      final now = DateTime.utc(2025, 6, 1);

      final note = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'Plot Outline - Act I',
        content: 'Introduction of the hero.',
        category: NoteCategory.plot,
        tags: ['plot', 'act1'],
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.create(note);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'note_001');
      expect(result.valueOrNull?.title, 'Plot Outline - Act I');
      expect(result.valueOrNull?.category, NoteCategory.plot);
    });

    test('list filters by projectId and orders by createdAt descending',
        () async {
      final baseTime = DateTime.utc(2025, 6, 1);

      // Notes for proj_01 with different creation times
      await repo.create(Note(
        id: 'note_old',
        projectId: 'proj_01',
        title: 'Old Note',
        content: '',
        createdAt: baseTime.subtract(const Duration(days: 2)),
        updatedAt: baseTime.subtract(const Duration(days: 2)),
      ));
      await repo.create(Note(
        id: 'note_new',
        projectId: 'proj_01',
        title: 'New Note',
        content: '',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));
      await repo.create(Note(
        id: 'note_mid',
        projectId: 'proj_01',
        title: 'Mid Note',
        content: '',
        createdAt: baseTime.subtract(const Duration(days: 1)),
        updatedAt: baseTime.subtract(const Duration(days: 1)),
      ));

      // Note for different project
      await repo.create(Note(
        id: 'note_other',
        projectId: 'proj_02',
        title: 'Other Project Note',
        content: '',
        createdAt: baseTime,
        updatedAt: baseTime,
      ));

      final result = await repo.list('proj_01');

      expect(result.isSuccess, true);
      expect(result.valueOrNull, hasLength(3));
      // Ordered by createdAt descending (newest first)
      expect(result.valueOrNull![0].id, 'note_new');
      expect(result.valueOrNull![1].id, 'note_mid');
      expect(result.valueOrNull![2].id, 'note_old');
      // All belong to proj_01
      expect(
        result.valueOrNull!.every((n) => n.projectId == 'proj_01'),
        true,
      );
    });

    test('get returns note by id', () async {
      final now = DateTime.utc(2025, 6, 1);

      final note = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'Character Arc Ideas',
        content: 'Potential growth paths for the protagonist.',
        category: NoteCategory.character,
        tags: ['character', 'arc'],
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(note);

      final result = await repo.get('note_001');

      expect(result.isSuccess, true);
      expect(result.valueOrNull != null, true);
      expect(result.valueOrNull!.title, 'Character Arc Ideas');
      expect(
        result.valueOrNull!.content,
        'Potential growth paths for the protagonist.',
      );
      expect(result.valueOrNull!.category, NoteCategory.character);
      expect(result.valueOrNull!.tags, ['character', 'arc']);
    });

    test('get returns null for missing id', () async {
      final result = await repo.get('nonexistent');

      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('update updates note and returns updated entity', () async {
      final now = DateTime.utc(2025, 6, 1);

      final original = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'Original Title',
        content: 'Original content.',
        category: NoteCategory.misc,
        tags: ['old'],
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(original);

      final updated = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'Updated Title',
        content: 'Updated content with more details.',
        category: NoteCategory.research,
        tags: ['research', 'updated'],
        createdAt: now,
        updatedAt: now.add(const Duration(hours: 3)),
      );

      final result = await repo.update(updated);

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.title, 'Updated Title');
      expect(
        result.valueOrNull?.content,
        'Updated content with more details.',
      );
      expect(result.valueOrNull?.category, NoteCategory.research);
      expect(result.valueOrNull?.tags, ['research', 'updated']);
    });

    test('update returns failure for missing note', () async {
      final now = DateTime.utc(2025, 6, 1);

      final ghost = Note(
        id: 'ghost_note',
        projectId: 'proj_01',
        title: 'Ghost',
        content: '',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.update(ghost);

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });

    test('delete removes existing note', () async {
      final now = DateTime.utc(2025, 6, 1);

      final note = Note(
        id: 'note_001',
        projectId: 'proj_01',
        title: 'To Delete',
        content: '',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(note);

      final result = await repo.delete('note_001');

      expect(result.isSuccess, true);

      // Verify it is gone
      final get = await repo.get('note_001');
      expect(get.valueOrNull == null, true);
    });

    test('delete returns failure for missing note', () async {
      final result = await repo.delete('nonexistent');

      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });
  });
}
