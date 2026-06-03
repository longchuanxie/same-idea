import 'package:drift/drift.dart';

class SessionsTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get title => text()();
  TextColumn get stage => text().withDefault(const Constant('writing'))();
  TextColumn get parentSessionId => text().nullable()();
  TextColumn get branchName => text().nullable()();
  TextColumn get messages => text().withDefault(const Constant('[]'))();
  TextColumn get contextSnapshotId => text().nullable()();
  BoolColumn get archived =>
      boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
