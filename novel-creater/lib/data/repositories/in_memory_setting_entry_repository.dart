import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemorySettingEntryRepository implements SettingEntryRepository {
  final Map<String, SettingEntry> _entries = <String, SettingEntry>{};

  @override
  Future<AppResult<SettingEntry>> create(SettingEntry entry) async {
    _entries[entry.id] = entry;
    return AppResult<SettingEntry>.success(entry);
  }

  @override
  Future<AppResult<List<SettingEntry>>> list(String projectId) async {
    final entries = _entries.values
        .where((entry) => entry.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<SettingEntry>>.success(
      List<SettingEntry>.unmodifiable(entries),
    );
  }

  @override
  Future<AppResult<SettingEntry?>> get(String id) async =>
      AppResult<SettingEntry?>.success(_entries[id]);

  @override
  Future<AppResult<SettingEntry>> update(SettingEntry entry) async {
    if (!_entries.containsKey(entry.id)) {
      return const AppResult<SettingEntry>.failure(
        AppError(
          code: 'setting_entry.not_found',
          message: 'Setting entry was not found.',
          userMessage: '未找到设定条目，无法更新。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新设定列表后重试。',
        ),
      );
    }

    final updated = entry.copyWith(
      updatedAt: DateTime.now().toUtc(),
    );
    _entries[entry.id] = updated;
    return AppResult<SettingEntry>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _entries.remove(id);
    return AppResult<void>.success(null);
  }
}
