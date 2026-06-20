import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';

part 'llm_request.freezed.dart';
part 'llm_request.g.dart';

@Freezed()
class LlmRequest with _$LlmRequest {
  @JsonSerializable(explicitToJson: true)
  const factory LlmRequest({
    required String baseUrl,
    required String apiKey,
    required String model,
    required List<LlmMessage> messages,
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(2048) int maxTokens,
    @Default(true) bool stream,
  }) = _LlmRequest;

  factory LlmRequest.fromJson(Map<String, dynamic> json) =>
      _$LlmRequestFromJson(json);
}
