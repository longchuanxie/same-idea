import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';

abstract interface class LlmClient {
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  });

  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  });

  Stream<LlmStreamChunk> chatCompletionStream(LlmRequest request);

  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request);
}
