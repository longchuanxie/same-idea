import 'package:drift/drift.dart';

@DataClassName('LlmProviderRow')
class LlmProviders extends Table {
  TextColumn get id => text()();
  TextColumn get projectId => text()();
  TextColumn get name => text()();
  TextColumn get baseUrl => text()();
  TextColumn get secretKeyRef => text()();
  TextColumn get cachedModelsJson =>
      text().withDefault(const Constant('[]'))();
  TextColumn get selectedModelId => text().nullable()();
  TextColumn get status => text()();
  RealColumn get temperature => real().withDefault(const Constant(0.7))();
  RealColumn get topP => real().withDefault(const Constant(0.9))();
  BoolColumn get streamingEnabled =>
      boolean().withDefault(const Constant(true))();
  IntColumn get createdAt => integer()();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
