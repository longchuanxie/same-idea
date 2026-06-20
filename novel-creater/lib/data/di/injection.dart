import 'package:get_it/get_it.dart';
import 'package:novel_creator/agent/tools/tools.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/core/secure_storage.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/agent_task_repository_impl.dart';
import 'package:novel_creator/data/repositories/chapter_repository_impl.dart';
import 'package:novel_creator/data/repositories/character_repository_impl.dart';
import 'package:novel_creator/data/repositories/note_repository_impl.dart';
import 'package:novel_creator/data/repositories/outline_node_repository_impl.dart';
import 'package:novel_creator/data/repositories/project_repository_impl.dart';
import 'package:novel_creator/data/repositories/revision_repository_impl.dart';
import 'package:novel_creator/data/repositories/session_repository_impl.dart';
import 'package:novel_creator/data/repositories/setting_entry_repository_impl.dart';
import 'package:novel_creator/data/repositories/settings_repository_impl.dart';
import 'package:novel_creator/data/repositories/snapshot_repository_impl.dart';
import 'package:novel_creator/domain/repositories/agent_task_repository.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/repositories/outline_node_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/repositories/session_repository.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/repositories/settings_repository.dart';
import 'package:novel_creator/domain/repositories/snapshot_repository.dart';
import 'package:novel_creator/editor/revision/revision.dart';
import 'package:novel_creator/features/export/services/export_service.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/projects/bloc/create_project_bloc.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/agent_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/editor_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/research_bloc.dart';
import 'package:novel_creator/infra/llm/llm.dart';
import 'package:novel_creator/infra/search/search.dart';

final locator = GetIt.instance;

Future<void> configureDependencies() async {
  locator
    ..registerSingleton<IdGenerator>(const IdGenerator())
    ..registerSingleton<AppClock>(const SystemClock())
    ..registerSingleton<AppDatabase>(AppDatabase())
    ..registerSingleton<SecureStorage>(
      InMemorySecureStorage(),
    )
    ..registerSingleton<LlmClient>(
      const MockLlmClient(),
    )
    ..registerSingleton<SearchProvider>(
      MockSearchProvider(
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerSingleton<ResultInterpreter>(
      const ResultInterpreter(),
    )
    ..registerSingleton<ToolRegistry>(
      ToolRegistry(),
    )
    ..registerSingleton<ProjectRepository>(
      ProjectRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<ChapterRepository>(
      ChapterRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<RevisionRepository>(
      RevisionRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<OutlineNodeRepository>(
      OutlineNodeRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<CharacterRepository>(
      CharacterRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<NoteRepository>(
      NoteRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<SettingEntryRepository>(
      SettingEntryRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<SessionRepository>(
      SessionRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<AgentTaskRepository>(
      AgentTaskRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<SnapshotRepository>(
      SnapshotRepositoryImpl(locator<AppDatabase>()),
    )
    ..registerSingleton<SettingsRepository>(
      SettingsRepositoryImpl(
        locator<AppDatabase>(),
        locator<SecureStorage>(),
      ),
    )
    ..registerSingleton<ExportService>(
      ExportService(
        projectRepository: locator<ProjectRepository>(),
        chapterRepository: locator<ChapterRepository>(),
      ),
    )
    ..registerSingleton<RevisionService>(
      RevisionService(
        chapterRepository: locator<ChapterRepository>(),
        revisionRepository: locator<RevisionRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<ProjectListBloc>(
      () => ProjectListBloc(
        projectRepository: locator<ProjectRepository>(),
      ),
    )
    ..registerFactory<CreateProjectBloc>(
      () => CreateProjectBloc(
        projectRepository: locator<ProjectRepository>(),
        chapterRepository: locator<ChapterRepository>(),
        outlineNodeRepository: locator<OutlineNodeRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<ChapterTreeBloc>(
      () => ChapterTreeBloc(
        chapterRepository: locator<ChapterRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<EditorBloc>(
      () => EditorBloc(
        chapterRepository: locator<ChapterRepository>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<AgentBloc>(
      () => AgentBloc(
        sessionRepository: locator<SessionRepository>(),
        agentTaskRepository: locator<AgentTaskRepository>(),
        llmClient: locator<LlmClient>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<KnowledgeBaseBloc>(
      () => KnowledgeBaseBloc(
        characterRepository: locator<CharacterRepository>(),
        noteRepository: locator<NoteRepository>(),
        settingEntryRepository: locator<SettingEntryRepository>(),
        outlineNodeRepository: locator<OutlineNodeRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    )
    ..registerFactory<ResearchBloc>(
      () => ResearchBloc(
        searchProvider: locator<SearchProvider>(),
        noteRepository: locator<NoteRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
    );
}
