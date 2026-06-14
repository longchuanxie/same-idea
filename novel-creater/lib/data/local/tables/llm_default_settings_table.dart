import 'package:drift/drift.dart';

@DataClassName('LlmDefaultSettingsRow')
class LlmDefaultSettingsTable extends Table {
  @override
  String get tableName => 'llm_default_settings';

  IntColumn get id => integer().customConstraint('NOT NULL CHECK (id = 1)')();
  TextColumn get writingProviderId => text().nullable()();
  TextColumn get writingModelId => text().nullable()();
  TextColumn get reasoningProviderId => text().nullable()();
  TextColumn get reasoningModelId => text().nullable()();
  TextColumn get embeddingProviderId => text().nullable()();
  TextColumn get embeddingModelId => text().nullable()();
  RealColumn get defaultTemperature =>
      real().withDefault(const Constant(0.7))();
  RealColumn get defaultTopP => real().withDefault(const Constant(0.9))();
  BoolColumn get streamingEnabled =>
      boolean().withDefault(const Constant(true))();
  IntColumn get updatedAt => integer()();
  IntColumn get schemaVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column<Object>> get primaryKey => <Column<Object>>{id};
}
