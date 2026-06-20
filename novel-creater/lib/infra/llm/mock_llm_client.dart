import 'dart:async';

import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';

class MockLlmClient implements LlmClient {
  const MockLlmClient({
    this.chunkDelay = Duration.zero,
  });

  final Duration chunkDelay;

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) async {
    final validation = _validateRequest(request);
    if (validation != null) {
      return AppResult.failure(validation);
    }

    final prompt = _lastUserMessage(request.messages);
    final content = _buildResponse(prompt, request);
    return AppResult.success(
      LlmResponse(
        content: content,
        model: request.effectiveModel,
        tokenUsage: LlmTokenUsage(
          promptTokens: _estimateTokens(
            request.messages.map((message) => message.content).join('\n'),
          ),
          completionTokens: _estimateTokens(content),
        ),
        rawJson: {
          'providerId': request.provider.id,
          'mock': true,
        },
      ),
    );
  }

  @override
  Stream<AppResult<String>> streamComplete(LlmRequest request) async* {
    final result = await complete(request);
    if (result.isFailure) {
      yield AppResult.failure(result.maybeFailure!);
      return;
    }

    final content = result.maybeSuccess!.content;
    for (final chunk in _chunkContent(content)) {
      if (chunkDelay > Duration.zero) {
        await Future<void>.delayed(chunkDelay);
      }
      yield AppResult.success(chunk);
    }
  }

  @override
  Future<AppResult<void>> testConnection(
    LlmProvider provider, {
    String? apiKey,
  }) async {
    if (!provider.enabled) {
      return AppResult.failure(
        _error(
          code: 'LLM_PROVIDER_DISABLED',
          message: 'Provider is disabled',
          userMessage: 'Provider is disabled',
          suggestedAction: 'Enable the provider before testing it.',
        ),
      );
    }
    if (provider.baseUrl.trim().isEmpty) {
      return AppResult.failure(
        _error(
          code: 'LLM_BASE_URL_EMPTY',
          message: 'Provider base URL is empty',
          userMessage: 'Provider base URL is empty',
          suggestedAction: 'Set an OpenAI-compatible base URL.',
        ),
      );
    }
    return const AppResult.success(null);
  }

  AppError? _validateRequest(LlmRequest request) {
    if (!request.provider.enabled) {
      return _error(
        code: 'LLM_PROVIDER_DISABLED',
        message: 'Provider is disabled',
        userMessage: 'Provider is disabled',
        suggestedAction: 'Enable the provider before sending requests.',
      );
    }
    if (request.provider.baseUrl.trim().isEmpty) {
      return _error(
        code: 'LLM_BASE_URL_EMPTY',
        message: 'Provider base URL is empty',
        userMessage: 'Provider base URL is empty',
        suggestedAction: 'Set an OpenAI-compatible base URL.',
      );
    }
    if (request.messages.isEmpty) {
      return _error(
        code: 'LLM_PROMPT_EMPTY',
        message: 'Request messages are empty',
        userMessage: 'Prompt is empty',
        suggestedAction: 'Add an instruction before generating text.',
      );
    }
    if (request.effectiveMaxTokens <= 0) {
      return _error(
        code: 'LLM_MAX_TOKENS_INVALID',
        message: 'maxTokens must be greater than zero',
        userMessage: 'Maximum token setting is invalid',
        suggestedAction: 'Use a positive maximum token value.',
      );
    }
    return null;
  }

  String _buildResponse(String prompt, LlmRequest request) {
    final normalizedPrompt =
        prompt.trim().isEmpty ? 'Continue writing' : prompt.trim();
    return 'Mock response for "$normalizedPrompt" '
        'using ${request.effectiveModel} '
        '(temperature ${request.effectiveTemperature}, '
        'max tokens ${request.effectiveMaxTokens}).';
  }

  String _lastUserMessage(List<LlmMessage> messages) =>
      messages
          .where((message) => message.role == LlmMessageRole.user)
          .map((message) => message.content)
          .lastOrNull ??
      '';

  Iterable<String> _chunkContent(String content) sync* {
    const chunkSize = 24;
    for (var index = 0; index < content.length; index += chunkSize) {
      final end = index + chunkSize > content.length
          ? content.length
          : index + chunkSize;
      yield content.substring(index, end);
    }
  }

  int _estimateTokens(String content) {
    final trimmed = content.trim();
    if (trimmed.isEmpty) {
      return 0;
    }
    return (trimmed.length / 4).ceil();
  }

  AppError _error({
    required String code,
    required String message,
    required String userMessage,
    String? suggestedAction,
  }) =>
      AppError(
        code: code,
        message: message,
        userMessage: userMessage,
        suggestedAction: suggestedAction,
        source: AppErrorSource.llm,
      );
}
