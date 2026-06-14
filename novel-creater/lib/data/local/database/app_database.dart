import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/agent_tasks_table.dart';
import 'package:novel_creator/data/local/tables/chapters_table.dart';
import 'package:novel_creator/data/local/tables/characters_table.dart';
import 'package:novel_creator/data/local/tables/llm_default_settings_table.dart';
import 'package:novel_creator/data/local/tables/llm_providers_table.dart';
import 'package:novel_creator/data/local/tables/notes_table.dart';
import 'package:novel_creator/data/local/tables/outline_nodes_table.dart';
import 'package:novel_creator/data/local/tables/projects_table.dart';
import 'package:novel_creator/data/local/tables/revisions_table.dart';
import 'package:novel_creator/data/local/tables/sessions_table.dart';
import 'package:novel_creator/data/local/tables/snapshots_table.dart';
import 'package:novel_creator/data/local/tables/setting_entries_table.dart';
import 'package:novel_creator/data/local/tables/timeline_events_table.dart';

part 'app_database.g.dart';

const String kGlobalProjectId = '__global__';

@DriftDatabase(
  tables: <Type>[
    Projects,
    Chapters,
    Revisions,
    Characters,
    SettingEntries,
    Notes,
    LlmProviders,
    LlmDefaultSettingsTable,
    OutlineNodes,
    AgentTasks,
    TimelineEvents,
    Sessions,
    Snapshots,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  @override
  int get schemaVersion => 6;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) async {
          await m.createAll();
        },
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            await m.createTable(characters);
            await m.createTable(settingEntries);
            await m.createTable(notes);
          }
          if (from < 3) {
            await m.createTable(outlineNodes);
          }
          if (from < 4) {
            await m.createTable(agentTasks);
          }
          if (from < 5) {
            await m.createTable(timelineEvents);
          }
          if (from < 6) {
            await m.createTable(sessions);
            await m.createTable(snapshots);
          }
        },
        beforeOpen: (OpeningDetails details) async {
          await customStatement('PRAGMA foreign_keys = ON');
        },
      );
}
