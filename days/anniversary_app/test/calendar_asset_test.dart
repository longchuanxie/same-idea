import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundled calendar rules asset matches shared runtime rules', () async {
    final bundledSource = await rootBundle.loadString(
      'assets/calendar/calendar-runtime-rules-v1.json',
    );
    final sharedSource = File(
      '../shared/calendar/calendar-runtime-rules-v1.json',
    ).readAsStringSync();

    final bundledJson = json.decode(bundledSource) as Map<String, Object?>;
    final sharedJson = json.decode(sharedSource) as Map<String, Object?>;
    expect(bundledJson, sharedJson);

    final engine = RuntimeRulesCalendarEngine.fromJsonString(bundledSource);
    expect(engine.ruleVersion, bundledJson['version']);
    expect(engine.supportedRange.start, DateTime.utc(1901));
    expect(engine.supportedRange.end, DateTime.utc(2100, 12, 31));
  });
}
