import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/agent_task_repository_impl.dart';
import 'package:novel_creator/data/repositories/chapter_repository_impl.dart';
import 'package:novel_creator/data/repositories/character_repository_impl.dart';
import 'package:novel_creator/data/repositories/note_repository_impl.dart';
import 'package:novel_creator/data/repositories/outline_node_repository_impl.dart';
import 'package:novel_creator/data/repositories/project_repository_impl.dart';
import 'package:novel_creator/data/repositories/revision_repository_impl.dart';
import 'package:novel_creator/data/repositories/session_repository_impl.dart';
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
import 'package:novel_creator/domain/repositories/settings_repository.dart';
import 'package:novel_creator/domain/repositories/snapshot_repository.dart';

final locator = GetIt.instance;

Future<void> configureDependencies() async {
  locator.registerSingleton<IdGenerator>(const IdGenerator());
  locator.registerSingleton<AppClock>(const SystemClock());

  locator.registerSingleton<AppDatabase>(AppDatabase());

  locator.registerSingleton<FlutterSecureStorage>(
    const FlutterSecureStorage(),
  );

  locator.registerSingleton<ProjectRepository>(
    ProjectRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<ChapterRepository>(
    ChapterRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<RevisionRepository>(
    RevisionRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<OutlineNodeRepository>(
    OutlineNodeRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<CharacterRepository>(
    CharacterRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<NoteRepository>(
    NoteRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<SessionRepository>(
    SessionRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<AgentTaskRepository>(
    AgentTaskRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<SnapshotRepository>(
    SnapshotRepositoryImpl(locator<AppDatabase>()),
  );
  locator.registerSingleton<SettingsRepository>(
    SettingsRepositoryImpl(
      locator<AppDatabase>(),
      locator<FlutterSecureStorage>(),
    ),
  );
}
