import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class SettingEntryRepository {
  Future<AppResult<SettingEntry>> create(SettingEntry entry);

  Future<AppResult<List<SettingEntry>>> list(String projectId);

  Future<AppResult<SettingEntry?>> get(String id);

  Future<AppResult<SettingEntry>> update(SettingEntry entry);

  Future<AppResult<void>> delete(String id);
}
