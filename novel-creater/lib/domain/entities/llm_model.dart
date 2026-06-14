import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_model.freezed.dart';
part 'llm_model.g.dart';

@freezed
class LlmModel with _$LlmModel {
  const factory LlmModel({
    required String id,
    required String modelId,
    required String name,
    int? contextLength,
    int? maxOutput,
    @Default(true) bool supportsStreaming,
    double? temperature,
  }) = _LlmModel;

  factory LlmModel.fromJson(Map<String, dynamic> json) =>
      _$LlmModelFromJson(json);
}
