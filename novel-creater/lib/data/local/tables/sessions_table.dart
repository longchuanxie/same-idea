import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/projects_table.dart';

@DataClassName('SessionRow')
class Sessions extends Table {
  TextColumn get id => text()();
  TextColumn get projectId =>
      text().references(Projects, #id, onDelete: KeyAction.cascade)();
  TextColumn get title => text()();
  TextColumn get status => text()();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();
  TextColumn get chapterId => text().nullable()();
  TextColumn get agentMode => text().nullable()();
  TextColumn get summary => text().nullable()();
  IntColumn get startedAt => integer().nullable()();
  IntColumn get endedAt => integer().nullable()();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
