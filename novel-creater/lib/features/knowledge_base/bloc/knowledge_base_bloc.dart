import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/events/domain_events.dart' as domain_events;
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_state.dart';

export 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_state.dart';

class KnowledgeBaseBloc
    extends Bloc<KnowledgeBaseEvent, KnowledgeBaseState> {
  KnowledgeBaseBloc({
    required CharacterRepository characterRepository,
    required SettingEntryRepository settingEntryRepository,
    required NoteRepository noteRepository,
    required AppEventBus eventBus,
  })  : _characterRepository = characterRepository,
        _settingEntryRepository = settingEntryRepository,
        _noteRepository = noteRepository,
        _eventBus = eventBus,
        super(const KnowledgeBaseState.initial()) {
    on<KnowledgeBaseLoaded>(_onKnowledgeBaseLoaded);
    on<CharacterCreated>(_onCharacterCreated);
    on<CharacterUpdated>(_onCharacterUpdated);
    on<CharacterDeleted>(_onCharacterDeleted);
    on<SettingEntryCreated>(_onSettingEntryCreated);
    on<SettingEntryUpdated>(_onSettingEntryUpdated);
    on<SettingEntryDeleted>(_onSettingEntryDeleted);
    on<NoteCreated>(_onNoteCreated);
    on<NoteUpdated>(_onNoteUpdated);
    on<NoteDeleted>(_onNoteDeleted);
    on<TabChanged>(_onTabChanged);
  }

  final CharacterRepository _characterRepository;
  final SettingEntryRepository _settingEntryRepository;
  final NoteRepository _noteRepository;
  final AppEventBus _eventBus;

  Future<void> _onKnowledgeBaseLoaded(
    KnowledgeBaseLoaded event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    try {
      final results = await Future.wait([
        _characterRepository.list(event.projectId),
        _settingEntryRepository.list(event.projectId),
        _noteRepository.list(event.projectId),
      ]);

      final charResult =
          results[0] as AppResult<List<Character>>;
      final settingResult =
          results[1] as AppResult<List<SettingEntry>>;
      final noteResult = results[2] as AppResult<List<Note>>;

      if (charResult case AppFailure(:final error)) {
        emit(state.copyWith(isLoading: false, error: error));
        return;
      }
      if (settingResult case AppFailure(:final error)) {
        emit(state.copyWith(isLoading: false, error: error));
        return;
      }
      if (noteResult case AppFailure(:final error)) {
        emit(state.copyWith(isLoading: false, error: error));
        return;
      }

      emit(
        state.copyWith(
          isLoading: false,
          characters: (charResult as AppSuccess<List<Character>>).value,
          settingEntries:
              (settingResult as AppSuccess<List<SettingEntry>>).value,
          notes: (noteResult as AppSuccess<List<Note>>).value,
        ),
      );
    } catch (e) {
      emit(
        state.copyWith(
          isLoading: false,
          error: AppError(
            code: 'knowledge_base.load_failed',
            message: e.toString(),
            userMessage: '加载知识库数据失败',
            source: AppErrorSource.storage,
            recoverable: true,
          ),
        ),
      );
    }
  }

  Future<void> _onCharacterCreated(
    CharacterCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _characterRepository.create(event.character);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      await _reloadFromProject(emit, event.character.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.character_create_failed',
          message: e.toString(),
          userMessage: '创建角色失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onCharacterUpdated(
    CharacterUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _characterRepository.update(event.character);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      _eventBus.publish(
        domain_events.CharacterUpdated(
          projectId: event.character.projectId,
          characterId: event.character.id,
          characterName: event.character.name,
        ),
      );
      await _reloadFromProject(emit, event.character.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.character_update_failed',
          message: e.toString(),
          userMessage: '更新角色失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onCharacterDeleted(
    CharacterDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _characterRepository.delete(event.id);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      emit(state.copyWith(
        characters:
            state.characters.where((c) => c.id != event.id).toList(),
      ));
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.character_delete_failed',
          message: e.toString(),
          userMessage: '删除角色失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onSettingEntryCreated(
    SettingEntryCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result =
          await _settingEntryRepository.create(event.entry);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      await _reloadFromProject(emit, event.entry.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.setting_create_failed',
          message: e.toString(),
          userMessage: '创建设定失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onSettingEntryUpdated(
    SettingEntryUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result =
          await _settingEntryRepository.update(event.entry);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      await _reloadFromProject(emit, event.entry.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.setting_update_failed',
          message: e.toString(),
          userMessage: '更新设定失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onSettingEntryDeleted(
    SettingEntryDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _settingEntryRepository.delete(event.id);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      emit(state.copyWith(
        settingEntries: state.settingEntries
            .where((s) => s.id != event.id)
            .toList(),
      ));
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.setting_delete_failed',
          message: e.toString(),
          userMessage: '删除设定失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onNoteCreated(
    NoteCreated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _noteRepository.create(event.note);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      _eventBus.publish(
        domain_events.NoteCreated(
          projectId: event.note.projectId,
          noteId: event.note.id,
          noteTitle: event.note.title,
        ),
      );
      await _reloadFromProject(emit, event.note.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.note_create_failed',
          message: e.toString(),
          userMessage: '创建笔记失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onNoteUpdated(
    NoteUpdated event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _noteRepository.update(event.note);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      await _reloadFromProject(emit, event.note.projectId);
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.note_update_failed',
          message: e.toString(),
          userMessage: '更新笔记失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  Future<void> _onNoteDeleted(
    NoteDeleted event,
    Emitter<KnowledgeBaseState> emit,
  ) async {
    try {
      final result = await _noteRepository.delete(event.id);
      if (result case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
      emit(state.copyWith(
        notes: state.notes.where((n) => n.id != event.id).toList(),
      ));
    } catch (e) {
      emit(state.copyWith(
        error: AppError(
          code: 'knowledge_base.note_delete_failed',
          message: e.toString(),
          userMessage: '删除笔记失败',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      ));
    }
  }

  void _onTabChanged(TabChanged event, Emitter<KnowledgeBaseState> emit) {
    emit(state.copyWith(activeTab: event.tab));
  }

  Future<void> _reloadFromProject(
    Emitter<KnowledgeBaseState> emit,
    String projectId,
  ) async {
    if (state.characters.isNotEmpty ||
        state.settingEntries.isNotEmpty ||
        state.notes.isNotEmpty) {
      add(KnowledgeBaseLoaded(projectId));
    }
  }
}
