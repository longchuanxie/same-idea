import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_provider.freezed.dart';
part 'llm_provider.g.dart';

@Freezed(toJson: true, fromJson: true)
class LlmProvider with _$LlmProvider {
  const factory LlmProvider({
    required String id,
    required String displayName,
    required String baseUrl,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default('') String apiKey,
    @Default('gpt-4o-mini') String defaultModel,
    @Default(true) bool enabled,
  }) = _LlmProvider;

  factory LlmProvider.fromJson(Map<String, dynamic> json) =>
      _$LlmProviderFromJson(json);
}
