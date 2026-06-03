import 'package:drift/drift.dart';

class CharactersTable extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get name => text()();
  TextColumn get aliases => text().withDefault(const Constant('[]'))();
  TextColumn get role => text().withDefault(const Constant('supporting'))();
  TextColumn get description => text().withDefault(const Constant(''))();
  TextColumn get appearance => text().withDefault(const Constant(''))();
  TextColumn get personality => text().withDefault(const Constant(''))();
  TextColumn get goals => text().withDefault(const Constant(''))();
  TextColumn get conflicts => text().withDefault(const Constant(''))();
  TextColumn get secrets => text().withDefault(const Constant(''))();
  TextColumn get relationships => text().withDefault(const Constant('[]'))();
  TextColumn get firstAppearanceChapterId => text().nullable()();
  TextColumn get tags => text().withDefault(const Constant('[]'))();
  TextColumn get consistencyFacts =>
      text().withDefault(const Constant('[]'))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}
