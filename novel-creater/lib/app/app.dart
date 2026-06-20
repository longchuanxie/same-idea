import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/agent/agent_mode_service.dart';
import 'package:novel_creator/app/injection.dart';
import 'package:novel_creator/app/theme/app_theme.dart';
import 'package:novel_creator/app/theme/theme_cubit.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/data/local/database/database_provider.dart';
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/repositories/note_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/repositories/search_repository.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';
import 'package:novel_creator/domain/services/export_service.dart';
import 'package:novel_creator/editor/revision/revision_service.dart';
import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/features/export/bloc/export_bloc.dart';
import 'package:novel_creator/features/export/pages/export_page.dart';
import 'package:novel_creator/features/export/services/default_export_service.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/pages/knowledge_base_page.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';
import 'package:novel_creator/features/projects/bloc/project_list_event.dart';
import 'package:novel_creator/features/projects/pages/project_list_page.dart';
import 'package:novel_creator/features/search/pages/search_page.dart';
import 'package:novel_creator/features/settings/bloc/settings_bloc.dart';
import 'package:novel_creator/features/settings/pages/settings_page.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_event.dart';
import 'package:novel_creator/features/workspace/pages/workspace_page.dart';

class NovelCreatorApp extends StatelessWidget {
  const NovelCreatorApp({super.key, DatabaseFactory? databaseFactory})
      : _databaseFactory = databaseFactory;

  final DatabaseFactory? _databaseFactory;

  @override
  Widget build(BuildContext context) {
    return DatabaseProvider(
      databaseFactory: _databaseFactory,
      builder: (context, db) {
        configureDependencies(db);

        return BlocProvider<ThemeCubit>(
          create: (_) => ThemeCubit(),
          child: BlocBuilder<ThemeCubit, ThemeMode>(
            builder: (context, themeMode) {
              return MaterialApp(
                title: 'Novel Creator',
                theme: AppTheme.light(),
                darkTheme: AppTheme.dark(),
                themeMode: themeMode,
                debugShowCheckedModeBanner: false,
                initialRoute: '/',
                routes: <String, WidgetBuilder>{
                  '/': (context) => BlocProvider<ProjectListBloc>(
                        create: (_) => ProjectListBloc(
                          projectRepository: getIt<ProjectRepository>(),
                        )..add(const ProjectListStarted()),
                        child: const ProjectListPage(),
                      ),
                  '/workspace': (context) {
                        final projectId =
                            ModalRoute.of(context)?.settings.arguments
                                    as String? ??
                                '';
                        return BlocProvider<WorkspaceBloc>(
                          create: (_) => WorkspaceBloc(
                            projectRepository: getIt<ProjectRepository>(),
                            chapterRepository: getIt<ChapterRepository>(),
                            revisionRepository: getIt<RevisionRepository>(),
                            revisionService: const RevisionService(),
                            agentModeService: const AgentModeService(),
                            writingTool: getIt<AgentWritingTool>(),
                            characterRepository: getIt<CharacterRepository>(),
                            settingEntryRepository:
                                getIt<SettingEntryRepository>(),
                            noteRepository: getIt<NoteRepository>(),
                            eventBus: getIt<AppEventBus>(),
                          )..add(WorkspaceProjectLoaded(projectId)),
                          child: const WorkspacePage(),
                        );
                      },
                  '/settings': (context) => BlocProvider<SettingsBloc>(
                        create: (_) => SettingsBloc(
                          repository: getIt<LlmProviderRepository>(),
                          client: getIt<LlmClient>(),
                          secretStorage: getIt<SecretStorage>(),
                        ),
                        child: const SettingsPage(),
                      ),
                  '/knowledge_base': (context) {
                        final projectId =
                            ModalRoute.of(context)?.settings.arguments
                                    as String? ??
                                '__default__';
                        return BlocProvider<KnowledgeBaseBloc>(
                          create: (_) => KnowledgeBaseBloc(
                            characterRepository: getIt<CharacterRepository>(),
                            settingEntryRepository:
                                getIt<SettingEntryRepository>(),
                            noteRepository: getIt<NoteRepository>(),
                            eventBus: getIt<AppEventBus>(),
                          ),
                          child: KnowledgeBasePage(projectId: projectId),
                        );
                      },
                  '/search': (context) => SearchPage(
                        projectId: '__default__',
                      ),
                  '/export': (context) {
                        final projectId =
                            ModalRoute.of(context)?.settings.arguments
                                    as String? ??
                                '__default__';
                        return BlocProvider<ExportBloc>(
                          create: (_) => ExportBloc(
                            exportService: DefaultExportService(
                              projectRepository: getIt<ProjectRepository>(),
                              chapterRepository: getIt<ChapterRepository>(),
                              revisionRepository: getIt<RevisionRepository>(),
                            ),
                            projectRepository: getIt<ProjectRepository>(),
                            chapterRepository: getIt<ChapterRepository>(),
                            revisionRepository: getIt<RevisionRepository>(),
                            eventBus: getIt<AppEventBus>(),
                          ),
                          child: ExportPage(projectId: projectId),
                        );
                      },
                },
              );
            },
          ),
        );
      },
    );
  }
}
