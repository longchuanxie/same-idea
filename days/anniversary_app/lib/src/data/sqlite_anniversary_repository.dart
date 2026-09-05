import 'dart:convert';

import 'package:calendar_core/calendar_core.dart';
import 'package:sqflite/sqflite.dart';

import '../domain/anniversary_preview.dart';
import '../domain/anniversary_reminder.dart';
import '../domain/anniversary_repository.dart';
import 'app_clock.dart';

/// SQLite-backed [AnniversaryRepository] for Android (and Windows via FFI).
///
/// All reads and writes go through a single [Database] instance that is
/// opened externally and passed in via the constructor.
class SQLiteAnniversaryRepository implements AnniversaryRepository {
  SQLiteAnniversaryRepository({
    required this.database,
    DateTime? today,
    RuntimeRulesCalendarEngine? engine,
  })  : today = today ?? currentLocalUtcDate(),
        _engine = engine!;

  final Database database;

  @override
  final DateTime today;

  final RuntimeRulesCalendarEngine _engine;
  var _localIdCounter = 0;

  @override
  RuntimeRulesCalendarEngine get calendarEngine => _engine;

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  @override
  Future<List<AnniversaryPreview>> listHomePreviews() async {
    return listPreviewsFrom(today);
  }

  @override
  Future<List<AnniversaryPreview>> listPreviewsFrom(DateTime fromDate) async {
    final events = await database.query('event', where: 'is_archived = 0');
    if (events.isEmpty) {
      return const [];
    }

    final eventIds = events.map((e) => e['id']! as String).toList();
    final reminders = await _batchQueryReminders(eventIds);
    final previews = <AnniversaryPreview>[];

    for (final row in events) {
      previews.add(
        _buildPreview(row, reminders[row['id'] as String?], fromDate),
      );
    }

    previews.sort((left, right) {
      final leftId = left.id;
      final rightId = right.id;
      final leftPinned =
          events.firstWhere((e) => e['id'] == leftId)['is_pinned'] as int;
      final rightPinned =
          events.firstWhere((e) => e['id'] == rightId)['is_pinned'] as int;
      if (leftPinned != rightPinned) {
        return leftPinned > rightPinned ? -1 : 1;
      }
      return left.daysUntil(fromDate).compareTo(right.daysUntil(fromDate));
    });

    return previews;
  }

  @override
  Future<AnniversaryPreview> primaryPreview() async {
    final previews = await listHomePreviews();
    return previews.first;
  }

