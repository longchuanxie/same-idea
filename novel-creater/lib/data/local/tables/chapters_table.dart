import 'package:drift/drift.dart';

class ChaptersTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get outlineNodeId => text().nullable()();
  TextColumn get title => text()();
  IntColumn get orderIndex => integer()();
  TextColumn get contentFormat =>
      text().withDefault(const Constant('markdown'))();
  TextColumn get content => text().withDefault(const Constant(''))();
  TextColumn get plainTextCache => text().withDefault(const Constant(''))();
  IntColumn get wordCount => integer().withDefault(const Constant(0))();
  TextColumn get status => text().withDefault(const Constant('draft'))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
