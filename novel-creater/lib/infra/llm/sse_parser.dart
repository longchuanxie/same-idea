import 'dart:async';
import 'dart:convert';

final class SseEvent {
  const SseEvent({required this.data, this.event, this.id});

  final String? event;
  final String data;
  final String? id;
}

Stream<SseEvent> parseSseStream(Stream<List<int>> byteStream) async* {
  final decoder = utf8.decoder;
  var buffer = '';
  String? currentEvent;
  String? currentId;
  final dataLines = <String>[];

  SseEvent? flush() {
    if (dataLines.isEmpty && currentEvent == null && currentId == null) {
      return null;
    }
    final event = SseEvent(
      event: currentEvent,
      data: dataLines.join('\n'),
      id: currentId,
    );
    currentEvent = null;
    currentId = null;
    dataLines.clear();
    return event;
  }

  await for (final bytes in byteStream) {
    final chunk = decoder.convert(bytes);
    final combined = StringBuffer(buffer)..write(chunk);
    buffer = combined.toString();
    while (true) {
      final newlineIndex = buffer.indexOf('\n');
      if (newlineIndex < 0) break;
      final rawLine = buffer.substring(0, newlineIndex);
      buffer = buffer.substring(newlineIndex + 1);
      final line = rawLine.endsWith('\r')
          ? rawLine.substring(0, rawLine.length - 1)
          : rawLine;

      if (line.isEmpty) {
        final event = flush();
        if (event != null) yield event;
        continue;
      }
      if (line.startsWith(':')) {
        continue;
      }
      final colonIndex = line.indexOf(':');
      if (colonIndex < 0) {
        continue;
      }
      final field = line.substring(0, colonIndex);
      var value = line.substring(colonIndex + 1);
      if (value.startsWith(' ')) {
        value = value.substring(1);
      }
      switch (field) {
        case 'data':
          dataLines.add(value);
        case 'event':
          currentEvent = value;
        case 'id':
          currentId = value;
      }
    }
  }

  if (buffer.isNotEmpty) {
    final line = buffer.endsWith('\r')
        ? buffer.substring(0, buffer.length - 1)
        : buffer;
    if (line.isNotEmpty && !line.startsWith(':')) {
      final colonIndex = line.indexOf(':');
      if (colonIndex >= 0) {
        final field = line.substring(0, colonIndex);
        var value = line.substring(colonIndex + 1);
        if (value.startsWith(' ')) value = value.substring(1);
        switch (field) {
          case 'data':
            dataLines.add(value);
          case 'event':
            currentEvent = value;
          case 'id':
            currentId = value;
        }
      }
    }
  }

  final tail = flush();
  if (tail != null) yield tail;
}
