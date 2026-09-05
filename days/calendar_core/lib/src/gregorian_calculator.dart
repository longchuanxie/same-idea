import 'models.dart';

class GregorianCalculator {
  static CalendarResult<DateTime> occurrenceForYear({
    required int month,
    required int day,
    required int targetYear,
    LeapDayPolicy leapDayPolicy = LeapDayPolicy.feb28,
  }) {
    try {
      return CalendarResult(
          dateUtc(targetYear, month, day), OccurrenceStatus.valid);
    } on ArgumentError {
      if (month == 2 && day == 29) {
        return switch (leapDayPolicy) {
          LeapDayPolicy.feb28 =>
            CalendarResult(dateUtc(targetYear, 2, 28), OccurrenceStatus.valid),
          LeapDayPolicy.mar01 =>
            CalendarResult(dateUtc(targetYear, 3, 1), OccurrenceStatus.valid),
          LeapDayPolicy.skip => const CalendarResult(
              null, OccurrenceStatus.skipped, 'Leap day skipped'),
        };
      }
      return const CalendarResult(
          null, OccurrenceStatus.invalid, 'Invalid Gregorian date');
    }
  }
}
