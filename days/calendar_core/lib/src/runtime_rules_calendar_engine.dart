import 'dart:convert';
import 'dart:io';

import 'models.dart';
import 'occurrence_generator.dart';

class RuntimeRulesCalendarEngine {
  RuntimeRulesCalendarEngine._(this._rules)
      : ruleVersion = _rules.version,
        supportedRange = DateRange(
          parseDate(_rules.range.start),
          parseDate(_rules.range.end),
        ) {
    _monthSpans = _buildMonthSpans(_rules);
    _monthByKey = {
      for (final span in _monthSpans)
        _monthKey(span.lunarYear, span.lunarMonth, span.isLeapMonth): span,
    };
    _leapMonthByYear = {
      for (final year in _rules.years) year.lunarYear: year.leapMonth,
    };
    _occurrenceGenerator = OccurrenceGenerator(this);
  }

  final _RuntimeRules _rules;
  final String engineVersion = 'calendar-engine-dart-1.0.0';
  final String ruleVersion;
  final DateRange supportedRange;

  late final List<_MonthSpan> _monthSpans;
  late final Map<String, _MonthSpan> _monthByKey;
  late final Map<int, int?> _leapMonthByYear;
  late final OccurrenceGenerator _occurrenceGenerator;

  static RuntimeRulesCalendarEngine load(String path) {
    final jsonObject =
        json.decode(File(path).readAsStringSync()) as Map<String, Object?>;
    return fromJsonObject(jsonObject);
  }

  static RuntimeRulesCalendarEngine fromJsonString(String source) {
    final jsonObject = json.decode(source) as Map<String, Object?>;
    return fromJsonObject(jsonObject);
  }

  static RuntimeRulesCalendarEngine fromJsonObject(
    Map<String, Object?> jsonObject,
  ) {
    return RuntimeRulesCalendarEngine._(_RuntimeRules.fromJson(jsonObject));
  }

  CalendarResult<LunarDate> gregorianToLunar(DateTime date) {
    if (!_isSupported(date)) {
      return const CalendarResult(
          null, OccurrenceStatus.outOfRange, 'Date is outside supported range');
    }
    _MonthSpan? span;
    for (final candidate in _monthSpans) {
      if (!candidate.startGregorian.isAfter(date)) {
        span = candidate;
      } else {
        break;
      }
    }
    if (span == null) {
      return const CalendarResult(
          null, OccurrenceStatus.outOfRange, 'No lunar month covers date');
    }
    final lunarDay = date.difference(span.startGregorian).inDays + 1;
    if (lunarDay < 1 || lunarDay > span.days) {
      return const CalendarResult(null, OccurrenceStatus.outOfRange,
          'Date is outside available lunar span');
    }
    return CalendarResult(
      LunarDate(
        lunarYear: span.lunarYear,
        lunarMonth: span.lunarMonth,
        lunarDay: lunarDay,
        isLeapMonth: span.isLeapMonth,
        monthDays: span.days,
      ),
      OccurrenceStatus.valid,
    );
  }

  CalendarResult<DateTime> lunarToGregorian(LunarDatePayload lunarDate) {
    final lunarYear = lunarDate.lunarYear;
    if (lunarYear == null) {
      return const CalendarResult(
          null, OccurrenceStatus.invalid, 'lunarYear is required');
    }
    final span = _monthByKey[
        _monthKey(lunarYear, lunarDate.lunarMonth, lunarDate.isLeapMonth)];
    if (span == null) {
      return const CalendarResult(
          null, OccurrenceStatus.outOfRange, 'No matching lunar month');
    }
    if (lunarDate.lunarDay < 1 || lunarDate.lunarDay > span.days) {
      return const CalendarResult(
          null, OccurrenceStatus.invalid, 'Invalid lunar day');
    }
    final gregorian =
        span.startGregorian.add(Duration(days: lunarDate.lunarDay - 1));
    if (!_isSupported(gregorian)) {
      return const CalendarResult(null, OccurrenceStatus.outOfRange,
          'Mapped date is outside supported range');
    }
    return CalendarResult(gregorian, OccurrenceStatus.valid);
  }

  CalendarResult<int> getLunarMonthDays(
    int lunarYear,
    int lunarMonth,
    bool isLeapMonth,
  ) {
    final span = _monthByKey[_monthKey(lunarYear, lunarMonth, isLeapMonth)];
    if (span == null) {
      return const CalendarResult(
          null, OccurrenceStatus.outOfRange, 'No matching lunar month');
    }
    return CalendarResult(span.days, OccurrenceStatus.valid);
  }

