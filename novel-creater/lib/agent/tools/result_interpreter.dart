import 'dart:convert';

import 'package:novel_creator/domain/domain.dart';

class ToolOutputFormatException implements Exception {
  const ToolOutputFormatException(this.error);

  final AppError error;
}

class ResultInterpreter {
  const ResultInterpreter();

  Map<String, Object?>? parseObject(String content) {
    final trimmed = content.trim();
    if (trimmed.isEmpty) return null;

    final direct = _tryDecode(trimmed);
    if (direct != null) return direct;

    final start = trimmed.indexOf('{');
    final end = trimmed.lastIndexOf('}');
    if (start == -1 || end <= start) return null;
    return _tryDecode(trimmed.substring(start, end + 1));
  }

  List<String> stringList(
    Map<String, Object?> json,
    String key,
  ) {
    final value = json[key];
    if (value is List) {
      return value.whereType<String>().toList();
    }
    return const [];
  }

  String requiredString(
    Map<String, Object?> json,
    String key,
  ) {
    final value = json[key];
    if (value is String && value.trim().isNotEmpty) {
      return value;
    }
    throw ToolOutputFormatException(
      AppError(
        code: 'TOOL_OUTPUT_MISSING_FIELD',
        message: 'Missing required field: $key',
        userMessage: 'Tool output is missing required field: $key',
        source: AppErrorSource.llm,
      ),
    );
  }

  Map<String, Object?>? _tryDecode(String content) {
    try {
      final decoded = jsonDecode(content);
      return decoded is Map<String, Object?> ? decoded : null;
    } catch (_) {
      return null;
    }
  }
}
