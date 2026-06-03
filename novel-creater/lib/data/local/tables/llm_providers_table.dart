import 'package:drift/drift.dart';

class LlmProvidersTable extends Table {
  TextColumn get id => text()();
  TextColumn get displayName => text()();
  TextColumn get baseUrl => text()();
  TextColumn get defaultModel =>
      text().withDefault(const Constant('gpt-4o-mini'))();
  BoolColumn get enabled => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}
