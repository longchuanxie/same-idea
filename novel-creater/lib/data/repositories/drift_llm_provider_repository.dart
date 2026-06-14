import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/llm_default_settings_mapper.dart';
import 'package:novel_creator/data/local/mappers/llm_provider_mapper.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftLlmProviderRepository implements LlmProviderRepository {
  DriftLlmProviderRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    LlmProviderMapper? providerMapper,
    LlmDefaultSettingsMapper? settingsMapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _providerMapper = providerMapper ?? const LlmProviderMapper(),
        _settingsMapper = settingsMapper ?? const LlmDefaultSettingsMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final LlmProviderMapper _providerMapper;
  final LlmDefaultSettingsMapper _settingsMapper;

  @override
  Future<AppResult<List<LlmProvider>>> getAll() => _errorMapper.wrapAsync(
        () async {
          final rows = await _db.select(_db.llmProviders).get();
          return AppResult<List<LlmProvider>>.success(
            rows.map(_providerMapper.fromRow).toList(),
          );
        },
      );

  @override
  Future<AppResult<LlmProvider?>> getById(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.llmProviders)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<LlmProvider?>.success(
          row == null ? null : _providerMapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<LlmProvider>> add(LlmProvider provider) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.llmProviders)
            .insert(_providerMapper.toRow(provider));
        return AppResult<LlmProvider>.success(provider);
      });

  @override
  Future<AppResult<LlmProvider>> update(LlmProvider provider) =>
      _errorMapper.wrapAsync(() async {
        final count = await (_db.update(_db.llmProviders)
              ..where((t) => t.id.equals(provider.id)))
            .write(
          LlmProvidersCompanion(
            name: Value(provider.name),
            baseUrl: Value(provider.baseUrl),
            secretKeyRef: Value(provider.secretKeyRef),
            selectedModelId: Value(provider.selectedModelId),
            status: Value(provider.status.name),
            cachedModelsJson: Value(
              _encodeModels(provider.cachedModels),
            ),
            temperature: Value(provider.temperature),
            topP: Value(provider.topP),
            streamingEnabled: Value(provider.streamingEnabled),
            updatedAt: Value(DateTime.now().toUtc().millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<LlmProvider>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Provider not found.',
              userMessage: '未找到服务商。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        final saved = provider.copyWith(
          updatedAt: DateTime.now().toUtc(),
        );
        return AppResult<LlmProvider>.success(saved);
      });

  @override
  Future<AppResult<void>> remove(String id) => _errorMapper.wrapAsync(
        () async {
          await (_db.delete(_db.llmProviders)
                ..where((t) => t.id.equals(id)))
              .go();
          return const AppResult<void>.success(null);
        },
      );

  @override
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings() =>
      _errorMapper.wrapAsync(() async {
        try {
          final row = await (_db.select(_db.llmDefaultSettingsTable)
                ..where((t) => t.id.equals(1)))
              .getSingleOrNull();
          if (row == null) {
            return const AppResult<LlmDefaultSettings>.success(
              LlmDefaultSettings.empty,
            );
          }
          return AppResult<LlmDefaultSettings>.success(
            _settingsMapper.fromRow(row),
          );
        } on StateError {
          return const AppResult<LlmDefaultSettings>.success(
            LlmDefaultSettings.empty,
          );
        }
      });

  @override
  Future<AppResult<void>> setDefaultSettings(LlmDefaultSettings settings) =>
      _errorMapper.wrapAsync(() async {
        await _db
            .into(_db.llmDefaultSettingsTable)
            .insertOnConflictUpdate(_settingsMapper.toRow(settings));
        return const AppResult<void>.success(null);
      });

  String _encodeModels(List<dynamic> models) {
    return jsonEncode(models);
  }
}
