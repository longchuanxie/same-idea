import 'package:drift/drift.dart';

class SnapshotsTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get description => text()();
  TextColumn get trigger => text().withDefault(const Constant('manual'))();
  TextColumn get dataSnapshot => text().withDefault(const Constant(''))();
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
