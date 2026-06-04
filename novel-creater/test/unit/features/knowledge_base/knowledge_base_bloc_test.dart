import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';

void main() {
  final fixedNow = DateTime(2026, 6, 4, 12);
  late _FakeCharacterRepository characterRepository;
  late _FakeNoteRepository noteRepository;
  late _FakeSettingEntryRepository settingEntryRepository;
  late _FakeOutlineNodeRepository outlineNodeRepository;
  late KnowledgeBaseBloc bloc;

  setUp(() {
    characterRepository = _FakeCharacterRepository();
    noteRepository = _FakeNoteRepository();
    settingEntryRepository = _FakeSettingEntryRepository();
    outlineNodeRepository = _FakeOutlineNodeRepository();
    bloc = KnowledgeBaseBloc(
      characterRepository: characterRepository,
      noteRepository: noteRepository,
      settingEntryRepository: settingEntryRepository,
      outlineNodeRepository: outlineNodeRepository,
      idGenerator: const _FixedIdGenerator(),
      clock: FixedClock(fixedNow),
    );
  });

  tearDown(() async {
    await bloc.close();
  });

  group('KnowledgeBaseBloc', () {
    test('loads knowledge entries and sorted outline nodes', () async {
      characterRepository.characters['character-1'] = _character(
        id: 'character-1',
        name: '林白',
      );
      noteRepository.notes['note-1'] = _note(id: 'note-1', title: '雨夜线索');
      settingEntryRepository.entries['setting-1'] = _settingEntry(
        id: 'setting-1',
        title: '旧城档案馆',
      );
      outlineNodeRepository.nodes['node-2'] = _outlineNode(
        id: 'node-2',
        order: 2,
        title: '第二幕',
      );
      outlineNodeRepository.nodes['node-1'] = _outlineNode(
        id: 'node-1',
        order: 1,
        title: '第一幕',
      );

      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      expect(bloc.state.characters.single.name, '林白');
      expect(bloc.state.notes.single.title, '雨夜线索');
      expect(bloc.state.settingEntries.single.title, '旧城档案馆');
      expect(bloc.state.outlineNodes.map((node) => node.id), [
        'node-1',
        'node-2',
      ]);
    });

    test('creates updates and deletes a character through repository',
        () async {
      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      bloc.add(
        const KnowledgeCharacterCreated(
          name: '  林白  ',
          description: '档案馆管理员',
          tags: '主角, 档案',
        ),
      );
      await bloc.stream.firstWhere((state) => state.characters.isNotEmpty);

      final created = bloc.state.characters.single;
      expect(created.id, 'fixed-id-1');
      expect(created.name, '林白');
      expect(created.tags, ['主角', '档案']);
      expect(characterRepository.characters[created.id], created);

      bloc.add(
        KnowledgeCharacterUpdated(
          character: created,
          name: '林白川',
          description: '临时调查员',
          tags: '主角',
        ),
      );
      await bloc.stream.firstWhere(
        (state) => state.characters.single.name == '林白川',
      );

      bloc.add(KnowledgeCharacterDeleted(characterId: created.id));
      await bloc.stream.firstWhere((state) => state.characters.isEmpty);

      expect(characterRepository.characters, isEmpty);
    });

    test('creates note and outline node with normalized fields', () async {
      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      bloc
        ..add(
          const KnowledgeNoteCreated(
            title: ' 调研摘录 ',
            content: '城市档案馆闭馆时间',
            sourceUrl: ' https://example.test ',
            tags: '调研 素材',
          ),
        )
        ..add(
          const KnowledgeOutlineNodeCreated(
            title: ' 第一章 ',
            summary: '雨夜来信',
          ),
        );

      await bloc.stream.firstWhere((state) => state.notes.isNotEmpty);
      await bloc.stream.firstWhere((state) => state.outlineNodes.isNotEmpty);

      expect(bloc.state.notes.single.title, '调研摘录');
      expect(bloc.state.notes.single.sourceUrl, 'https://example.test');
      expect(bloc.state.outlineNodes.single.order, 0);
      expect(bloc.state.outlineNodes.single.title, '第一章');
    });

    test('creates updates and deletes a setting entry', () async {
      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      bloc.add(
        const KnowledgeSettingEntryCreated(
          category: ' 地理 ',
          title: ' 旧城档案馆 ',
          content: '雨夜开放的公共建筑',
          tags: '地点,线索',
        ),
      );
      await bloc.stream.firstWhere((state) => state.settingEntries.isNotEmpty);

      final created = bloc.state.settingEntries.single;
      expect(created.category, '地理');
      expect(created.title, '旧城档案馆');
      expect(created.tags, ['地点', '线索']);

      bloc.add(
        KnowledgeSettingEntryUpdated(
          entry: created,
          category: '规则',
          title: '档案馆门禁',
          content: '闭馆后需要临时通行证',
          tags: '规则',
        ),
      );
      await bloc.stream.firstWhere(
        (state) => state.settingEntries.single.category == '规则',
      );

      bloc.add(KnowledgeSettingEntryDeleted(entryId: created.id));
      await bloc.stream.firstWhere((state) => state.settingEntries.isEmpty);

      expect(settingEntryRepository.entries, isEmpty);
    });

    test('load failure enters displayable error state', () async {
      characterRepository.shouldFailLoad = true;

      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      expect(bloc.state.error, 'Failed to load characters');
      expect(bloc.state.characters, isEmpty);
    });

    test('empty character name is rejected before repository write', () async {
      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      bloc.add(const KnowledgeCharacterCreated(name: '   '));
      await bloc.stream.firstWhere((state) => state.error != null);

      expect(characterRepository.characters, isEmpty);
      expect(bloc.state.error, '角色名称不能为空');
    });

    test('query filters characters notes and outline nodes', () async {
      characterRepository.characters['character-1'] = _character(
        id: 'character-1',
        name: '林白',
        tags: ['档案'],
      );
      noteRepository.notes['note-1'] = _note(
        id: 'note-1',
        title: '雨夜线索',
        content: '旧档案',
      );
      outlineNodeRepository.nodes['node-1'] = _outlineNode(
        id: 'node-1',
        title: '档案馆',
        summary: '主角进入旧楼',
      );
      settingEntryRepository.entries['setting-1'] = _settingEntry(
        id: 'setting-1',
        category: '地点',
        title: '旧档案馆',
        content: '藏有旧档案',
      );

      bloc.add(const KnowledgeBaseStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);
      bloc.add(const KnowledgeBaseQueryChanged(query: '档案'));
      await bloc.stream.firstWhere((state) => state.query == '档案');

      expect(bloc.state.filteredCharacters, hasLength(1));
      expect(bloc.state.filteredNotes, hasLength(1));
      expect(bloc.state.filteredSettingEntries, hasLength(1));
      expect(bloc.state.filteredOutlineNodes, hasLength(1));
    });
  });
}

