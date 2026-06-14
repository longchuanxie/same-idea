import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';
import 'package:novel_creator/infra/llm/openai_compatible_client.dart';

void main() {
  group('OpenAiCompatibleClient', () {
    test('listModels parses data array and sends bearer auth', () async {
      http.BaseRequest? captured;
      final mock = MockClient((request) async {
        captured = request;
        return http.Response(
          jsonEncode(<String, dynamic>{
            'data': <Map<String, dynamic>>[
              <String, dynamic>{'id': 'gpt-4o'},
              <String, dynamic>{'id': 'gpt-3.5'},
            ],
          }),
          200,
        );
      });
      final client = OpenAiCompatibleClient(client: mock);

      final result = await client.listModels(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-key',
      );

      expect(result, isA<AppSuccess<List<LlmModel>>>());
      final models = (result as AppSuccess<List<LlmModel>>).value;
      expect(models, hasLength(2));
      expect(models[0].id, 'gpt-4o');
      expect(models[0].modelId, 'gpt-4o');
      expect(models[0].name, 'gpt-4o');
      expect(models[1].id, 'gpt-3.5');
      expect(captured, isNotNull);
      expect(captured!.url.toString(), 'https://api.openai.com/v1/models');
      expect(captured!.headers['Authorization'], 'Bearer test-key');
    });

    test('listModels returns llm.auth_failed on 401', () async {
      final mock = MockClient(
        (request) async => http.Response('unauthorized', 401),
      );
      final client = OpenAiCompatibleClient(client: mock);

      final result = await client.listModels(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'bad-key',
      );

      expect(result, isA<AppFailure<List<LlmModel>>>());
      expect(
        (result as AppFailure<List<LlmModel>>).error.code,
        'llm.auth_failed',
      );
    });

    test('chatCompletion parses non-stream response', () async {
      final mock = MockClient(
        (request) async => http.Response(
          jsonEncode(<String, dynamic>{
            'choices': <Map<String, dynamic>>[
              <String, dynamic>{
                'message': <String, dynamic>{'content': 'hello world'},
                'finish_reason': 'stop',
              },
            ],
          }),
          200,
        ),
      );
      final client = OpenAiCompatibleClient(client: mock);

      final result = await client.chatCompletion(
        const LlmRequest(
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'test-key',
          model: 'gpt-4o',
          messages: <LlmMessage>[
            LlmMessage(role: 'user', content: 'hi'),
          ],
          stream: false,
        ),
      );

      expect(result, isA<AppSuccess<LlmResponse>>());
      final response = (result as AppSuccess<LlmResponse>).value;
      expect(response.content, 'hello world');
      expect(response.finishReason, 'stop');
    });

    test('chatCompletionStream yields TextDelta then StreamDone', () async {
      const finishChunk =
          '{"choices":[{"delta":{"content":"lo"},"finish_reason":"stop"}]}';
      const sse =
          'data: {"choices":[{"delta":{"content":"hel"}}]}\n\n'
          'data: $finishChunk\n\n'
          'data: [DONE]\n\n';
      final mock = MockClient.streaming((request, bodyStream) async {
        final stream = Stream<List<int>>.fromIterable(<List<int>>[
          utf8.encode(sse),
        ]);
        return http.StreamedResponse(stream, 200);
      });
      final client = OpenAiCompatibleClient(client: mock);

      final chunks = await client
          .chatCompletionStream(
            const LlmRequest(
              baseUrl: 'https://api.openai.com/v1',
              apiKey: 'test-key',
              model: 'gpt-4o',
              messages: <LlmMessage>[
                LlmMessage(role: 'user', content: 'hi'),
              ],
            ),
          )
          .take(3)
          .toList();

      expect(chunks, hasLength(3));
      expect(chunks[0], isA<TextDelta>());
      expect((chunks[0] as TextDelta).text, 'hel');
      expect(chunks[1], isA<TextDelta>());
      expect((chunks[1] as TextDelta).text, 'lo');
      expect(chunks[2], isA<StreamDone>());
      expect((chunks[2] as StreamDone).finishReason, 'stop');
    });

    test('testConnection returns llm.connection_failed on SocketException',
        () async {
      final mock = MockClient((request) async {
        throw const SocketException('network down');
      });
      final client = OpenAiCompatibleClient(client: mock);

      final result = await client.testConnection(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-key',
        modelId: 'gpt-4o',
      );

      expect(result, isA<AppFailure<void>>());
      expect(
        (result as AppFailure<void>).error.code,
        'llm.connection_failed',
      );
    });
  });
}
