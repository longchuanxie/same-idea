enum CalendarType {
  gregorian('GREGORIAN'),
  chineseLunar('CHINESE_LUNAR');

  const CalendarType(this.wireName);

  final String wireName;

  static CalendarType parse(String value) =>
      CalendarType.values.firstWhere((type) => type.wireName == value);
}

enum RepeatType {
  none('NONE'),
  yearly('YEARLY');

  const RepeatType(this.wireName);

  final String wireName;

  static RepeatType parse(String value) =>
      RepeatType.values.firstWhere((type) => type.wireName == value);
}

enum OccurrenceStatus {
  valid('VALID'),
  skipped('SKIPPED'),
  needConfirm('NEED_CONFIRM'),
  outOfRange('OUT_OF_RANGE'),
  invalid('INVALID');

  const OccurrenceStatus(this.wireName);

  final String wireName;
}

enum LeapDayPolicy {
  feb28('FEB_28'),
  mar01('MAR_01'),
  skip('SKIP');

  const LeapDayPolicy(this.wireName);

  final String wireName;

  static LeapDayPolicy parse(String value) =>
      LeapDayPolicy.values.firstWhere((policy) => policy.wireName == value);
}

enum MissingLunarDayPolicy {
  lastDayOfMonth('LAST_DAY_OF_MONTH'),
  nextMonthFirstDay('NEXT_MONTH_FIRST_DAY'),
  skip('SKIP'),
  ask('ASK');

  const MissingLunarDayPolicy(this.wireName);

  final String wireName;

  static MissingLunarDayPolicy parse(String value) =>
      MissingLunarDayPolicy.values
          .firstWhere((policy) => policy.wireName == value);
}

enum LeapMonthPolicy {
  normalMonthFallback('NORMAL_MONTH_FALLBACK'),
  onlyLeapMonth('ONLY_LEAP_MONTH'),
  ask('ASK');

  const LeapMonthPolicy(this.wireName);

  final String wireName;

  static LeapMonthPolicy parse(String value) =>
      LeapMonthPolicy.values.firstWhere((policy) => policy.wireName == value);
}

class DateRange {
  const DateRange(this.start, this.end);

  final DateTime start;
  final DateTime end;
}

sealed class DatePayload {
  const DatePayload();
}

class GregorianDatePayload extends DatePayload {
  const GregorianDatePayload({
    required this.year,
    required this.month,
    required this.day,
    required this.timezone,
  });

  final int year;
  final int month;
  final int day;
  final String timezone;
}

class LunarDatePayload extends DatePayload {
  const LunarDatePayload({
    required this.lunarYear,
    required this.lunarMonth,
    required this.lunarDay,
    required this.isLeapMonth,
    required this.timezoneBasis,
  });

  final int? lunarYear;
  final int lunarMonth;
  final int lunarDay;
  final bool isLeapMonth;
  final String timezoneBasis;
}

class LunarDate {
  const LunarDate({
    required this.lunarYear,
    required this.lunarMonth,
    required this.lunarDay,
    required this.isLeapMonth,
    required this.monthDays,
  });

  final int lunarYear;
  final int lunarMonth;
  final int lunarDay;
  final bool isLeapMonth;
  final int monthDays;
}

class RepeatRule {
  const RepeatRule({
    required this.type,
    this.leapDayPolicy = LeapDayPolicy.feb28,
    this.missingLunarDayPolicy = MissingLunarDayPolicy.lastDayOfMonth,
    this.leapMonthPolicy = LeapMonthPolicy.normalMonthFallback,
  });

  final RepeatType type;
  final LeapDayPolicy leapDayPolicy;
  final MissingLunarDayPolicy missingLunarDayPolicy;
  final LeapMonthPolicy leapMonthPolicy;
}

class AnniversaryEventInput {
  const AnniversaryEventInput({
    required this.id,
    required this.title,
    required this.calendarType,
    required this.datePayload,
    required this.repeatRule,
  });

  final String id;
  final String title;
  final CalendarType calendarType;
  final DatePayload datePayload;
  final RepeatRule repeatRule;
}

class CalendarResult<T> {
  const CalendarResult(this.value, this.status, [this.reason]);

  final T? value;
  final OccurrenceStatus status;
  final String? reason;
}

class Occurrence {
  const Occurrence({
    required this.eventId,
    required this.targetYear,
    required this.occurrenceDate,
    required this.sourceDisplay,
    required this.status,
    required this.engineVersion,
    required this.ruleVersion,
    this.reason,
  });

  final String eventId;
  final int targetYear;
  final DateTime? occurrenceDate;
  final String sourceDisplay;
  final OccurrenceStatus status;
  final String? reason;
  final String engineVersion;
  final String ruleVersion;
}

DateTime dateUtc(int year, int month, int day) {
  final date = DateTime.utc(year, month, day);
  if (date.year != year || date.month != month || date.day != day) {
    throw ArgumentError('Invalid date: $year-$month-$day');
  }
  return date;
}

DateTime parseDate(String value) {
  final parts = value.split('-').map(int.parse).toList(growable: false);
  if (parts.length != 3) {
    throw ArgumentError('Invalid ISO date: $value');
  }
  return dateUtc(parts[0], parts[1], parts[2]);
}

String formatDate(DateTime date) {
  String two(int value) => value.toString().padLeft(2, '0');
  return '${date.year.toString().padLeft(4, '0')}-${two(date.month)}-${two(date.day)}';
}