  @override
  Future<AnniversaryEventDraft?> getEventDraft(String id) async {
    final rows = await database.query(
      'event',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (rows.isEmpty) {
      return null;
    }

    final eventRow = rows.first;
    final reminderRows = await database.query(
      'reminder_rule',
      where: 'event_id = ?',
      whereArgs: [id],
    );

    return _draftFromRow(eventRow, reminderRows);
  }

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  @override
  Future<void> saveEvent(AnniversaryEventDraft draft) async {
    final now = DateTime.now().toUtc().toIso8601String();
    final id = draft.id ?? _newEventId();
    final title = draft.title.trim().isEmpty ? '新的纪念日' : draft.title.trim();

    await database.transaction((txn) async {
      // Unique-title check inside the transaction.
      final duplicates = await txn.query(
        'event',
        where: 'id != ?',
        whereArgs: [id],
        columns: ['title'],
      );
      final titleKey = anniversaryTitleKey(title);
      for (final row in duplicates) {
        if (anniversaryTitleKey(row['title']! as String) == titleKey) {
          throw DuplicateAnniversaryTitleException(title);
        }
      }

      // Upsert event row.
      final eventRow = _eventRowFromDraft(id, title, draft, now);
      final existing = await txn.query(
        'event',
        where: 'id = ?',
        whereArgs: [id],
        limit: 1,
      );
      if (existing.isEmpty) {
        await txn.insert('event', eventRow);
      } else {
        await txn.update('event', eventRow, where: 'id = ?', whereArgs: [id]);
      }

      // Upsert reminder_rule.
      await txn.delete('reminder_rule', where: 'event_id = ?', whereArgs: [id]);
      final reminderRow = _reminderRowFromDraft(id, draft);
      await txn.insert('reminder_rule', reminderRow);

      // Upsert policy_rule.
      await txn.delete('policy_rule', where: 'event_id = ?', whereArgs: [id]);
      await txn.insert('policy_rule', _policyRowFromDraft(id, draft));

      // Invalidate cached occurrences for this event.
      await txn.delete(
        'occurrence_cache',
        where: 'event_id = ?',
        whereArgs: [id],
      );
    });
  }

  @override
  Future<void> deleteEvent(String id) async {
    await database.transaction((txn) async {
      await txn.delete('occurrence_cache', where: 'event_id = ?', whereArgs: [id]);
      await txn.delete('policy_rule', where: 'event_id = ?', whereArgs: [id]);
      await txn.delete('reminder_rule', where: 'event_id = ?', whereArgs: [id]);
      await txn.delete('event', where: 'id = ?', whereArgs: [id]);
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers — row builders
  // ---------------------------------------------------------------------------

  Map<String, Object?> _eventRowFromDraft(
    String id,
    String title,
    AnniversaryEventDraft draft,
    String now,
  ) {
    final payload = draft.datePayload;
    return {
      'id': id,
      'title': title,
      'category': draft.category,
      'calendar_type': draft.calendarType.wireName,
      if (payload is GregorianDatePayload) ...{
        'gregorian_year': payload.year,
        'gregorian_month': payload.month,
        'gregorian_day': payload.day,
        'gregorian_timezone': payload.timezone,
        'lunar_year': null,
        'lunar_month': null,
        'lunar_day': null,
        'is_leap_month': 0,
        'lunar_timezone': null,
      },
      if (payload is LunarDatePayload) ...{
        'gregorian_year': null,
        'gregorian_month': null,
        'gregorian_day': null,
        'gregorian_timezone': null,
        'lunar_year': payload.lunarYear,
        'lunar_month': payload.lunarMonth,
        'lunar_day': payload.lunarDay,
        'is_leap_month': payload.isLeapMonth ? 1 : 0,
        'lunar_timezone': payload.timezoneBasis,
      },
      'repeat_type': draft.repeatRule.type.wireName,
      'leap_day_policy': draft.repeatRule.leapDayPolicy.wireName,
      'missing_lunar_day_policy':
          draft.repeatRule.missingLunarDayPolicy.wireName,
      'leap_month_policy': draft.repeatRule.leapMonthPolicy.wireName,
      'main_display': 'COUNTDOWN',
      'note': draft.note,
      'is_pinned': 0,
      'is_archived': 0,
      'created_at': now,
      'updated_at': now,
    };
  }

  Map<String, Object?> _reminderRowFromDraft(
    String eventId,
    AnniversaryEventDraft draft,
  ) {
    return {
      'id': '${eventId}_reminder',
      'event_id': eventId,
      'enabled': draft.reminderRule.enabled ? 1 : 0,
      'reminder_time': draft.reminderRule.time,
      'advance_days_json': jsonEncode(draft.reminderRule.advanceDays),
      'timezone_mode': draft.reminderRule.timezoneMode,
      'fixed_timezone': draft.reminderRule.fixedTimezone,
    };
  }

  Map<String, Object?> _policyRowFromDraft(
    String eventId,
    AnniversaryEventDraft draft,
  ) {
    return {
      'event_id': eventId,
      'leap_day_policy': draft.repeatRule.leapDayPolicy.wireName,
      'missing_lunar_day_policy':
          draft.repeatRule.missingLunarDayPolicy.wireName,
      'leap_month_policy': draft.repeatRule.leapMonthPolicy.wireName,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers — object builders
  // ---------------------------------------------------------------------------

  AnniversaryPreview _buildPreview(
    Map<String, Object?> eventRow,
    Map<String, Object?>? reminderRow,
    DateTime fromDate,
  ) {
    final input = _inputFromRow(eventRow);
    final next = _engine.getNextOccurrence(input, fromDate);
    final future = _engine.getFutureOccurrences(input, fromDate, 5);
    final category = eventRow['category']! as String;
    final reminderRule = reminderRow == null
        ? const AnniversaryReminderRule.disabled()
        : _reminderFromRow(reminderRow);
    return AnniversaryPreview(
      id: input.id,
      title: input.title,
      category: _categoryLabel(category),
      sourceDisplay: next.sourceDisplay,
      nextOccurrence: next,
      futureOccurrences: future,
      primaryLabel: '天后',
      reminderRule: reminderRule,
      note: (eventRow['note'] as String?) ?? '',
    );
  }

  AnniversaryEventDraft _draftFromRow(
    Map<String, Object?> eventRow,
    List<Map<String, Object?>> reminderRows,
  ) {
    final calendarType =
        CalendarType.parse(eventRow['calendar_type']! as String);
    final datePayload = _datePayloadFromRow(calendarType, eventRow);
    final repeatRule = RepeatRule(
      type: RepeatType.parse(eventRow['repeat_type']! as String),
      leapDayPolicy:
          LeapDayPolicy.parse(eventRow['leap_day_policy']! as String),
      missingLunarDayPolicy: MissingLunarDayPolicy.parse(
        eventRow['missing_lunar_day_policy']! as String,
      ),
      leapMonthPolicy:
          LeapMonthPolicy.parse(eventRow['leap_month_policy']! as String),
    );
    final reminderRule = reminderRows.isEmpty
        ? const AnniversaryReminderRule.disabled()
        : _reminderFromRow(reminderRows.first);

    return AnniversaryEventDraft(
      id: eventRow['id']! as String,
      title: eventRow['title']! as String,
      calendarType: calendarType,
      datePayload: datePayload,
      repeatRule: repeatRule,
      category: (eventRow['category'] as String?) ?? 'OTHER',
      note: (eventRow['note'] as String?) ?? '',
      reminderRule: reminderRule,
    );
  }

  AnniversaryEventInput _inputFromRow(Map<String, Object?> row) {
    final calendarType = CalendarType.parse(row['calendar_type']! as String);
    final datePayload = _datePayloadFromRow(calendarType, row);
    return AnniversaryEventInput(
      id: row['id']! as String,
      title: row['title']! as String,
      calendarType: calendarType,
      datePayload: datePayload,
      repeatRule: RepeatRule(
        type: RepeatType.parse(row['repeat_type']! as String),
        leapDayPolicy:
            LeapDayPolicy.parse(row['leap_day_policy']! as String),
        missingLunarDayPolicy: MissingLunarDayPolicy.parse(
          row['missing_lunar_day_policy']! as String,
        ),
        leapMonthPolicy:
            LeapMonthPolicy.parse(row['leap_month_policy']! as String),
      ),
    );
  }

  DatePayload _datePayloadFromRow(
    CalendarType calendarType,
    Map<String, Object?> row,
  ) {
    return switch (calendarType) {
      CalendarType.gregorian => GregorianDatePayload(
          year: row['gregorian_year']! as int,
          month: row['gregorian_month']! as int,
          day: row['gregorian_day']! as int,
          timezone: (row['gregorian_timezone'] as String?) ?? 'Asia/Shanghai',
        ),
      CalendarType.chineseLunar => LunarDatePayload(
          lunarYear: row['lunar_year'] as int?,
          lunarMonth: row['lunar_month']! as int,
          lunarDay: row['lunar_day']! as int,
          isLeapMonth: (row['is_leap_month'] as int? ?? 0) == 1,
          timezoneBasis: (row['lunar_timezone'] as String?) ?? 'Asia/Shanghai',
        ),
    };
  }

  AnniversaryReminderRule _reminderFromRow(Map<String, Object?> row) {
    final advanceDaysRaw = row['advance_days_json'] as String? ?? '[]';
    final advanceDays = (jsonDecode(advanceDaysRaw) as List)
        .map((e) => e as int)
        .toList();
    return AnniversaryReminderRule(
      enabled: (row['enabled'] as int? ?? 0) == 1,
      time: (row['reminder_time'] as String?) ?? '09:00',
      advanceDays: advanceDays,
      timezoneMode: (row['timezone_mode'] as String?) ?? 'DEVICE',
      fixedTimezone: row['fixed_timezone'] as String?,
    );
  }

  // ---------------------------------------------------------------------------
  // Helpers — batch queries
  // ---------------------------------------------------------------------------

  Future<Map<String, Map<String, Object?>>> _batchQueryReminders(
    List<String> eventIds,
  ) async {
    if (eventIds.isEmpty) {
      return const {};
    }
    final placeholders = eventIds.map((_) => '?').join(',');
    final rows = await database.query(
      'reminder_rule',
      where: 'event_id IN ($placeholders)',
      whereArgs: eventIds,
    );
    final result = <String, Map<String, Object?>>{};
    for (final row in rows) {
      result[row['event_id']! as String] = row;
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------

  String _newEventId() {
    return 'event_${DateTime.now().microsecondsSinceEpoch}_${_localIdCounter++}';
  }
}

String _categoryLabel(String value) {
  return switch (value) {
    'BIRTHDAY' => '生日',
    'FAMILY' => '家人',
    'LOVE' => '恋爱',
    'ANNIVERSARY' => '纪念日',
    'LIFE' => '生活',
    _ => '其他',
  };
}
