import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:novel_creator/data/local/tables/tables.dart';

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

LazyDatabase _openConnection() =>
    LazyDatabase(() async => NativeDatabase.memory());
