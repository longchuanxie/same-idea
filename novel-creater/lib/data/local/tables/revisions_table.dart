import 'package:drift/drift.dart';

class RevisionsTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get chapterId => text()();
  TextColumn get operation => text()();
  TextColumn get anchor => text()();
  TextColumn get beforeText => text()();
  TextColumn get afterText => text()();
  TextColumn get source => text().withDefault(const Constant('agent'))();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  TextColumn get metadata => text().nullable()();
  DateTimeColumn get resolvedAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
