import 'package:novel_creator/domain/domain.dart';

abstract class SettingEntryRepository {
  Future<AppResult<SettingEntry>> getById(String id);
  Future<AppResult<List<SettingEntry>>> getByProjectId(String projectId);
  Future<AppResult<List<SettingEntry>>> getByCategory(
    String projectId,
    String category,
  );
  Future<AppResult<SettingEntry>> create(SettingEntry entry);
  Future<AppResult<SettingEntry>> update(SettingEntry entry);
  Future<AppResult<void>> delete(String id);
}
