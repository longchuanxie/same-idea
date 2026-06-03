import 'package:freezed_annotation/freezed_annotation.dart';

part 'setting_entry.freezed.dart';
part 'setting_entry.g.dart';

@Freezed(toJson: true, fromJson: true)
class SettingEntry with _$SettingEntry {
  const factory SettingEntry({
    required String id,
    required String projectId,
    required String category,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default('') String content,
    @Default([]) List<String> tags,
    @Default(1) int schemaVersion,
  }) = _SettingEntry;

  factory SettingEntry.fromJson(Map<String, dynamic> json) =>
      _$SettingEntryFromJson(json);
}
