import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:novel_creator/data/local/tables/tables.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart' as sqlite3;

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    ProjectsTable,
    ChaptersTable,
    RevisionsTable,
    OutlineNodesTable,
    CharactersTable,
    NotesTable,
    SessionsTable,
    AgentTasksTable,
    SnapshotsTable,
    LlmProvidersTable,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  AppDatabase.forTesting(super.e);

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) => m.createAll(),
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            await m.createTable(llmProvidersTable);
          }
        },
      );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbDir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbDir.path, 'novel_creator.db'));
    sqlite3.sqlite3.open(file.path);
    return NativeDatabase.createInBackground(file);
  });
}
