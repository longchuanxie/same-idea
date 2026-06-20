import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/projects_table.dart';

@DataClassName('AgentTaskRow')
class AgentTasks extends Table {
  TextColumn get id => text()();
  TextColumn get projectId =>
      text().references(Projects, #id, onDelete: KeyAction.cascade)();
  TextColumn get taskType => text()();
  TextColumn get status => text()();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();
  TextColumn get chapterId => text().nullable()();
  TextColumn get instruction => text().nullable()();
  TextColumn get result => text().nullable()();
  TextColumn get errorMessage => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
