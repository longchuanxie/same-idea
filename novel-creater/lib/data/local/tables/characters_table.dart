import 'package:drift/drift.dart';

@DataClassName('CharacterRow')
class Characters extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get name => text()();
  TextColumn get description => text().withDefault(const Constant(''))();
  TextColumn get role =>
      text().withDefault(const Constant('supporting'))();
  TextColumn get avatarUrl => text().withDefault(const Constant(''))();
  TextColumn get traitsJson =>
      text().withDefault(const Constant('{}'))();
  TextColumn get background => text().withDefault(const Constant(''))();
  TextColumn get aliasesJson =>
      text().withDefault(const Constant('[]'))();
  TextColumn get appearance => text().withDefault(const Constant(''))();
  TextColumn get personality => text().withDefault(const Constant(''))();
  TextColumn get goals => text().withDefault(const Constant(''))();
  TextColumn get conflicts => text().withDefault(const Constant(''))();
  TextColumn get secrets => text().withDefault(const Constant(''))();
  TextColumn get relationshipsJson =>
      text().withDefault(const Constant('[]'))();
  TextColumn get consistencyFactsJson =>
      text().withDefault(const Constant('[]'))();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
