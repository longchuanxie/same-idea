import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';

void main() {
  group('LlmRequest', () {
    test('serializes with default values', () {
      const req = LlmRequest(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-x',
        model: 'gpt-4o',
        messages: <LlmMessage>[
          LlmMessage(role: 'user', content: 'hi'),
        ],
      );
      final json = req.toJson();
      expect(json['model'], 'gpt-4o');
      expect(json['temperature'], 0.7);
      expect(json['stream'], true);
      expect(
        (json['messages']! as List<dynamic>).first,
        isA<Map<String, dynamic>>(),
      );
    });

    test('roundtrips with overridden temperature', () {
      const req = LlmRequest(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-x',
        model: 'gpt-4o',
        messages: <LlmMessage>[LlmMessage(role: 'user', content: 'hi')],
        temperature: 0.3,
        stream: false,
      );
      final restored = LlmRequest.fromJson(req.toJson());
      expect(restored, req);
    });
  });
}
