import 'package:drift/drift.dart';

@DataClassName('SettingEntryRow')
class SettingEntries extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get title => text()();
  TextColumn get content => text()();
  TextColumn get category =>
      text().withDefault(const Constant('other'))();
  TextColumn get tagsJson =>
      text().withDefault(const Constant('[]'))();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