Character _character({
  required String id,
  String name = '角色',
  List<String> tags = const [],
}) {
  final now = DateTime(2026, 6, 4);
  return Character(
    id: id,
    projectId: 'project-1',
    name: name,
    tags: tags,
    createdAt: now,
    updatedAt: now,
  );
}

Note _note({
  required String id,
  String title = '笔记',
  String content = '',
}) {
  final now = DateTime(2026, 6, 4);
  return Note(
    id: id,
    projectId: 'project-1',
    title: title,
    content: content,
    createdAt: now,
    updatedAt: now,
  );
}

SettingEntry _settingEntry({
  required String id,
  String category = '地理',
  String title = '设定',
  String content = '',
  List<String> tags = const [],
}) {
  final now = DateTime(2026, 6, 4);
  return SettingEntry(
    id: id,
    projectId: 'project-1',
    category: category,
    title: title,
    content: content,
    tags: tags,
    createdAt: now,
    updatedAt: now,
  );
}

OutlineNode _outlineNode({
  required String id,
  int order = 0,
  String title = '大纲',
  String summary = '',
}) {
  final now = DateTime(2026, 6, 4);
  return OutlineNode(
    id: id,
    projectId: 'project-1',
    order: order,
    title: title,
    summary: summary,
    createdAt: now,
    updatedAt: now,
  );
}

class _FixedIdGenerator extends IdGenerator {
  const _FixedIdGenerator();

  @override
  String generate() => 'fixed-id-1';
}

