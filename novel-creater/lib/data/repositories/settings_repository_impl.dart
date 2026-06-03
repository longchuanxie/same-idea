import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:novel_creator/core/secure_storage.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  SettingsRepositoryImpl(this._db, this._secureStorage);

  final AppDatabase _db;
  final SecureStorage _secureStorage;

  static const _keyApiKeyPrefix = 'api_key_';
  static const _keyWritingPrefs = 'writing_preferences';
  static const _keyDefaultProviderId = 'default_provider_id';

  @override
  Future<AppResult<List<LlmProvider>>> getProviders() async {
    try {
      final rows = await _db.select(_db.llmProvidersTable).get();
      return AppResult.success(rows.map(_toProvider).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load providers',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<LlmProvider>> getProviderById(String id) async {
    try {
      final row = await (_db.select(_db.llmProvidersTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Provider not found',
          userMessage: 'Provider not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toProvider(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load provider',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<LlmProvider>> saveProvider(LlmProvider provider) async {
    try {
      await _db.into(_db.llmProvidersTable).insertOnConflictUpdate(
            LlmProvidersTableCompanion.insert(
              id: provider.id,
              displayName: provider.displayName,
              baseUrl: provider.baseUrl,
              defaultModel: Value(provider.defaultModel),
              enabled: Value(provider.enabled),
              createdAt: provider.createdAt,
              updatedAt: provider.updatedAt,
            ),
          );
      return AppResult.success(provider);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to save provider',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> deleteProvider(String id) async {
    try {
      await (_db.delete(_db.llmProvidersTable)..where((t) => t.id.equals(id)))
          .go();
      await _secureStorage.delete('$_keyApiKeyPrefix$id');
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete provider',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<String?>> getApiKey(String providerId) async {
    try {
      final key =
          await _secureStorage.read('$_keyApiKeyPrefix$providerId');
      return AppResult.success(key);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'SECURE_STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to read API key',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> saveApiKey(String providerId, String apiKey) async {
    try {
      await _secureStorage.write(
        '$_keyApiKeyPrefix$providerId',
        apiKey,
      );
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'SECURE_STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to save API key',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<WritingPreferences>> getWritingPreferences() async {
    try {
      final json = await _secureStorage.read(_keyWritingPrefs);
      if (json == null) {
        return const AppResult.success(WritingPreferences());
      }
      return AppResult.success(
        WritingPreferences.fromJson(
          jsonDecode(json) as Map<String, dynamic>,
        ),
      );
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load writing preferences',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<WritingPreferences>> saveWritingPreferences(
    WritingPreferences prefs,
  ) async {
    try {
      await _secureStorage.write(
        _keyWritingPrefs,
        jsonEncode(prefs.toJson()),
      );
      return AppResult.success(prefs);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to save writing preferences',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<String?>> getDefaultProviderId() async {
    try {
      final id = await _secureStorage.read(_keyDefaultProviderId);
      return AppResult.success(id);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load default provider',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> setDefaultProviderId(String providerId) async {
    try {
      await _secureStorage.write(
        _keyDefaultProviderId,
        providerId,
      );
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to set default provider',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  LlmProvider _toProvider(LlmProvidersTableData row) {
    return LlmProvider(
      id: row.id,
      displayName: row.displayName,
      baseUrl: row.baseUrl,
      defaultModel: row.defaultModel,
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    );
  }
}
