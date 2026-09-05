import 'package:anniversary_app/src/data/database.dart' show openAppDatabase;
import 'package:anniversary_app/src/data/sqlite_anniversary_repository.dart';
import 'package:anniversary_app/src/data/app_paths.dart';
import 'package:anniversary_app/src/domain/anniversary_repository.dart';
import 'package:anniversary_app/src/domain/anniversary_reminder.dart';
import 'package:calendar_core/calendar_core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  sqfliteFfiInit();
  final factory = databaseFactoryFfi;

  final fixedToday = DateTime.utc(2026, 6, 19);
  late RuntimeRulesCalendarEngine engine;

  setUpAll(() {
    engine = RuntimeRulesCalendarEngine.load(
      AppPaths.calendarRuntimeRulesFile().path,
    );
  });

  Future<SQLiteAnniversaryRepository> createRepo() async {
    final db = await openAppDatabase(
      factory: factory,
      path: inMemoryDatabasePath,
    );
    return SQLiteAnniversaryRepository(
      database: db,
      today: fixedToday,
      engine: engine,
    );
  }

  group('CRUD', () {
    test('saves and retrieves a gregorian event', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '结婚纪念日',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2021,
            month: 10,
            day: 6,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
          category: 'ANNIVERSARY',
          note: '重要日子',
        ),
      );

      final previews = await repo.listHomePreviews();
      expect(previews, hasLength(1));
      expect(previews.first.title, '结婚纪念日');
      expect(previews.first.category, '纪念日');
      expect(previews.first.note, '重要日子');

      final draft = await repo.getEventDraft(previews.first.id);
      expect(draft, isNotNull);
      expect(draft!.title, '结婚纪念日');
      expect(draft.calendarType, CalendarType.gregorian);
      expect(draft.datePayload, isA<GregorianDatePayload>());
      final payload = draft.datePayload as GregorianDatePayload;
      expect(payload.year, 2021);
      expect(payload.month, 10);
      expect(payload.day, 6);
      expect(draft.category, 'ANNIVERSARY');
      expect(draft.note, '重要日子');
      expect(draft.repeatRule.type, RepeatType.yearly);

      await repo.database.close();
    });

    test('saves and retrieves a lunar event', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '妈妈生日',
          calendarType: CalendarType.chineseLunar,
          datePayload: LunarDatePayload(
            lunarYear: 1968,
            lunarMonth: 8,
            lunarDay: 3,
            isLeapMonth: false,
            timezoneBasis: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
          category: 'FAMILY',
        ),
      );

      final previews = await repo.listHomePreviews();
      expect(previews, hasLength(1));
      expect(previews.first.title, '妈妈生日');

      final draft = await repo.getEventDraft(previews.first.id);
      expect(draft!.calendarType, CalendarType.chineseLunar);
      expect(draft.datePayload, isA<LunarDatePayload>());
      final payload = draft.datePayload as LunarDatePayload;
      expect(payload.lunarYear, 1968);
      expect(payload.lunarMonth, 8);
      expect(payload.lunarDay, 3);
      expect(payload.isLeapMonth, false);

      await repo.database.close();
    });

    test('saves reminder rule with event', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '测试提醒',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2025,
            month: 1,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
          reminderRule: AnniversaryReminderRule(
            enabled: true,
            time: '08:30',
            advanceDays: [7, 3, 0],
            timezoneMode: 'DEVICE',
          ),
        ),
      );

      final previews = await repo.listHomePreviews();
      final rule = previews.first.reminderRule;
      expect(rule.enabled, true);
      expect(rule.time, '08:30');
      expect(rule.advanceDays, containsAll([7, 3, 0]));

      await repo.database.close();
    });

    test('updates an existing event by id', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '原始标题',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2024,
            month: 6,
            day: 15,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );

      final previews = await repo.listHomePreviews();
      final id = previews.first.id;

      await repo.saveEvent(
        AnniversaryEventDraft(
          id: id,
          title: '更新后标题',
          calendarType: CalendarType.gregorian,
          datePayload: const GregorianDatePayload(
            year: 2024,
            month: 7,
            day: 20,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: const RepeatRule(type: RepeatType.yearly),
          note: '更新备注',
        ),
      );

      final updated = await repo.listHomePreviews();
      expect(updated, hasLength(1));
      expect(updated.first.title, '更新后标题');
      expect(updated.first.note, '更新备注');

      final draft = await repo.getEventDraft(id);
      expect(draft!.title, '更新后标题');
      final payload = draft.datePayload as GregorianDatePayload;
      expect(payload.month, 7);
      expect(payload.day, 20);

      await repo.database.close();
    });

    test('deletes an event by id', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '要删除的事件',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2024,
            month: 1,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );

      var previews = await repo.listHomePreviews();
      expect(previews, hasLength(1));
      final id = previews.first.id;

      await repo.deleteEvent(id);

      previews = await repo.listHomePreviews();
      expect(previews, isEmpty);

      final draft = await repo.getEventDraft(id);
      expect(draft, isNull);

      await repo.database.close();
    });

    test('getEventDraft returns null for non-existent id', () async {
      final repo = await createRepo();
      final draft = await repo.getEventDraft('does-not-exist');
      expect(draft, isNull);
      await repo.database.close();
    });
  });

  group('unique title constraint', () {
    test('throws DuplicateAnniversaryTitleException on duplicate', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '唯一名称',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2024,
            month: 1,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );

      await expectLater(
        repo.saveEvent(
          const AnniversaryEventDraft(
            title: '唯一名称',
            calendarType: CalendarType.gregorian,
            datePayload: GregorianDatePayload(
              year: 2025,
              month: 2,
              day: 2,
              timezone: 'Asia/Shanghai',
            ),
            repeatRule: RepeatRule(type: RepeatType.yearly),
          ),
        ),
        throwsA(isA<DuplicateAnniversaryTitleException>()),
      );

      await repo.database.close();
    });

    test('allows same title when editing the same event', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '可编辑名称',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2024,
            month: 1,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );

      final previews = await repo.listHomePreviews();
      final id = previews.first.id;

      // Re-saving with the same title but same id should not throw.
      await repo.saveEvent(
        AnniversaryEventDraft(
          id: id,
          title: '可编辑名称',
          calendarType: CalendarType.gregorian,
          datePayload: const GregorianDatePayload(
            year: 2024,
            month: 1,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: const RepeatRule(type: RepeatType.yearly),
          note: '加了备注',
        ),
      );

      final updated = await repo.getEventDraft(id);
      expect(updated!.note, '加了备注');

      await repo.database.close();
    });
  });

  group('list ordering', () {
    test('previews are sorted by days until next occurrence', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '较远的事件',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2026,
            month: 12,
            day: 25,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '较近的事件',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2026,
            month: 7,
            day: 1,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      );

      final previews = await repo.listHomePreviews();
      expect(previews, hasLength(2));
      expect(previews.first.title, '较近的事件');
      expect(previews.last.title, '较远的事件');

      await repo.database.close();
    });
  });

  group('policy rules', () {
    test('saves and loads policy rules with event', () async {
      final repo = await createRepo();
      await repo.saveEvent(
        const AnniversaryEventDraft(
          title: '闰月测试',
          calendarType: CalendarType.chineseLunar,
          datePayload: LunarDatePayload(
            lunarYear: 2025,
            lunarMonth: 6,
            lunarDay: 15,
            isLeapMonth: true,
            timezoneBasis: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(
            type: RepeatType.yearly,
            leapDayPolicy: LeapDayPolicy.mar01,
            missingLunarDayPolicy: MissingLunarDayPolicy.nextMonthFirstDay,
            leapMonthPolicy: LeapMonthPolicy.onlyLeapMonth,
          ),
        ),
      );

      final previews = await repo.listHomePreviews();
      final draft = await repo.getEventDraft(previews.first.id);
      expect(draft!.repeatRule.leapDayPolicy, LeapDayPolicy.mar01);
      expect(
        draft.repeatRule.missingLunarDayPolicy,
        MissingLunarDayPolicy.nextMonthFirstDay,
      );
      expect(draft.repeatRule.leapMonthPolicy, LeapMonthPolicy.onlyLeapMonth);

      await repo.database.close();
    });
  });

  group('database schema', () {
    test('creates all 5 tables on first open', () async {
      final db = await openAppDatabase(
        factory: factory,
        path: inMemoryDatabasePath,
      );

      final tables = await db.query(
        'sqlite_master',
        where: "type = 'table' AND name NOT LIKE 'sqlite_%'",
        columns: ['name'],
      );
      final tableNames = tables.map((row) => row['name'] as String).toSet();

      expect(tableNames, containsAll([
        'event',
        'reminder_rule',
        'policy_rule',
        'occurrence_cache',
        'widget_snapshot',
      ]));

      await db.close();
    });
  });
}
