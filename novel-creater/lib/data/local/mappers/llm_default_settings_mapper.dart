import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';

final class LlmDefaultSettingsMapper {
  const LlmDefaultSettingsMapper();

  LlmDefaultSettingsRow toRow(LlmDefaultSettings entity) =>
      LlmDefaultSettingsRow(
        id: 1,
        writingProviderId: entity.writingProviderId,
        writingModelId: entity.writingModelId,
        reasoningProviderId: entity.reasoningProviderId,
        reasoningModelId: entity.reasoningModelId,
        embeddingProviderId: entity.embeddingProviderId,
        embeddingModelId: entity.embeddingModelId,
        defaultTemperature: entity.defaultTemperature,
        defaultTopP: entity.defaultTopP,
        streamingEnabled: entity.streamingEnabled,
        updatedAt: DateTime.now().millisecondsSinceEpoch,
        schemaVersion: 1,
      );

  LlmDefaultSettings fromRow(LlmDefaultSettingsRow row) =>
      LlmDefaultSettings(
        writingProviderId: row.writingProviderId,
        writingModelId: row.writingModelId,
        reasoningProviderId: row.reasoningProviderId,
        reasoningModelId: row.reasoningModelId,
        embeddingProviderId: row.embeddingProviderId,
        embeddingModelId: row.embeddingModelId,
        defaultTemperature: row.defaultTemperature,
        defaultTopP: row.defaultTopP,
        streamingEnabled: row.streamingEnabled,
      );
}
