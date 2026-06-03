import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/entities/writing_preferences.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract class SettingsRepository {
  Future<AppResult<List<LlmProvider>>> getProviders();
  Future<AppResult<LlmProvider>> getProviderById(String id);
  Future<AppResult<LlmProvider>> saveProvider(LlmProvider provider);
  Future<AppResult<void>> deleteProvider(String id);
  Future<AppResult<String?>> getApiKey(String providerId);
  Future<AppResult<void>> saveApiKey(String providerId, String apiKey);
  Future<AppResult<WritingPreferences>> getWritingPreferences();
  Future<AppResult<WritingPreferences>> saveWritingPreferences(
    WritingPreferences prefs,
  );
  Future<AppResult<String?>> getDefaultProviderId();
  Future<AppResult<void>> setDefaultProviderId(String providerId);
}
