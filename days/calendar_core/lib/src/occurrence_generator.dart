import 'date_display_formatter.dart';
import 'gregorian_calculator.dart';
import 'models.dart';
import 'runtime_rules_calendar_engine.dart';

class OccurrenceGenerator {
  OccurrenceGenerator(this._calendarEngine);

  final RuntimeRulesCalendarEngine _calendarEngine;

  Occurrence generateOccurrenceForYear(
    AnniversaryEventInput event,
    int targetYear,
  ) {
    return switch (event.calendarType) {
      CalendarType.gregorian => _generateGregorianOccurrence(event, targetYear),
      CalendarType.chineseLunar => _generateLunarOccurrence(event, targetYear),
    };
  }

  Occurrence getNextOccurrence(
    AnniversaryEventInput event,
    DateTime fromDate,
  ) {
    final startYear = switch (event.repeatRule.type) {
      RepeatType.none => _originalYear(event) ?? fromDate.year,
      RepeatType.yearly => fromDate.year,
    };
    for (var targetYear = startYear;
        targetYear <= _calendarEngine.supportedRange.end.year;
        targetYear++) {
      final occurrence = generateOccurrenceForYear(event, targetYear);
      final date = occurrence.occurrenceDate;
      if (occurrence.status == OccurrenceStatus.valid &&
          date != null &&
          !date.isBefore(fromDate)) {
        return occurrence;
      }
      if (event.repeatRule.type == RepeatType.none) {
        break;
      }
    }
    return _occurrence(
      event: event,
      targetYear: _calendarEngine.supportedRange.end.year,
      date: null,
      sourceDisplay: _sourceDisplay(event),
      status: OccurrenceStatus.outOfRange,
      reason: 'No valid occurrence found in supported range',
    );
  }

  List<Occurrence> getFutureOccurrences(
    AnniversaryEventInput event,
    DateTime fromDate,
    int count,
  ) {
    if (count <= 0) {
      return const [];
    }
    final result = <Occurrence>[];
    final startYear = switch (event.repeatRule.type) {
      RepeatType.none => _originalYear(event) ?? fromDate.year,
      RepeatType.yearly => fromDate.year,
    };
    for (var targetYear = startYear;
        targetYear <= _calendarEngine.supportedRange.end.year;
        targetYear++) {
      final occurrence = generateOccurrenceForYear(event, targetYear);
      final date = occurrence.occurrenceDate;
      if (occurrence.status == OccurrenceStatus.valid &&
          date != null &&
          !date.isBefore(fromDate)) {
        result.add(occurrence);
        if (result.length == count) {
          break;
        }
      }
      if (event.repeatRule.type == RepeatType.none) {
        break;
      }
    }
    return result;
  }

