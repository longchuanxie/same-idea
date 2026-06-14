import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

final class LlmProviderMapper {
  const LlmProviderMapper();

  LlmProviderRow toRow(LlmProvider entity) => LlmProviderRow(
        id: entity.id,
        projectId: entity.projectId,
        name: entity.name,
        baseUrl: entity.baseUrl,
        secretKeyRef: entity.secretKeyRef,
        cachedModelsJson: jsonEncode(
          entity.cachedModels.map((m) => m.toJson()).toList(),
        ),
        selectedModelId: entity.selectedModelId,
        status: entity.status.name,
        temperature: entity.temperature,
        topP: entity.topP,
        streamingEnabled: entity.streamingEnabled,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  LlmProvider fromRow(LlmProviderRow row) {
    final rawModels =
        jsonDecode(row.cachedModelsJson) as List<dynamic>;
    return LlmProvider(
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      baseUrl: row.baseUrl,
      secretKeyRef: row.secretKeyRef,
      selectedModelId: row.selectedModelId,
      status: ProviderStatus.values.byName(row.status),
      cachedModels: rawModels
          .map((m) => LlmModel.fromJson(m as Map<String, dynamic>))
          .toList(),
      temperature: row.temperature,
      topP: row.topP,
      streamingEnabled: row.streamingEnabled,
      createdAt:
          DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
      updatedAt:
          DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
      schemaVersion: row.schemaVersion,
    );
  }
}
