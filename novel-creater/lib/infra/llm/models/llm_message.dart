import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_message.freezed.dart';
part 'llm_message.g.dart';

@freezed
class LlmMessage with _$LlmMessage {
  const factory LlmMessage({
    required String role,
    required String content,
  }) = _LlmMessage;

  factory LlmMessage.fromJson(Map<String, dynamic> json) =>
      _$LlmMessageFromJson(json);
}
