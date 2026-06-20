import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/projects_table.dart';

@DataClassName('SnapshotRow')
class Snapshots extends Table {
  TextColumn get id => text()();
  TextColumn get projectId =>
      text().references(Projects, #id, onDelete: KeyAction.cascade)();
  TextColumn get name => text()();
  TextColumn get type => text()();
  TextColumn get contentHash => text()();
  TextColumn get contentSnapshot => text()();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();
  TextColumn get chapterId => text().nullable()();
  TextColumn get description => text().nullable()();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
