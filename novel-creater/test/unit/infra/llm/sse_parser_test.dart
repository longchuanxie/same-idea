import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/infra/llm/sse_parser.dart';

Stream<List<int>> _streamOf(String text) async* {
  yield utf8.encode(text);
}

void main() {
  group('parseSseStream', () {
    test('parses single event with data line', () async {
      final stream = _streamOf('data: hello\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events, hasLength(1));
      expect(events.single.data, 'hello');
    });

    test('parses multiple events split by blank lines', () async {
      final stream = _streamOf('data: a\n\ndata: b\n\ndata: c\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.map((e) => e.data).toList(), ['a', 'b', 'c']);
    });

    test('joins multi-line data fields with newline', () async {
      final stream = _streamOf('data: line1\ndata: line2\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'line1\nline2');
    });

    test('skips comment lines starting with colon', () async {
      final stream = _streamOf(':ping\ndata: value\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'value');
    });

    test('captures event and id fields', () async {
      final stream = _streamOf('event: delta\nid: 42\ndata: x\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.event, 'delta');
      expect(events.single.id, '42');
      expect(events.single.data, 'x');
    });

    test('ignores malformed lines without colon', () async {
      final stream = _streamOf('garbage\ndata: ok\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'ok');
    });

    test('handles chunked byte boundaries', () async {
      Stream<List<int>> chunked() async* {
        yield utf8.encode('data: hel');
        yield utf8.encode('lo\n\ndata: world\n\n');
      }

      final events = await parseSseStream(chunked()).toList();
      expect(events.map((e) => e.data).toList(), ['hello', 'world']);
    });

    test('emits final event without trailing blank line on stream close',
        () async {
      final stream = _streamOf('data: last\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'last');
    });
  });
}
