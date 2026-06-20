import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:novel_creator/domain/enums/setting_category.dart';

part 'setting_entry.freezed.dart';
part 'setting_entry.g.dart';

@freezed
class SettingEntry with _$SettingEntry {
  const factory SettingEntry({
    required String id,
    required String projectId,
    required String title,
    required String content,
    @Default(SettingCategory.other) SettingCategory category,
    @Default([]) List<String> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _SettingEntry;

  factory SettingEntry.fromJson(Map<String, dynamic> json) =>
      _$SettingEntryFromJson(json);
}
