import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/mock_writing_tool.dart';
import 'package:novel_creator/agent/provider_resolver.dart';
import 'package:novel_creator/agent/real_llm_writing_tool.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/drift_chapter_repository.dart';
import 'package:novel_creator/data/repositories/drift_character_repository.dart';
import 'package:novel_creator/data/repositories/drift_llm_provider_repository.dart';
import 'package:novel_creator/data/repositories/drift_note_repository.dart';
import 'package:novel_creator/data/repositories/drift_project_repository.dart';
import 'package:novel_creator/data/repositories/drift_revision_repository.dart';
import 'package:novel_creator/data/repositories/drift_search_repository.dart';
import 'package:novel_creator/data/repositories/drift_session_repository.dart';
import 'package:novel_creator/data/repositories/drift_setting_entry_repository.dart';
import 'package:novel_creator/data/repositories/drift_snapshot_repository.dart';
import 'package:novel_creator/data/secure/in_memory_secret_storage.dart';
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/repositories/search_repository.dart';
import 'package:novel_creator/domain/repositories/session_repository.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/repositories/snapshot_repository.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/infra/llm/openai_compatible_client.dart';
import 'package:novel_creator/infra/secure/flutter_secure_storage_adapter.dart';

final getIt = GetIt.instance;

/// Configures all application dependencies.
///
/// Call once at app startup after [AppDatabase] is available.
void configureDependencies(AppDatabase db) {
  // --- Core ---
  getIt.registerSingleton<AppEventBus>(AppEventBus());

  // --- Infrastructure ---
  getIt.registerSingleton<SecretStorage>(_buildSecretStorage());
  getIt.registerSingleton<LlmClient>(OpenAiCompatibleClient());

  // --- Repositories (Drift) ---
  getIt.registerSingleton<ProjectRepository>(
    DriftProjectRepository(db),
  );
  getIt.registerSingleton<ChapterRepository>(
    DriftChapterRepository(db),
  );
  getIt.registerSingleton<RevisionRepository>(
    DriftRevisionRepository(db),
  );
  getIt.registerSingleton<LlmProviderRepository>(
    DriftLlmProviderRepository(db),
  );
  getIt.registerSingleton<CharacterRepository>(
    DriftCharacterRepository(db),
  );
  getIt.registerSingleton<SettingEntryRepository>(
    DriftSettingEntryRepository(db),
  );
  getIt.registerSingleton<NoteRepository>(
    DriftNoteRepository(db),
  );
  getIt.registerSingleton<SearchRepository>(
    DriftSearchRepository(db),
  );
  getIt.registerSingleton<SessionRepository>(
    DriftSessionRepository(db),
  );
  getIt.registerSingleton<SnapshotRepository>(
    DriftSnapshotRepository(db),
  );

  // --- Agent (依赖 Repositories，必须在之后注册) ---
  getIt.registerSingleton<ProviderResolver>(
    ProviderResolver(
      repository: getIt<LlmProviderRepository>(),
      secretStorage: getIt<SecretStorage>(),
    ),
  );
  getIt.registerSingleton<AgentWritingTool>(
    RealLlmWritingTool(
      client: getIt<LlmClient>(),
      resolver: getIt<ProviderResolver>(),
    ),
  );
}

SecretStorage _buildSecretStorage() {
  if (kIsWeb) {
    return InMemorySecretStorage();
  }
  return FlutterSecureStorageAdapter();
}
