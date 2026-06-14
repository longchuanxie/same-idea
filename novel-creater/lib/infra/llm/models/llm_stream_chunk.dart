import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/results/app_error.dart';

part 'llm_stream_chunk.freezed.dart';

@freezed
sealed class LlmStreamChunk with _$LlmStreamChunk {
  const factory LlmStreamChunk.textDelta(String text) = TextDelta;
  const factory LlmStreamChunk.done(String? finishReason) = StreamDone;
  const factory LlmStreamChunk.error(AppError error) = StreamErrorChunk;
}
