import 'dart:io';

import 'package:anniversary_app/src/data/seed_anniversary_repository.dart';
import 'package:anniversary_app/src/reminders/windows_reminder_scheduler.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('builds reminder schedule from occurrence and advance days', () async {
    final repository = SeedAnniversaryRepository(
      today: DateTime.utc(2026, 6, 19),
    );
    final previews = await repository.listPreviewsFrom(DateTime.utc(2026, 9, 6));

    final reminders = buildWindowsReminderSchedule(
      previews: previews,
      now: DateTime(2026, 9, 6, 8),
      catchUpWindow: const Duration(minutes: 5),
    );

    expect(reminders, isNotEmpty);
    expect(reminders.first.advanceDays, 7);
    expect(reminders.first.scheduledAt, DateTime(2026, 9, 6, 9));
    expect(reminders.first.occurrenceDate, DateTime.utc(2026, 9, 13));
    expect(reminders.first.notificationBody, contains('2026-09-13'));
  });

  test('delivers due reminder once and records it', () async {
    final cacheDir = Directory.systemTemp.createTempSync('days_reminders_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final sender = _RecordingReminderSender();
    final deliveryStore = WindowsReminderDeliveryStore(
      file: File('${cacheDir.path}${Platform.pathSeparator}delivery.json'),
    );
    final scheduler = WindowsReminderScheduler(
      repository: SeedAnniversaryRepository(today: DateTime.utc(2026, 9, 6)),
      sender: sender,
      deliveryStore: deliveryStore,
      clock: () => DateTime(2026, 9, 6, 9),
      catchUpWindow: const Duration(minutes: 5),
      maxTimerDelay: const Duration(milliseconds: 10),
    );
    addTearDown(scheduler.dispose);

    await scheduler.reschedule();
    await scheduler.reschedule();

    expect(sender.sentReminders, hasLength(1));
    expect(deliveryStore.hasSent(sender.sentReminders.single.id), isTrue);
  });
}

class _RecordingReminderSender implements ReminderNotificationSender {
  final sentReminders = <ScheduledReminder>[];

  @override
  Future<void> showReminder(ScheduledReminder reminder) async {
    sentReminders.add(reminder);
  }
}