  CalendarResult<int?> getLeapMonth(int lunarYear) {
    if (!_leapMonthByYear.containsKey(lunarYear)) {
      return const CalendarResult(
          null, OccurrenceStatus.outOfRange, 'Year is outside supported range');
    }
    return CalendarResult(_leapMonthByYear[lunarYear], OccurrenceStatus.valid);
  }

  Occurrence generateOccurrenceForYear(
    AnniversaryEventInput event,
    int targetYear,
  ) =>
      _occurrenceGenerator.generateOccurrenceForYear(event, targetYear);

  Occurrence getNextOccurrence(
    AnniversaryEventInput event,
    DateTime fromDate,
  ) =>
      _occurrenceGenerator.getNextOccurrence(event, fromDate);

  List<Occurrence> getFutureOccurrences(
    AnniversaryEventInput event,
    DateTime fromDate,
    int count,
  ) =>
      _occurrenceGenerator.getFutureOccurrences(event, fromDate, count);

  bool _isSupported(DateTime date) =>
      !date.isBefore(supportedRange.start) && !date.isAfter(supportedRange.end);

  static String _monthKey(int lunarYear, int lunarMonth, bool isLeapMonth) =>
      '$lunarYear-$lunarMonth-$isLeapMonth';

  static List<_MonthSpan> _buildMonthSpans(_RuntimeRules rules) {
    final spans = <_MonthSpan>[
      _MonthSpan(1900, 11, false, 29, dateUtc(1900, 12, 22)),
      _MonthSpan(1900, 12, false, 30, dateUtc(1901, 1, 20)),
    ];
    for (final year in rules.years) {
      for (final month in year.months) {
        spans.add(
          _MonthSpan(
            year.lunarYear,
            month.month,
            month.isLeap,
            month.days,
            parseDate(month.startGregorian),
          ),
        );
      }
    }
    spans.sort(
        (left, right) => left.startGregorian.compareTo(right.startGregorian));
    return spans;
  }
}

class _MonthSpan {
  const _MonthSpan(
    this.lunarYear,
    this.lunarMonth,
    this.isLeapMonth,
    this.days,
    this.startGregorian,
  );

  final int lunarYear;
  final int lunarMonth;
  final bool isLeapMonth;
  final int days;
  final DateTime startGregorian;
}

class _RuntimeRules {
  const _RuntimeRules({
    required this.version,
    required this.range,
    required this.years,
  });

  final String version;
  final _RuleRange range;
  final List<_RuleYear> years;

  factory _RuntimeRules.fromJson(Map<String, Object?> json) {
    return _RuntimeRules(
      version: json['version']! as String,
      range: _RuleRange.fromJson(json['range']! as Map<String, Object?>),
      years: (json['years']! as List<Object?>)
          .cast<Map<String, Object?>>()
          .map(_RuleYear.fromJson)
          .toList(growable: false),
    );
  }
}

class _RuleRange {
  const _RuleRange({required this.start, required this.end});

  final String start;
  final String end;

  factory _RuleRange.fromJson(Map<String, Object?> json) {
    return _RuleRange(
      start: json['start']! as String,
      end: json['end']! as String,
    );
  }
}

class _RuleYear {
  const _RuleYear({
    required this.lunarYear,
    required this.leapMonth,
    required this.months,
  });

  final int lunarYear;
  final int? leapMonth;
  final List<_RuleMonth> months;

  factory _RuleYear.fromJson(Map<String, Object?> json) {
    return _RuleYear(
      lunarYear: json['lunarYear']! as int,
      leapMonth: json['leapMonth'] as int?,
      months: (json['months']! as List<Object?>)
          .cast<Map<String, Object?>>()
          .map(_RuleMonth.fromJson)
          .toList(growable: false),
    );
  }
}

class _RuleMonth {
  const _RuleMonth({
    required this.month,
    required this.isLeap,
    required this.days,
    required this.startGregorian,
  });

  final int month;
  final bool isLeap;
  final int days;
  final String startGregorian;

  factory _RuleMonth.fromJson(Map<String, Object?> json) {
    return _RuleMonth(
      month: json['month']! as int,
      isLeap: json['isLeap']! as bool,
      days: json['days']! as int,
      startGregorian: json['startGregorian']! as String,
    );
  }
}
