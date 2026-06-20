import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';
import 'package:novel_creator/infra/llm/sse_parser.dart';

final class OpenAiCompatibleClient implements LlmClient {
  OpenAiCompatibleClient({http.Client? client})
      : _client = client ?? http.Client();

  final http.Client _client;

  static const String _doneMarker = '[DONE]';

  Uri _resolve(String baseUrl, String path) {
    final trimmed = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    return Uri.parse('$trimmed$path');
  }

  Map<String, String> _authHeaders(String apiKey, {bool json = true}) {
    final headers = <String, String>{
      'Authorization': 'Bearer $apiKey',
    };
    if (json) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  AppError _errorForStatus(int status, String body) {
    if (status == 401 || status == 403) {
      return const AppError(
        code: 'llm.auth_failed',
        message: 'authentication failed',
        userMessage: '认证失败：请检查 API Key 是否正确',
        source: AppErrorSource.llm,
        recoverable: true,
      );
    }
    if (status == 429) {
      return const AppError(
        code: 'llm.rate_limited',
        message: 'rate limited',
        userMessage: '请求过于频繁，请稍后重试',
        source: AppErrorSource.llm,
        recoverable: true,
      );
    }
    return AppError(
      code: 'llm.request_failed',
      message: 'request failed with status $status',
      userMessage: '请求失败（状态码 $status），请稍后重试',
      technicalDetail: body.isEmpty ? null : body,
      source: AppErrorSource.llm,
      recoverable: true,
    );
  }

  AppError _connectionError(Object cause) => AppError(
        code: 'llm.connection_failed',
        message: 'connection failed',
        userMessage: '网络连接失败，请检查网络或服务器地址',
        technicalDetail: cause.toString(),
        source: AppErrorSource.llm,
        recoverable: true,
      );

  AppError _responseParseError(Object cause) => AppError(
        code: 'llm.response_parse_error',
        message: 'failed to parse response',
        userMessage: '解析响应失败，请稍后重试',
        technicalDetail: cause.toString(),
        source: AppErrorSource.llm,
        recoverable: true,
      );

  AppError _sseParseError(Object cause) => AppError(
        code: 'llm.sse_parse_error',
        message: 'failed to parse SSE event',
        userMessage: '解析流式响应失败',
        technicalDetail: cause.toString(),
        source: AppErrorSource.llm,
        recoverable: true,
      );

  @override
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  }) async {
    final result = await listModels(baseUrl: baseUrl, apiKey: apiKey);
    return switch (result) {
      AppSuccess<List<LlmModel>>() => const AppResult<void>.success(null),
      AppFailure<List<LlmModel>>(:final error) =>
        AppResult<void>.failure(error),
    };
  }

  @override
  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  }) async {
    try {
      final response = await _client.get(
        _resolve(baseUrl, '/models'),
        headers: _authHeaders(apiKey, json: false),
      );
      if (response.statusCode != 200) {
        return AppResult<List<LlmModel>>.failure(
          _errorForStatus(response.statusCode, response.body),
        );
      }
      try {
        final decoded = jsonDecode(response.body) as Map<String, dynamic>;
        final data = (decoded['data'] as List<dynamic>? ?? <dynamic>[])
            .whereType<Map<String, dynamic>>()
            .map((Map<String, dynamic> entry) {
          final id = entry['id'] as String? ?? '';
          return LlmModel(id: id, modelId: id, name: id);
        }).toList();
        return AppResult<List<LlmModel>>.success(data);
      } on Exception catch (e) {
        return AppResult<List<LlmModel>>.failure(_responseParseError(e));
      }
    } on SocketException catch (e) {
      return AppResult<List<LlmModel>>.failure(_connectionError(e));
    } on http.ClientException catch (e) {
      return AppResult<List<LlmModel>>.failure(_connectionError(e));
    } on Exception catch (e) {
      return AppResult<List<LlmModel>>.failure(_connectionError(e));
    }
  }

  Map<String, dynamic> _buildBody(LlmRequest request, {required bool stream}) =>
      <String, dynamic>{
        'model': request.model,
        'messages': request.messages
            .map((m) => <String, dynamic>{'role': m.role, 'content': m.content})
            .toList(),
        'temperature': request.temperature,
        'top_p': request.topP,
        'max_tokens': request.maxTokens,
        'stream': stream,
      };

  @override
  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request) async {
    try {
      final response = await _client.post(
        _resolve(request.baseUrl, '/chat/completions'),
        headers: _authHeaders(request.apiKey),
        body: jsonEncode(_buildBody(request, stream: false)),
      );
      if (response.statusCode != 200) {
        return AppResult<LlmResponse>.failure(
          _errorForStatus(response.statusCode, response.body),
        );
      }
      try {
        final decoded = jsonDecode(response.body) as Map<String, dynamic>;
        final choices = decoded['choices'] as List<dynamic>? ?? <dynamic>[];
        if (choices.isEmpty) {
          return AppResult<LlmResponse>.failure(
            _responseParseError(StateError('choices is empty')),
          );
        }
        final choice = choices.first as Map<String, dynamic>;
        final message = choice['message'] as Map<String, dynamic>? ??
            <String, dynamic>{};
        final content = message['content'] as String? ?? '';
        final finishReason = choice['finish_reason'] as String?;
        final usage = decoded['usage'] as Map<String, dynamic>?;
        return AppResult<LlmResponse>.success(
          LlmResponse(
            content: content,
            finishReason: finishReason,
            promptTokens: usage?['prompt_tokens'] as int?,
            completionTokens: usage?['completion_tokens'] as int?,
          ),
        );
      } on Exception catch (e) {
        return AppResult<LlmResponse>.failure(_responseParseError(e));
      }
    } on SocketException catch (e) {
      return AppResult<LlmResponse>.failure(_connectionError(e));
    } on http.ClientException catch (e) {
      return AppResult<LlmResponse>.failure(_connectionError(e));
    } on Exception catch (e) {
      return AppResult<LlmResponse>.failure(_connectionError(e));
    }
  }

  @override
  Stream<LlmStreamChunk> chatCompletionStream(LlmRequest request) async* {
    final http.StreamedResponse response;
    try {
      final req = http.Request(
        'POST',
        _resolve(request.baseUrl, '/chat/completions'),
      )
        ..headers.addAll(_authHeaders(request.apiKey))
        ..body = jsonEncode(_buildBody(request, stream: true));
      response = await _client.send(req);
    } on SocketException catch (e) {
      yield LlmStreamChunk.error(_connectionError(e));
      return;
    } on http.ClientException catch (e) {
      yield LlmStreamChunk.error(_connectionError(e));
      return;
    } on Exception catch (e) {
      yield LlmStreamChunk.error(_connectionError(e));
      return;
    }

    if (response.statusCode != 200) {
      final body = await response.stream.bytesToString().catchError(
            (Object _) => '',
          );
      yield LlmStreamChunk.error(
        _errorForStatus(response.statusCode, body),
      );
      return;
    }

    var sawFinish = false;
    try {
      await for (final event in parseSseStream(response.stream)) {
        if (event.data == _doneMarker) {
          if (!sawFinish) {
            yield const LlmStreamChunk.done(null);
            sawFinish = true;
          }
          return;
        }
        try {
          final decoded = jsonDecode(event.data) as Map<String, dynamic>;
          final choices = decoded['choices'] as List<dynamic>? ?? <dynamic>[];
          if (choices.isEmpty) {
            continue;
          }
          final choice = choices.first as Map<String, dynamic>;
          final delta = choice['delta'] as Map<String, dynamic>? ??
              <String, dynamic>{};
          final text = delta['content'] as String? ?? '';
          if (text.isNotEmpty) {
            yield LlmStreamChunk.textDelta(text);
          }
          final finishReason = choice['finish_reason'] as String?;
          if (finishReason != null) {
            yield LlmStreamChunk.done(finishReason);
            sawFinish = true;
            return;
          }
        } on Exception catch (e) {
          yield LlmStreamChunk.error(_sseParseError(e));
        }
      }
    } on SocketException catch (e) {
      yield LlmStreamChunk.error(_connectionError(e));
      return;
    } on http.ClientException catch (e) {
      yield LlmStreamChunk.error(_connectionError(e));
      return;
    }

    if (!sawFinish) {
      yield const LlmStreamChunk.done(null);
    }
  }
}
