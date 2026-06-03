import 'package:drift/drift.dart';

class AgentTasksTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get taskType => text()();
  TextColumn get status => text().withDefault(const Constant('created'))();
  TextColumn get inputJson => text().withDefault(const Constant(''))();
  TextColumn get outputJson => text().withDefault(const Constant(''))();
  TextColumn get model => text().nullable()();
  TextColumn get tokenUsage => text().nullable()();
  TextColumn get error => text().nullable()();
  TextColumn get sideEffects => text().withDefault(const Constant('[]'))();
  DateTimeColumn get startedAt => dateTime().nullable()();
  DateTimeColumn get completedAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