class _FakeCharacterRepository implements CharacterRepository {
  final characters = <String, Character>{};
  bool shouldFailLoad = false;

  @override
  Future<AppResult<Character>> create(Character character) async {
    characters[character.id] = character;
    return AppResult.success(character);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    characters.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Character>> getById(String id) async {
    final character = characters[id];
    if (character == null) return const AppResult.failure(_notFound);
    return AppResult.success(character);
  }

  @override
  Future<AppResult<List<Character>>> getByProjectId(String projectId) async {
    if (shouldFailLoad) return const AppResult.failure(_loadCharactersFailed);
    return AppResult.success(
      characters.values
          .where((character) => character.projectId == projectId)
          .toList(),
    );
  }

  @override
  Future<AppResult<Character>> update(Character character) async {
    characters[character.id] = character;
    return AppResult.success(character);
  }
}

class _FakeNoteRepository implements NoteRepository {
  final notes = <String, Note>{};

  @override
  Future<AppResult<Note>> create(Note note) async {
    notes[note.id] = note;
    return AppResult.success(note);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    notes.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Note>> getById(String id) async {
    final note = notes[id];
    if (note == null) return const AppResult.failure(_notFound);
    return AppResult.success(note);
  }

  @override
  Future<AppResult<List<Note>>> getByProjectId(String projectId) async =>
      AppResult.success(
        notes.values.where((note) => note.projectId == projectId).toList(),
      );

  @override
  Future<AppResult<List<Note>>> getByType(
    String projectId,
    NoteType type,
  ) async =>
      AppResult.success(
        notes.values
            .where((note) => note.projectId == projectId && note.type == type)
            .toList(),
      );

  @override
  Future<AppResult<Note>> update(Note note) async {
    notes[note.id] = note;
    return AppResult.success(note);
  }
}

class _FakeSettingEntryRepository implements SettingEntryRepository {
  final entries = <String, SettingEntry>{};

  @override
  Future<AppResult<SettingEntry>> create(SettingEntry entry) async {
    entries[entry.id] = entry;
    return AppResult.success(entry);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    entries.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<SettingEntry>> getById(String id) async {
    final entry = entries[id];
    if (entry == null) return const AppResult.failure(_notFound);
    return AppResult.success(entry);
  }

  @override
  Future<AppResult<List<SettingEntry>>> getByCategory(
    String projectId,
    String category,
  ) async =>
      AppResult.success(
        entries.values
            .where(
              (entry) =>
                  entry.projectId == projectId && entry.category == category,
            )
            .toList(),
      );

  @override
  Future<AppResult<List<SettingEntry>>> getByProjectId(
    String projectId,
  ) async =>
      AppResult.success(
        entries.values.where((entry) => entry.projectId == projectId).toList(),
      );

  @override
  Future<AppResult<SettingEntry>> update(SettingEntry entry) async {
    entries[entry.id] = entry;
    return AppResult.success(entry);
  }
}

class _FakeOutlineNodeRepository implements OutlineNodeRepository {
  final nodes = <String, OutlineNode>{};

  @override
  Future<AppResult<OutlineNode>> create(OutlineNode node) async {
    nodes[node.id] = node;
    return AppResult.success(node);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    nodes.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<OutlineNode>> getById(String id) async {
    final node = nodes[id];
    if (node == null) return const AppResult.failure(_notFound);
    return AppResult.success(node);
  }

  @override
  Future<AppResult<List<OutlineNode>>> getByProjectId(String projectId) async =>
      AppResult.success(
        nodes.values.where((node) => node.projectId == projectId).toList(),
      );

  @override
  Future<AppResult<void>> reorder(
    String projectId,
    List<String> orderedIds,
  ) async =>
      const AppResult.success(null);

  @override
  Future<AppResult<OutlineNode>> update(OutlineNode node) async {
    nodes[node.id] = node;
    return AppResult.success(node);
  }
}

const _notFound = AppError(
  code: 'NOT_FOUND',
  message: 'Not found',
  userMessage: 'Not found',
  recoverable: false,
  source: AppErrorSource.storage,
);

const _loadCharactersFailed = AppError(
  code: 'STORAGE_ERROR',
  message: 'Failed to load characters',
  userMessage: 'Failed to load characters',
  source: AppErrorSource.storage,
);
