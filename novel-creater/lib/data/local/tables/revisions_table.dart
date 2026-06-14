import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/chapters_table.dart';

@DataClassName('RevisionRow')
class Revisions extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get chapterId =>
      text().references(Chapters, #id, onDelete: KeyAction.cascade)();
  TextColumn get patchJson => text()();
  TextColumn get status => text()();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
