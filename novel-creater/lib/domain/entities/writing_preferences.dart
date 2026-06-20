import 'package:freezed_annotation/freezed_annotation.dart';

part 'writing_preferences.freezed.dart';
part 'writing_preferences.g.dart';

@Freezed(toJson: true, fromJson: true)
class WritingPreferences with _$WritingPreferences {
  const factory WritingPreferences({
    @Default('zh') String language,
    @Default('') String defaultStyle,
    @Default(false) bool autoSuggest,
    @Default(2000) int defaultGenerateLength,
  }) = _WritingPreferences;

  factory WritingPreferences.fromJson(Map<String, dynamic> json) =>
      _$WritingPreferencesFromJson(json);
}
