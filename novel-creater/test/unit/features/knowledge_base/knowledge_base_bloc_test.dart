import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/repositories/in_memory_character_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_note_repository.dart';
import 'package:novel_creator/data/repositories/in_memory_setting_entry_repository.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/enums/note_category.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_state.dart';

void main() {
  const projectId = 'test-project';

  final now = DateTime(2025, 1, 1);

  Character buildCharacter({
    String id = 'char-1',
    String name = '角色A',
    CharacterRole role = CharacterRole.protagonist,
  }) =>
      Character(
        id: id,
        projectId: projectId,
        name: name,
        role: role,
        createdAt: now,
        updatedAt: now,
      );

  SettingEntry buildSettingEntry({
    String id = 'setting-1',
    String title = '设定A',
    String content = '设定内容',
    SettingCategory category = SettingCategory.geography,
  }) =>
      SettingEntry(
        id: id,
        projectId: projectId,
        title: title,
        content: content,
        category: category,
        createdAt: now,
        updatedAt: now,
      );

  Note buildNote({
    String id = 'note-1',
    String title = '笔记A',
    String content = '笔记内容',
    NoteCategory category = NoteCategory.idea,
  }) =>
      Note(
        id: id,
        projectId: projectId,
        title: title,
        content: content,
        category: category,
        createdAt: now,
        updatedAt: now,
      );

  KnowledgeBaseBloc buildBloc({
    InMemoryCharacterRepository? characterRepository,
    InMemorySettingEntryRepository? settingEntryRepository,
    InMemoryNoteRepository? noteRepository,
  }) =>
      KnowledgeBaseBloc(
        characterRepository:
            characterRepository ?? InMemoryCharacterRepository(),
        settingEntryRepository:
            settingEntryRepository ?? InMemorySettingEntryRepository(),
        noteRepository: noteRepository ?? InMemoryNoteRepository(),
        eventBus: AppEventBus(),
      );

  /// Pre-load the knowledge base for a project so the bloc has data in state.
  Future<void> loadKnowledgeBase(KnowledgeBaseBloc bloc) async {
    bloc.add(const KnowledgeBaseLoaded(projectId));
    await expectLater(
      bloc.stream,
      emitsThrough(
        isA<KnowledgeBaseState>()
            .having((s) => s.isLoading, 'isLoading', isFalse),
      ),
    );
  }

  group('KnowledgeBaseBloc', () {
    test('initial state has empty lists and characters tab active', () {
      final bloc = buildBloc();
      addTearDown(bloc.close);

      expect(bloc.state.isLoading, isFalse);
      expect(bloc.state.characters, isEmpty);
      expect(bloc.state.settingEntries, isEmpty);
      expect(bloc.state.notes, isEmpty);
      expect(bloc.state.activeTab, KnowledgeBaseTab.characters);
      expect(bloc.state.error, isNull);
    });

    test('KnowledgeBaseLoaded loads all characters, settings, and notes',
        () async {
      final characterRepo = InMemoryCharacterRepository();
      final settingRepo = InMemorySettingEntryRepository();
      final noteRepo = InMemoryNoteRepository();

      final char = buildCharacter();
      final setting = buildSettingEntry();
      final note = buildNote();

      await characterRepo.create(char);
      await settingRepo.create(setting);
      await noteRepo.create(note);

      final bloc = buildBloc(
        characterRepository: characterRepo,
        settingEntryRepository: settingRepo,
        noteRepository: noteRepo,
      );
      addTearDown(bloc.close);

      bloc.add(const KnowledgeBaseLoaded(projectId));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.isLoading, 'isLoading', isFalse)
              .having((s) => s.characters.length, 'characters length', 1)
              .having((s) => s.characters.first.id, 'character id', char.id)
              .having(
                  (s) => s.settingEntries.length, 'settings length', 1)
              .having((s) => s.settingEntries.first.id, 'setting id',
                  setting.id)
              .having((s) => s.notes.length, 'notes length', 1)
              .having((s) => s.notes.first.id, 'note id', note.id),
        ),
      );
    });

    test('KnowledgeBaseLoaded sets isLoading true during loading', () async {
      final bloc = buildBloc();
      addTearDown(bloc.close);

      bloc.add(const KnowledgeBaseLoaded(projectId));

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<KnowledgeBaseState>()
              .having((s) => s.isLoading, 'isLoading', isTrue),
          isA<KnowledgeBaseState>()
              .having((s) => s.isLoading, 'isLoading', isFalse),
        ]),
      );
    });

    test('CharacterCreated adds character and reloads list', () async {
      final characterRepo = InMemoryCharacterRepository();
      // Pre-seed so _reloadFromProject triggers (lists must be non-empty)
      final existingChar = buildCharacter(id: 'char-existing', name: '已有角色');
      await characterRepo.create(existingChar);

      final bloc = buildBloc(characterRepository: characterRepo);
      addTearDown(bloc.close);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.characters.length, 1);

      final newChar = buildCharacter(id: 'char-new', name: '新角色');
      bloc.add(CharacterCreated(newChar));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.characters.length, 'characters length', 2)
              .having(
                (s) =>
                    s.characters.where((c) => c.id == 'char-new').length,
                'contains new character',
                1,
              ),
        ),
      );
    });

    test('CharacterUpdated updates character and reloads list', () async {
      final characterRepo = InMemoryCharacterRepository();
      final bloc = buildBloc(characterRepository: characterRepo);
      addTearDown(bloc.close);

      final char = buildCharacter();
      await characterRepo.create(char);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.characters.length, 1);

      final updatedChar = char.copyWith(name: '角色B');
      bloc.add(CharacterUpdated(updatedChar));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.characters.length, 'characters length', 1)
              .having((s) => s.characters.first.name, 'character name',
                  '角色B'),
        ),
      );
    });

    test('CharacterDeleted removes character from list', () async {
      final characterRepo = InMemoryCharacterRepository();
      final bloc = buildBloc(characterRepository: characterRepo);
      addTearDown(bloc.close);

      final char = buildCharacter();
      await characterRepo.create(char);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.characters.length, 1);

      bloc.add(CharacterDeleted(char.id));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.characters, 'characters', isEmpty),
        ),
      );
    });

    test('SettingEntryCreated adds entry and reloads list', () async {
      final settingRepo = InMemorySettingEntryRepository();
      // Pre-seed so _reloadFromProject triggers
      final existingEntry =
          buildSettingEntry(id: 'setting-existing', title: '已有设定');
      await settingRepo.create(existingEntry);

      final bloc = buildBloc(settingEntryRepository: settingRepo);
      addTearDown(bloc.close);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.settingEntries.length, 1);

      final newEntry =
          buildSettingEntry(id: 'setting-new', title: '新设定');
      bloc.add(SettingEntryCreated(newEntry));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having(
                  (s) => s.settingEntries.length, 'settings length', 2)
              .having(
                (s) => s.settingEntries
                    .where((e) => e.id == 'setting-new').length,
                'contains new entry',
                1,
              ),
        ),
      );
    });

    test('SettingEntryUpdated updates entry and reloads list', () async {
      final settingRepo = InMemorySettingEntryRepository();
      final bloc = buildBloc(settingEntryRepository: settingRepo);
      addTearDown(bloc.close);

      final entry = buildSettingEntry();
      await settingRepo.create(entry);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.settingEntries.length, 1);

      final updatedEntry = entry.copyWith(title: '设定B');
      bloc.add(SettingEntryUpdated(updatedEntry));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.settingEntries.length, 'settings length', 1)
              .having((s) => s.settingEntries.first.title, 'setting title',
                  '设定B'),
        ),
      );
    });

    test('SettingEntryDeleted removes entry from list', () async {
      final settingRepo = InMemorySettingEntryRepository();
      final bloc = buildBloc(settingEntryRepository: settingRepo);
      addTearDown(bloc.close);

      final entry = buildSettingEntry();
      await settingRepo.create(entry);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.settingEntries.length, 1);

      bloc.add(SettingEntryDeleted(entry.id));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.settingEntries, 'settings', isEmpty),
        ),
      );
    });

    test('NoteCreated adds note and reloads list', () async {
      final noteRepo = InMemoryNoteRepository();
      // Pre-seed so _reloadFromProject triggers
      final existingNote = buildNote(id: 'note-existing', title: '已有笔记');
      await noteRepo.create(existingNote);

      final bloc = buildBloc(noteRepository: noteRepo);
      addTearDown(bloc.close);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.notes.length, 1);

      final newNote = buildNote(id: 'note-new', title: '新笔记');
      bloc.add(NoteCreated(newNote));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.notes.length, 'notes length', 2)
              .having(
                (s) =>
                    s.notes.where((n) => n.id == 'note-new').length,
                'contains new note',
                1,
              ),
        ),
      );
    });

    test('NoteUpdated updates note and reloads list', () async {
      final noteRepo = InMemoryNoteRepository();
      final bloc = buildBloc(noteRepository: noteRepo);
      addTearDown(bloc.close);

      final note = buildNote();
      await noteRepo.create(note);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.notes.length, 1);

      final updatedNote = note.copyWith(title: '笔记B');
      bloc.add(NoteUpdated(updatedNote));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.notes.length, 'notes length', 1)
              .having(
                  (s) => s.notes.first.title, 'note title', '笔记B'),
        ),
      );
    });

    test('NoteDeleted removes note from list', () async {
      final noteRepo = InMemoryNoteRepository();
      final bloc = buildBloc(noteRepository: noteRepo);
      addTearDown(bloc.close);

      final note = buildNote();
      await noteRepo.create(note);
      await loadKnowledgeBase(bloc);

      expect(bloc.state.notes.length, 1);

      bloc.add(NoteDeleted(note.id));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>()
              .having((s) => s.notes, 'notes', isEmpty),
        ),
      );
    });

    test('TabChanged updates activeTab', () async {
      final bloc = buildBloc();
      addTearDown(bloc.close);

      expect(bloc.state.activeTab, KnowledgeBaseTab.characters);

      bloc.add(const TabChanged(KnowledgeBaseTab.settings));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>().having(
            (s) => s.activeTab,
            'activeTab',
            KnowledgeBaseTab.settings,
          ),
        ),
      );

      bloc.add(const TabChanged(KnowledgeBaseTab.notes));

      await expectLater(
        bloc.stream,
        emitsThrough(
          isA<KnowledgeBaseState>().having(
            (s) => s.activeTab,
            'activeTab',
            KnowledgeBaseTab.notes,
          ),
        ),
      );
    });
  });
}
