import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class LlmProviderRepository {
  Future<AppResult<List<LlmProvider>>> getAll();

  Future<AppResult<LlmProvider?>> getById(String id);

  Future<AppResult<LlmProvider>> add(LlmProvider provider);

  Future<AppResult<LlmProvider>> update(LlmProvider provider);

  Future<AppResult<void>> remove(String id);

  Future<AppResult<LlmDefaultSettings>> getDefaultSettings();

  Future<AppResult<void>> setDefaultSettings(LlmDefaultSettings settings);
}
