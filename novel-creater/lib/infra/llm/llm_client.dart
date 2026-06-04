import 'package:novel_creator/domain/domain.dart';

enum LlmMessageRole { system, user, assistant, tool }

class LlmMessage {
  const LlmMessage({
    required this.role,
    required this.content,
  });

  final LlmMessageRole role;
  final String content;
}

class LlmRequest {
  const LlmRequest({
    required this.provider,
    required this.messages,
    this.requestId,
    this.model,
    this.temperature,
    this.maxTokens,
    this.stream = false,
  });

  final LlmProvider provider;
  final List<LlmMessage> messages;
  final String? requestId;
  final String? model;
  final double? temperature;
  final int? maxTokens;
  final bool stream;

  String get effectiveModel => model ?? provider.defaultModel;
  double get effectiveTemperature => temperature ?? provider.temperature;
  int get effectiveMaxTokens => maxTokens ?? provider.maxTokens;
}

class LlmTokenUsage {
  const LlmTokenUsage({
    required this.promptTokens,
    required this.completionTokens,
    this.isEstimated = true,
  });

  final int promptTokens;
  final int completionTokens;
  final bool isEstimated;

  int get totalTokens => promptTokens + completionTokens;
}

class LlmResponse {
  const LlmResponse({
    required this.content,
    required this.model,
    required this.tokenUsage,
    this.rawJson,
  });

  final String content;
  final String model;
  final LlmTokenUsage tokenUsage;
  final Map<String, Object?>? rawJson;
}

abstract class LlmClient {
  Future<AppResult<LlmResponse>> complete(LlmRequest request);

  Stream<AppResult<String>> streamComplete(LlmRequest request);

  Future<AppResult<void>> testConnection(
    LlmProvider provider, {
    String? apiKey,
  });
}
