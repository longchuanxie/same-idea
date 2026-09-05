import 'dart:convert';
import 'dart:io';

import 'package:anniversary_app/src/data/backup_importer.dart';
import 'package:anniversary_app/src/data/windows_anniversary_repository.dart';
import 'package:anniversary_app/src/domain/anniversary_repository.dart';
import 'package:anniversary_app/src/domain/anniversary_reminder.dart';
import 'package:calendar_core/calendar_core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('uses the current local date when today is not injected', () {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));

    final now = DateTime.now();
    final expectedToday = DateTime.utc(now.year, now.month, now.day);
    final repository = WindowsAnniversaryRepository(
      cacheFile: File('${cacheDir.path}${Platform.pathSeparator}cache.json'),
    );

    expect(repository.today, expectedToday);
    expect(repository.today, isNot(DateTime.utc(2026, 9, 6)));
  });

  test('imports Android backup and recalculates Windows previews', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));

    final repository = WindowsAnniversaryRepository(
      cacheFile: File('${cacheDir.path}${Platform.pathSeparator}cache.json'),
      today: DateTime.utc(2026, 6, 19),
    );

    final report = repository.importBackupFile(
      File('../shared/backup/examples/anniversary-backup-v1.example.json'),
    );
    final previews = await repository.listHomePreviews();

    expect(report.total, 2);
    expect(report.imported, 2);
    expect(report.skipped, 0);
    expect(report.failed, 0);
    expect(previews.map((preview) => preview.title), contains('妈妈生日'));
    expect(previews.map((preview) => preview.title), contains('在一起'));
    expect(
      previews.firstWhere((preview) => preview.title == '妈妈生日').targetDateText,
      '2026-09-13',
    );
    expect(
      previews
          .firstWhere((preview) => preview.title == '妈妈生日')
          .reminderRule
          .displayText,
      '提前 7 天，当天 09:00',
    );
  });

  test('loads cached backup on next repository instance', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final cacheFile =
        File('${cacheDir.path}${Platform.pathSeparator}cache.json');

    WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    ).importBackupFile(
      File('../shared/backup/examples/anniversary-backup-v1.example.json'),
    );

    final restarted = WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    );

    expect(await restarted.listHomePreviews(), hasLength(2));
  });

  test('saves local Windows event and reloads it from disk', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final cacheFile =
        File('${cacheDir.path}${Platform.pathSeparator}cache.json');

    final repository = WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    );
    await repository.saveEvent(
      const AnniversaryEventDraft(
        title: '真正保存的日子',
        calendarType: CalendarType.gregorian,
        datePayload: GregorianDatePayload(
          year: 2026,
          month: 10,
          day: 1,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: RepeatRule(type: RepeatType.yearly),
        category: 'LIFE',
        note: 'Persisted note',
        reminderRule: AnniversaryReminderRule(
          enabled: true,
          time: '09:00',
          advanceDays: [3],
          timezoneMode: 'DEVICE',
        ),
      ),
    );

    final restarted = WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    );

    expect(
      (await restarted.listHomePreviews()).map((event) => event.title),
      contains('真正保存的日子'),
    );
    expect(
      (await restarted.listHomePreviews())
          .firstWhere((event) => event.title == '真正保存的日子')
          .reminderRule
          .displayText,
      '提前 3 天 09:00',
    );
    final savedDraft = await restarted.getEventDraft(
      (await restarted.listHomePreviews())
          .firstWhere((event) => event.title == '真正保存的日子')
          .id,
    );
    expect(savedDraft?.category, 'LIFE');
    expect(savedDraft?.note, 'Persisted note');
    expect(
      (await restarted.listHomePreviews())
          .firstWhere((event) => event.title == '真正保存的日子')
          .category,
      '生活',
    );
  });

  test('updates and deletes existing Windows event by id', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final cacheFile =
        File('${cacheDir.path}${Platform.pathSeparator}cache.json');
    final repository = WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    );

    await repository.saveEvent(
      const AnniversaryEventDraft(
        title: 'Custom Event',
        calendarType: CalendarType.gregorian,
        datePayload: GregorianDatePayload(
          year: 2026,
          month: 10,
          day: 1,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: RepeatRule(type: RepeatType.yearly),
      ),
    );
    final id = (await repository.listHomePreviews())
        .firstWhere((event) => event.title == 'Custom Event')
        .id;
    final draft = await repository.getEventDraft(id);

    expect(draft?.title, 'Custom Event');

    await repository.saveEvent(
      AnniversaryEventDraft(
        id: id,
        title: 'Renamed Event',
        calendarType: CalendarType.gregorian,
        datePayload: const GregorianDatePayload(
          year: 2026,
          month: 11,
          day: 2,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: const RepeatRule(type: RepeatType.yearly),
        category: 'LOVE',
        note: 'Updated note',
        reminderRule: const AnniversaryReminderRule(
          enabled: true,
          time: '18:30',
          advanceDays: [14, 2, 0],
          timezoneMode: 'DEVICE',
        ),
      ),
    );

    final updated = await repository.listHomePreviews();
    expect(updated.where((event) => event.id == id), hasLength(1));
    expect(updated.map((event) => event.title), contains('Renamed Event'));
    expect((await repository.getEventDraft(id))?.reminderRule.time, '18:30');
    expect((await repository.getEventDraft(id))?.reminderRule.advanceDays, [14, 2, 0]);
    expect((await repository.getEventDraft(id))?.category, 'LOVE');
    expect((await repository.getEventDraft(id))?.note, 'Updated note');
    expect(updated.firstWhere((event) => event.id == id).category, '恋爱');

    await repository.deleteEvent(id);

    expect((await repository.listHomePreviews()).map((event) => event.id),
        isNot(contains(id)));
  });

  test('rejects duplicate Windows event titles', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final cacheFile =
        File('${cacheDir.path}${Platform.pathSeparator}cache.json');
    final repository = WindowsAnniversaryRepository(
      cacheFile: cacheFile,
      today: DateTime.utc(2026, 6, 19),
    );

    await repository.saveEvent(
      const AnniversaryEventDraft(
        title: 'Unique Event',
        calendarType: CalendarType.gregorian,
        datePayload: GregorianDatePayload(
          year: 2026,
          month: 10,
          day: 1,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: RepeatRule(type: RepeatType.yearly),
      ),
    );
    final savedId = (await repository.listHomePreviews())
        .firstWhere((event) => event.title == 'Unique Event')
        .id;

    expect(
      () => repository.saveEvent(
        const AnniversaryEventDraft(
          title: ' unique event ',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2026,
            month: 11,
            day: 2,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      ),
      throwsA(isA<DuplicateAnniversaryTitleException>()),
    );
    expect(await repository.listHomePreviews(), hasLength(1));

    await repository.saveEvent(
      AnniversaryEventDraft(
        id: savedId,
        title: ' unique event ',
        calendarType: CalendarType.gregorian,
        datePayload: const GregorianDatePayload(
          year: 2026,
          month: 11,
          day: 2,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: const RepeatRule(type: RepeatType.yearly),
      ),
    );

    expect(await repository.listHomePreviews(), hasLength(1));
    expect((await repository.getEventDraft(savedId))?.title, 'unique event');
  });

  test('rejects unsupported backup schema with readable error', () {
    final importer = BackupImporter(
      expectedCalendarRuleVersion: 'lunar-rules-1.0.0',
    );
    final jsonObject = json.decode(
      File('../shared/backup/examples/anniversary-backup-v1.example.json')
          .readAsStringSync(),
    ) as Map<String, Object?>;

    expect(
      () => importer.importJson({...jsonObject, 'schemaVersion': '2.0.0'}),
      throwsA(
        isA<BackupImportException>().having(
          (error) => error.message,
          'message',
          contains('不支持的备份版本'),
        ),
      ),
    );
  });

  test('reports bad event payload without dropping valid events', () {
    final importer = BackupImporter(
      expectedCalendarRuleVersion: 'lunar-rules-1.0.0',
    );
    final jsonObject = json.decode(
      File('../shared/backup/examples/anniversary-backup-v1.example.json')
          .readAsStringSync(),
    ) as Map<String, Object?>;
    final events = (jsonObject['events']! as List<Object?>)
        .cast<Map<String, Object?>>()
        .map((event) => Map<String, Object?>.from(event))
        .toList();
    events[0]['datePayload'] = {'lunarMonth': 8};

    final result = importer.importJson({...jsonObject, 'events': events});

    expect(result.report.imported, 1);
    expect(result.report.failed, 1);
    expect(result.report.messages.single, contains('导入失败'));
  });
}
