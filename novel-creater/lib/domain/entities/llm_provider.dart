import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

part 'llm_provider.freezed.dart';
part 'llm_provider.g.dart';

@Freezed()
class LlmProvider with _$LlmProvider {
  @JsonSerializable(explicitToJson: true)
  const factory LlmProvider({
    required String id,
    required String projectId,
    required String name,
    required String baseUrl,
    required String secretKeyRef,
    required String? selectedModelId,
    required ProviderStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(<LlmModel>[]) List<LlmModel> cachedModels,
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(true) bool streamingEnabled,
    @Default(1) int schemaVersion,
  }) = _LlmProvider;

  factory LlmProvider.fromJson(Map<String, dynamic> json) =>
      _$LlmProviderFromJson(json);
}
