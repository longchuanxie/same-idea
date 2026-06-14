import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_response.freezed.dart';
part 'llm_response.g.dart';

@freezed
class LlmResponse with _$LlmResponse {
  const factory LlmResponse({
    required String content,
    String? finishReason,
    int? promptTokens,
    int? completionTokens,
  }) = _LlmResponse;

  factory LlmResponse.fromJson(Map<String, dynamic> json) =>
      _$LlmResponseFromJson(json);
}
