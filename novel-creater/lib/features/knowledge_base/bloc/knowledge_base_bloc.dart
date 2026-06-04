import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';

part 'knowledge_base_event.dart';
part 'knowledge_base_state.dart';

class KnowledgeBaseBloc extends Bloc<KnowledgeBaseEvent, KnowledgeBaseState> {
  KnowledgeBaseBloc({
    required CharacterRepository characterRepository,
    required NoteRepository noteRepository,
    required SettingEntryRepository settingEntryRepository,
    required OutlineNodeRepository outlineNodeRepository,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _characterRepository = characterRepository,
        _noteRepository = noteRepository,
        _settingEntryRepository = settingEntryRepository,
        _outlineNodeRepository = outlineNodeRepository,
        _idGenerator = idGenerator,
        _clock = clock,
        super(const KnowledgeBaseState()) {
    on<KnowledgeBaseStarted>(_onStarted);
    on<KnowledgeBaseQueryChanged>(_onQueryChanged);
    on<KnowledgeCharacterCreated>(_onCharacterCreated);
    on<KnowledgeCharacterUpdated>(_onCharacterUpdated);
    on<KnowledgeCharacterDeleted>(_onCharacterDeleted);
    on<KnowledgeNoteCreated>(_onNoteCreated);
    on<KnowledgeNoteUpdated>(_onNoteUpdated);
    on<KnowledgeNoteDeleted>(_onNoteDeleted);
    on<KnowledgeSettingEntryCreated>(_onSettingEntryCreated);
    on<KnowledgeSettingEntryUpdated>(_onSettingEntryUpdated);
    on<KnowledgeSettingEntryDeleted>(_onSettingEntryDeleted);
    on<KnowledgeOutlineNodeCreated>(_onOutlineNodeCreated);
    on<KnowledgeOutlineNodeUpdated>(_onOutlineNodeUpdated);
    on<KnowledgeOutlineNodeDeleted>(_onOutlineNodeDeleted);
  }

  final CharacterRepository _characterRepository;
  final NoteRepository _noteRepository;
  final SettingEntryRepository _settingEntryRepository;
  final OutlineNodeRepository _outlineNodeRepository;
  final IdGenerator _idGenerator;
  final AppClock _clock;

  Future<void> _onStarted(
    KnowledgeBaseStarted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    emit(
      state.copyWith(
        projectId: event.projectId,
        isLoading: true,
      ),
    );

    final charactersResult =
        await _characterRepository.getByProjectId(event.projectId);
    if (charactersResult.isFailure) {
      emit(_failureState(charactersResult.maybeFailure));
      return;
    }

    final notesResult = await _noteRepository.getByProjectId(event.projectId);
    if (notesResult.isFailure) {
      emit(_failureState(notesResult.maybeFailure));
      return;
    }

    final settingsResult =
        await _settingEntryRepository.getByProjectId(event.projectId);
    if (settingsResult.isFailure) {
      emit(_failureState(settingsResult.maybeFailure));
      return;
    }

    final outlinesResult =
        await _outlineNodeRepository.getByProjectId(event.projectId);
    if (outlinesResult.isFailure) {
      emit(_failureState(outlinesResult.maybeFailure));
      return;
    }

    final characters = charactersResult.maybeSuccess ?? const <Character>[];
    final notes = notesResult.maybeSuccess ?? const <Note>[];
    final settings = settingsResult.maybeSuccess ?? const <SettingEntry>[];
    final outlines = List<OutlineNode>.from(
      outlinesResult.maybeSuccess ?? const <OutlineNode>[],
    )..sort((a, b) => a.order.compareTo(b.order));

    emit(
      state.copyWith(
        characters: characters,
        notes: notes,
        settingEntries: settings,
        outlineNodes: outlines,
        isLoading: false,
      ),
    );
  }

  void _onQueryChanged(
    KnowledgeBaseQueryChanged event,
    Emitter<KnowledgeBaseState> emit,
  ) {
    emit(state.copyWith(query: event.query));
  }

  Future<void> _onCharacterCreated(
    KnowledgeCharacterCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final name = event.name.trim();
    if (name.isEmpty) {
      emit(state.copyWith(error: '角色名称不能为空'));
      return;
    }

    final now = _clock.now();
    final character = Character(
      id: _idGenerator.generate(),
      projectId: _requireProjectId(),
      name: name,
      description: event.description.trim(),
      tags: _parseTags(event.tags),
      createdAt: now,
      updatedAt: now,
    );
    final result = await _characterRepository.create(character);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        characters: [...state.characters, result.maybeSuccess!],
        lastMessage: '角色已创建',
      ),
    );
  }

