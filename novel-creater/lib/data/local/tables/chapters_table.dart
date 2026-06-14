import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/tables/projects_table.dart';

@DataClassName('ChapterRow')
class Chapters extends Table {
  TextColumn get id => text()();
  TextColumn get projectId =>
      text().references(Projects, #id, onDelete: KeyAction.cascade)();
  TextColumn get title => text()();
  TextColumn get markdownContent => text().withDefault(const Constant(''))();
  TextColumn get plainTextCache => text().withDefault(const Constant(''))();
  IntColumn get wordCount => integer().withDefault(const Constant(0))();
  TextColumn get status => text()();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