  Occurrence _generateGregorianOccurrence(
    AnniversaryEventInput event,
    int targetYear,
  ) {
    final payload = event.datePayload;
    if (payload is! GregorianDatePayload) {
      return _invalidOccurrence(
          event, targetYear, 'Gregorian payload is required');
    }
    if (event.repeatRule.type == RepeatType.none &&
        targetYear != payload.year) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: _sourceDisplay(event),
        status: OccurrenceStatus.skipped,
        reason: 'Non-repeat event only occurs in original year',
      );
    }
    final actualYear =
        event.repeatRule.type == RepeatType.none ? payload.year : targetYear;
    final result = GregorianCalculator.occurrenceForYear(
      month: payload.month,
      day: payload.day,
      targetYear: actualYear,
      leapDayPolicy: event.repeatRule.leapDayPolicy,
    );
    return switch (result.status) {
      OccurrenceStatus.valid => _occurrenceInRange(
          event, targetYear, result.value, _sourceDisplay(event)),
      OccurrenceStatus.skipped => _occurrence(
          event: event,
          targetYear: targetYear,
          date: null,
          sourceDisplay: _sourceDisplay(event),
          status: OccurrenceStatus.skipped,
          reason: result.reason,
        ),
      _ => _invalidOccurrence(
          event, targetYear, result.reason ?? 'Invalid Gregorian date'),
    };
  }

  Occurrence _generateLunarOccurrence(
    AnniversaryEventInput event,
    int targetYear,
  ) {
    final payload = event.datePayload;
    if (payload is! LunarDatePayload) {
      return _invalidOccurrence(event, targetYear, 'Lunar payload is required');
    }
    if (event.repeatRule.type == RepeatType.none &&
        payload.lunarYear != targetYear) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: _sourceDisplay(event),
        status: OccurrenceStatus.skipped,
        reason: 'Non-repeat event only occurs in original year',
      );
    }

    final actualYear = switch (event.repeatRule.type) {
      RepeatType.none => payload.lunarYear,
      RepeatType.yearly => targetYear,
    };
    if (actualYear == null) {
      return _invalidOccurrence(event, targetYear, 'lunarYear is required');
    }

    final effectiveLeap = _effectiveLeapMonth(event, payload, actualYear);
    if (effectiveLeap == null) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: _sourceDisplay(event),
        status: event.repeatRule.leapMonthPolicy == LeapMonthPolicy.ask
            ? OccurrenceStatus.needConfirm
            : OccurrenceStatus.skipped,
        reason: 'No matching leap month',
      );
    }

    final monthDays = _calendarEngine
        .getLunarMonthDays(
          actualYear,
          payload.lunarMonth,
          effectiveLeap,
        )
        .value;
    if (monthDays == null) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: _sourceDisplay(event),
        status: OccurrenceStatus.outOfRange,
        reason: 'No matching lunar month',
      );
    }

    final int day;
    if (payload.lunarDay <= monthDays) {
      day = payload.lunarDay;
    } else {
      switch (event.repeatRule.missingLunarDayPolicy) {
        case MissingLunarDayPolicy.lastDayOfMonth:
          day = monthDays;
        case MissingLunarDayPolicy.nextMonthFirstDay:
          final next = _nextLunarMonthFirstDay(
            actualYear,
            payload.lunarMonth,
            effectiveLeap,
            payload.timezoneBasis,
          );
          return _occurrenceInRange(
              event, targetYear, next, _sourceDisplay(event));
        case MissingLunarDayPolicy.skip:
          return _occurrence(
            event: event,
            targetYear: targetYear,
            date: null,
            sourceDisplay: _sourceDisplay(event),
            status: OccurrenceStatus.skipped,
            reason: 'Missing lunar day skipped',
          );
        case MissingLunarDayPolicy.ask:
          return _occurrence(
            event: event,
            targetYear: targetYear,
            date: null,
            sourceDisplay: _sourceDisplay(event),
            status: OccurrenceStatus.needConfirm,
            reason: 'Missing lunar day requires confirmation',
          );
      }
    }

    final date = _calendarEngine
        .lunarToGregorian(
          LunarDatePayload(
            lunarYear: actualYear,
            lunarMonth: payload.lunarMonth,
            lunarDay: day,
            isLeapMonth: effectiveLeap,
            timezoneBasis: payload.timezoneBasis,
          ),
        )
        .value;
    return _occurrenceInRange(event, targetYear, date, _sourceDisplay(event));
  }

  bool? _effectiveLeapMonth(
    AnniversaryEventInput event,
    LunarDatePayload payload,
    int targetYear,
  ) {
    if (!payload.isLeapMonth) {
      return false;
    }
    final leapMonth = _calendarEngine.getLeapMonth(targetYear).value;
    if (leapMonth == payload.lunarMonth) {
      return true;
    }
    return switch (event.repeatRule.leapMonthPolicy) {
      LeapMonthPolicy.normalMonthFallback => false,
      LeapMonthPolicy.onlyLeapMonth => null,
      LeapMonthPolicy.ask => null,
    };
  }

  DateTime? _nextLunarMonthFirstDay(
    int lunarYear,
    int lunarMonth,
    bool isLeapMonth,
    String timezoneBasis,
  ) {
    final firstDay = _calendarEngine
        .lunarToGregorian(
          LunarDatePayload(
            lunarYear: lunarYear,
            lunarMonth: lunarMonth,
            lunarDay: 1,
            isLeapMonth: isLeapMonth,
            timezoneBasis: timezoneBasis,
          ),
        )
        .value;
    if (firstDay == null) {
      return null;
    }
    final days = _calendarEngine
        .getLunarMonthDays(lunarYear, lunarMonth, isLeapMonth)
        .value;
    if (days == null) {
      return null;
    }
    return firstDay.add(Duration(days: days));
  }

  int? _originalYear(AnniversaryEventInput event) {
    final payload = event.datePayload;
    return switch (payload) {
      GregorianDatePayload() => payload.year,
      LunarDatePayload() => payload.lunarYear,
    };
  }

  Occurrence _occurrenceInRange(
    AnniversaryEventInput event,
    int targetYear,
    DateTime? date,
    String sourceDisplay,
  ) {
    if (date == null) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: sourceDisplay,
        status: OccurrenceStatus.outOfRange,
        reason: 'No valid occurrence date',
      );
    }
    final range = _calendarEngine.supportedRange;
    if (date.isBefore(range.start) || date.isAfter(range.end)) {
      return _occurrence(
        event: event,
        targetYear: targetYear,
        date: null,
        sourceDisplay: sourceDisplay,
        status: OccurrenceStatus.outOfRange,
        reason: 'Date is outside supported range',
      );
    }
    return _occurrence(
      event: event,
      targetYear: targetYear,
      date: date,
      sourceDisplay: sourceDisplay,
      status: OccurrenceStatus.valid,
    );
  }

  Occurrence _invalidOccurrence(
    AnniversaryEventInput event,
    int targetYear,
    String reason,
  ) {
    return _occurrence(
      event: event,
      targetYear: targetYear,
      date: null,
      sourceDisplay: _sourceDisplay(event),
      status: OccurrenceStatus.invalid,
      reason: reason,
    );
  }

  Occurrence _occurrence({
    required AnniversaryEventInput event,
    required int targetYear,
    required DateTime? date,
    required String sourceDisplay,
    required OccurrenceStatus status,
    String? reason,
  }) {
    return Occurrence(
      eventId: event.id,
      targetYear: targetYear,
      occurrenceDate: date,
      sourceDisplay: sourceDisplay,
      status: status,
      reason: reason,
      engineVersion: _calendarEngine.engineVersion,
      ruleVersion: _calendarEngine.ruleVersion,
    );
  }

  String _sourceDisplay(AnniversaryEventInput event) {
    final payload = event.datePayload;
    return switch (payload) {
      GregorianDatePayload() =>
        formatDate(dateUtc(payload.year, payload.month, payload.day)),
      LunarDatePayload() => DateDisplayFormatter.lunar(
          payload.lunarMonth,
          payload.lunarDay,
          payload.isLeapMonth,
        ),
    };
  }
}
