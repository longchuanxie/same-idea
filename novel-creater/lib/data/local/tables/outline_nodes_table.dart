import 'package:drift/drift.dart';

class OutlineNodesTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get parentId => text().nullable()();
  IntColumn get orderIndex => integer()();
  TextColumn get title => text()();
  TextColumn get nodeType =>
      text().withDefault(const Constant('chapter'))();
  TextColumn get summary => text().withDefault(const Constant(''))();
  TextColumn get linkedChapterId => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('planned'))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
