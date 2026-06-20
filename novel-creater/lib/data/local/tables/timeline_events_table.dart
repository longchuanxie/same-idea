import 'package:drift/drift.dart';

@DataClassName('TimelineEventRow')
class TimelineEvents extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get characterId => text()();
  TextColumn get chapterId => text()();
  TextColumn get description => text()();
  IntColumn get chapterOrder => integer().withDefault(const Constant(0))();
  TextColumn get eventType => text().withDefault(const Constant(''))();
  TextColumn get relatedCharacterIdsJson =>
      text().withDefault(const Constant('[]'))();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
