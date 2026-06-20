import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_default_settings.freezed.dart';
part 'llm_default_settings.g.dart';

@freezed
class LlmDefaultSettings with _$LlmDefaultSettings {
  const factory LlmDefaultSettings({
    required String? writingProviderId,
    required String? writingModelId,
    required String? reasoningProviderId,
    required String? reasoningModelId,
    required String? embeddingProviderId,
    required String? embeddingModelId,
    @Default(0.7) double defaultTemperature,
    @Default(0.9) double defaultTopP,
    @Default(true) bool streamingEnabled,
  }) = _LlmDefaultSettings;

  factory LlmDefaultSettings.fromJson(Map<String, dynamic> json) =>
      _$LlmDefaultSettingsFromJson(json);

  static const LlmDefaultSettings empty = LlmDefaultSettings(
    writingProviderId: null,
    writingModelId: null,
    reasoningProviderId: null,
    reasoningModelId: null,
    embeddingProviderId: null,
    embeddingModelId: null,
  );
}
