import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';
import 'package:test/test.dart';

void main() {
  final engine = RuntimeRulesCalendarEngine.load(
      _repoPath('shared/calendar/calendar-runtime-rules-v1.json'));

  test('matches full golden gregorian to lunar and round trip', () {
    final payload = json.decode(
        File(_repoPath('shared/calendar/calendar-golden-1901-2100.json'))
            .readAsStringSync()) as Map<String, Object?>;
    final days =
        (payload['days']! as List<Object?>).cast<Map<String, Object?>>();

    for (final row in days) {
      final gregorianText = row['gregorian']! as String;
      final gregorian = parseDate(gregorianText);
      final lunar = engine.gregorianToLunar(gregorian);
      expect(lunar.status, OccurrenceStatus.valid, reason: gregorianText);
      expect(lunar.value, isNotNull, reason: gregorianText);
      expect(lunar.value!.lunarYear, row['lunarYear'], reason: gregorianText);
      expect(lunar.value!.lunarMonth, row['lunarMonth'], reason: gregorianText);
      expect(lunar.value!.lunarDay, row['lunarDay'], reason: gregorianText);
      expect(lunar.value!.isLeapMonth, row['isLeapMonth'],
          reason: gregorianText);
      expect(lunar.value!.monthDays, row['lunarMonthDays'],
          reason: gregorianText);

      final roundTrip = engine.lunarToGregorian(
        LunarDatePayload(
          lunarYear: row['lunarYear']! as int,
          lunarMonth: row['lunarMonth']! as int,
          lunarDay: row['lunarDay']! as int,
          isLeapMonth: row['isLeapMonth']! as bool,
          timezoneBasis: 'Asia/Shanghai',
        ),
      );
      expect(roundTrip.status, OccurrenceStatus.valid, reason: gregorianText);
      expect(formatDate(roundTrip.value!), gregorianText,
          reason: gregorianText);
    }
  });

  test('handles leap day policies', () {
    final event = AnniversaryEventInput(
      id: 'gregorian-leap-day',
      title: 'Leap Day',
      calendarType: CalendarType.gregorian,
      datePayload: const GregorianDatePayload(
        year: 2024,
        month: 2,
        day: 29,
        timezone: 'Asia/Shanghai',
      ),
      repeatRule: const RepeatRule(
        type: RepeatType.yearly,
        leapDayPolicy: LeapDayPolicy.feb28,
      ),
    );

    final occurrence = engine.generateOccurrenceForYear(event, 2025);
    expect(occurrence.status, OccurrenceStatus.valid);
    expect(formatDate(occurrence.occurrenceDate!), '2025-02-28');
  });

  test('handles leap month fallback and strict leap month', () {
    final event = AnniversaryEventInput(
      id: 'leap-fourth-month',
      title: 'Leap Fourth',
      calendarType: CalendarType.chineseLunar,
      datePayload: const LunarDatePayload(
        lunarYear: 2020,
        lunarMonth: 4,
        lunarDay: 1,
        isLeapMonth: true,
        timezoneBasis: 'Asia/Shanghai',
      ),
      repeatRule: const RepeatRule(type: RepeatType.yearly),
    );

    expect(
        formatDate(
            engine.generateOccurrenceForYear(event, 2020).occurrenceDate!),
        '2020-05-23');
    expect(
        formatDate(
            engine.generateOccurrenceForYear(event, 2021).occurrenceDate!),
        '2021-05-12');
  });

  test('handles missing lunar day policy', () {
    final event = AnniversaryEventInput(
      id: 'lunar-thirty',
      title: 'Lunar Thirty',
      calendarType: CalendarType.chineseLunar,
      datePayload: const LunarDatePayload(
        lunarYear: 2026,
        lunarMonth: 8,
        lunarDay: 30,
        isLeapMonth: false,
        timezoneBasis: 'Asia/Shanghai',
      ),
      repeatRule: const RepeatRule(
        type: RepeatType.yearly,
        missingLunarDayPolicy: MissingLunarDayPolicy.lastDayOfMonth,
      ),
    );

    final occurrence = engine.generateOccurrenceForYear(event, 2026);
    expect(occurrence.status, OccurrenceStatus.valid);
    expect(formatDate(occurrence.occurrenceDate!), '2026-10-09');
  });

  test('matches regression scenarios', () {
    final payload = json.decode(
      File(_repoPath('shared/calendar/calendar-regression-scenarios-v1.json'))
          .readAsStringSync(),
    ) as Map<String, Object?>;
    final scenarios =
        (payload['scenarios']! as List<Object?>).cast<Map<String, Object?>>();
    expect(scenarios.length, greaterThanOrEqualTo(120));

    for (final scenario in scenarios) {
      final id = scenario['id']! as String;
      final event =
          _scenarioEventToInput(id, scenario['event']! as Map<String, Object?>);
      final fromDate = parseDate(scenario['fromDate']! as String);
      final expected = scenario['expected']! as Map<String, Object?>;

      final next = engine.getNextOccurrence(event, fromDate);
      expect(next.status.wireName, expected['status'], reason: id);
      expect(
          next.occurrenceDate == null ? null : formatDate(next.occurrenceDate!),
          expected['nextOccurrence'],
          reason: id);

      final future = engine
          .getFutureOccurrences(event, fromDate, 5)
          .map((occurrence) => occurrence.occurrenceDate)
          .whereType<DateTime>()
          .map(formatDate)
          .toList(growable: false);
      expect(future, expected['futureOccurrences'], reason: id);
    }
  });
}

AnniversaryEventInput _scenarioEventToInput(
    String id, Map<String, Object?> event) {
  final type = CalendarType.parse(event['calendarType']! as String);
  final datePayload = event['datePayload']! as Map<String, Object?>;
  final payload = switch (type) {
    CalendarType.gregorian => GregorianDatePayload(
        year: datePayload['year']! as int,
        month: datePayload['month']! as int,
        day: datePayload['day']! as int,
        timezone: (datePayload['timezone'] as String?) ?? 'Asia/Shanghai',
      ),
    CalendarType.chineseLunar => LunarDatePayload(
        lunarYear: datePayload['lunarYear'] as int?,
        lunarMonth: datePayload['lunarMonth']! as int,
        lunarDay: datePayload['lunarDay']! as int,
        isLeapMonth: (datePayload['isLeapMonth'] as bool?) ?? false,
        timezoneBasis:
            (datePayload['timezoneBasis'] as String?) ?? 'Asia/Shanghai',
      ),
  };
  final repeatRule = event['repeatRule']! as Map<String, Object?>;
  return AnniversaryEventInput(
    id: id,
    title: id,
    calendarType: type,
    datePayload: payload,
    repeatRule: RepeatRule(
      type: RepeatType.parse(repeatRule['type']! as String),
      leapDayPolicy:
          LeapDayPolicy.parse(repeatRule['leapDayPolicy']! as String),
      missingLunarDayPolicy: MissingLunarDayPolicy.parse(
          repeatRule['missingLunarDayPolicy']! as String),
      leapMonthPolicy:
          LeapMonthPolicy.parse(repeatRule['leapMonthPolicy']! as String),
    ),
  );
}

String _repoPath(String relativePath) {
  final fromPackage = File('../$relativePath');
  if (fromPackage.existsSync()) {
    return fromPackage.path;
  }
  final fromRepo = File(relativePath);
  if (fromRepo.existsSync()) {
    return fromRepo.path;
  }
  throw StateError('Cannot locate $relativePath');
}