  Future<void> _onCharacterUpdated(
    KnowledgeCharacterUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final name = event.name.trim();
    if (name.isEmpty) {
      emit(state.copyWith(error: '角色名称不能为空'));
      return;
    }

    final updated = event.character.copyWith(
      name: name,
      description: event.description.trim(),
      tags: _parseTags(event.tags),
      updatedAt: _clock.now(),
    );
    final result = await _characterRepository.update(updated);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        characters: _replaceById(state.characters, result.maybeSuccess!),
        lastMessage: '角色已更新',
      ),
    );
  }

  Future<void> _onCharacterDeleted(
    KnowledgeCharacterDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final result = await _characterRepository.delete(event.characterId);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        characters: state.characters
            .where((character) => character.id != event.characterId)
            .toList(),
        lastMessage: '角色已删除',
      ),
    );
  }

  Future<void> _onNoteCreated(
    KnowledgeNoteCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final title = event.title.trim();
    if (title.isEmpty) {
      emit(state.copyWith(error: '笔记标题不能为空'));
      return;
    }

    final now = _clock.now();
    final note = Note(
      id: _idGenerator.generate(),
      projectId: _requireProjectId(),
      title: title,
      content: event.content.trim(),
      type: event.type,
      sourceUrl: _emptyToNull(event.sourceUrl),
      tags: _parseTags(event.tags),
      createdAt: now,
      updatedAt: now,
    );
    final result = await _noteRepository.create(note);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        notes: [...state.notes, result.maybeSuccess!],
        lastMessage: '笔记已创建',
      ),
    );
  }

  Future<void> _onNoteUpdated(
    KnowledgeNoteUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final title = event.title.trim();
    if (title.isEmpty) {
      emit(state.copyWith(error: '笔记标题不能为空'));
      return;
    }

    final updated = event.note.copyWith(
      title: title,
      content: event.content.trim(),
      type: event.type,
      sourceUrl: _emptyToNull(event.sourceUrl),
      tags: _parseTags(event.tags),
      updatedAt: _clock.now(),
    );
    final result = await _noteRepository.update(updated);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        notes: _replaceById(state.notes, result.maybeSuccess!),
        lastMessage: '笔记已更新',
      ),
    );
  }

  Future<void> _onNoteDeleted(
    KnowledgeNoteDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final result = await _noteRepository.delete(event.noteId);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        notes: state.notes.where((note) => note.id != event.noteId).toList(),
        lastMessage: '笔记已删除',
      ),
    );
  }

  Future<void> _onSettingEntryCreated(
    KnowledgeSettingEntryCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final category = event.category.trim();
    final title = event.title.trim();
    if (category.isEmpty) {
      emit(state.copyWith(error: '设定分类不能为空'));
      return;
    }
    if (title.isEmpty) {
      emit(state.copyWith(error: '设定标题不能为空'));
      return;
    }

    final now = _clock.now();
    final entry = SettingEntry(
      id: _idGenerator.generate(),
      projectId: _requireProjectId(),
      category: category,
      title: title,
      content: event.content.trim(),
      tags: _parseTags(event.tags),
      createdAt: now,
      updatedAt: now,
    );
    final result = await _settingEntryRepository.create(entry);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        settingEntries: [...state.settingEntries, result.maybeSuccess!],
        lastMessage: '设定已创建',
      ),
    );
  }

  Future<void> _onSettingEntryUpdated(
    KnowledgeSettingEntryUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final category = event.category.trim();
    final title = event.title.trim();
    if (category.isEmpty) {
      emit(state.copyWith(error: '设定分类不能为空'));
      return;
    }
    if (title.isEmpty) {
      emit(state.copyWith(error: '设定标题不能为空'));
      return;
    }

    final updated = event.entry.copyWith(
      category: category,
      title: title,
      content: event.content.trim(),
      tags: _parseTags(event.tags),
      updatedAt: _clock.now(),
    );
    final result = await _settingEntryRepository.update(updated);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        settingEntries: _replaceById(
          state.settingEntries,
          result.maybeSuccess!,
        ),
        lastMessage: '设定已更新',
      ),
    );
  }

  Future<void> _onSettingEntryDeleted(
    KnowledgeSettingEntryDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final result = await _settingEntryRepository.delete(event.entryId);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        settingEntries: state.settingEntries
            .where((entry) => entry.id != event.entryId)
            .toList(),
        lastMessage: '设定已删除',
      ),
    );
  }

  Future<void> _onOutlineNodeCreated(
    KnowledgeOutlineNodeCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final title = event.title.trim();
    if (title.isEmpty) {
      emit(state.copyWith(error: '大纲标题不能为空'));
      return;
    }

    final now = _clock.now();
    final node = OutlineNode(
      id: _idGenerator.generate(),
      projectId: _requireProjectId(),
      order: state.outlineNodes.length,
      title: title,
      summary: event.summary.trim(),
      nodeType: event.nodeType,
      status: event.status,
      createdAt: now,
      updatedAt: now,
    );
    final result = await _outlineNodeRepository.create(node);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        outlineNodes: [...state.outlineNodes, result.maybeSuccess!],
        lastMessage: '大纲节点已创建',
      ),
    );
  }

  Future<void> _onOutlineNodeUpdated(
    KnowledgeOutlineNodeUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final title = event.title.trim();
    if (title.isEmpty) {
      emit(state.copyWith(error: '大纲标题不能为空'));
      return;
    }

    final updated = event.node.copyWith(
      title: title,
      summary: event.summary.trim(),
      nodeType: event.nodeType,
      status: event.status,
      updatedAt: _clock.now(),
    );
    final result = await _outlineNodeRepository.update(updated);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    final nodes = _replaceById(state.outlineNodes, result.maybeSuccess!)
      ..sort((a, b) => a.order.compareTo(b.order));
    emit(
      state.copyWith(
        outlineNodes: nodes,
        lastMessage: '大纲节点已更新',
      ),
    );
  }

  Future<void> _onOutlineNodeDeleted(
    KnowledgeOutlineNodeDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    final result = await _outlineNodeRepository.delete(event.nodeId);
    if (result.isFailure) {
      emit(_failureState(result.maybeFailure));
      return;
    }
    emit(
      state.copyWith(
        outlineNodes: state.outlineNodes
            .where((node) => node.id != event.nodeId)
            .toList(),
        lastMessage: '大纲节点已删除',
      ),
    );
  }

  KnowledgeBaseState _failureState(AppError? error) => state.copyWith(
        isLoading: false,
        error: error?.userMessage ?? '知识库操作失败',
      );

  String _requireProjectId() {
    final projectId = state.projectId;
    if (projectId == null || projectId.isEmpty) {
      throw StateError('KnowledgeBaseBloc must be started before writes.');
    }
    return projectId;
  }

  List<String> _parseTags(String input) => input
      .replaceAll('\uFF0C', ',')
      .split(RegExp(r'[,\s]+'))
      .map((tag) => tag.trim())
      .where((tag) => tag.isNotEmpty)
      .toList();

  String? _emptyToNull(String input) {
    final trimmed = input.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  List<T> _replaceById<T>(List<T> items, T updated) {
    String idOf(T item) => switch (item) {
          Character(:final id) => id,
          Note(:final id) => id,
          SettingEntry(:final id) => id,
          OutlineNode(:final id) => id,
          _ => throw ArgumentError('Unsupported knowledge item type'),
        };

    return items
        .map((item) => idOf(item) == idOf(updated) ? updated : item)
        .toList();
  }
}
