import 'package:drift/drift.dart';

@DataClassName('OutlineNodeRow')
class OutlineNodes extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get title => text()();
  TextColumn get summary => text().withDefault(const Constant(''))();
  TextColumn get chapterId => text().withDefault(const Constant(''))();
  TextColumn get parentId => text().withDefault(const Constant(''))();
  IntColumn get sortOrder => integer().withDefault(const Constant(0))();
  TextColumn get tagsJson => text().withDefault(const Constant('[]'))();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
