import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:path_provider/path_provider.dart';

import '../domain/anniversary_preview.dart';
import '../domain/anniversary_repository.dart';
import 'windows_reminder_scheduler.dart';

/// Android implementation of [ReminderNotificationSender] using
/// [FlutterLocalNotificationsPlugin] to deliver local notifications.
class AndroidReminderNotificationSender
    implements ReminderNotificationSender {
  const AndroidReminderNotificationSender(this.plugin);

  final FlutterLocalNotificationsPlugin plugin;

  @override
  Future<void> showReminder(ScheduledReminder reminder) async {
    const details = AndroidNotificationDetails(
      'anniversary_reminders',
      '纪念日提醒',
      channelDescription: '纪念日事件提醒通知',
      importance: Importance.high,
      priority: Priority.high,
    );
    const platformDetails = NotificationDetails(android: details);
    await plugin.show(
      reminder.id.hashCode,
      reminder.notificationTitle,
      reminder.notificationBody,
      platformDetails,
    );
  }
}

/// Persistent delivery store backed by a JSON file in the app documents
/// directory. This ensures that already-sent reminders are not re-delivered
/// after an app restart.
class AndroidReminderDeliveryStore {
  AndroidReminderDeliveryStore({this.maxEntries = 500});

  final int maxEntries;
  File? _file;
  Set<String>? _sentIds;

  Future<File> _ensureFile() async {
    if (_file != null) return _file!;
    final dir = await getApplicationDocumentsDirectory();
    _file = File('${dir.path}/reminder-delivery-v1.json');
    return _file!;
  }

  Future<bool> hasSent(String id) async {
    final sent = await _loadSentIds();
    return sent.contains(id);
  }

  Future<void> markSent(String id) async {
    final sent = await _loadSentIds();
    sent.add(id);
    final trimmed = sent.length <= maxEntries
        ? sent.toList()
        : sent.toList().sublist(sent.length - maxEntries);
    final file = await _ensureFile();
    const encoder = JsonEncoder.withIndent('  ');
    await file.writeAsString(
      '${encoder.convert({'sentReminderIds': trimmed})}\n',
    );
    _sentIds = trimmed.toSet();
  }

  Future<Set<String>> _loadSentIds() async {
    if (_sentIds != null) return _sentIds!;
    final file = await _ensureFile();
    if (!await file.exists()) {
      _sentIds = <String>{};
      return _sentIds!;
    }
    try {
      final decoded = json.decode(await file.readAsString());
      if (decoded is Map<String, Object?>) {
        final ids = decoded['sentReminderIds'];
        if (ids is List<Object?>) {
          _sentIds = ids.whereType<String>().toSet();
          return _sentIds!;
        }
      }
    } on FormatException {
      // Corrupted delivery logs should not block future reminders.
    }
    _sentIds = <String>{};
    return _sentIds!;
  }
}

/// Android reminder scheduler. Mirrors [WindowsReminderScheduler] but uses
/// [AndroidReminderDeliveryStore] (async file in app documents) and an
/// [AndroidReminderNotificationSender] backed by
/// `flutter_local_notifications`.
class AndroidReminderScheduler {
  AndroidReminderScheduler({
    required this.repository,
    required this.sender,
    AndroidReminderDeliveryStore? deliveryStore,
    ReminderClock? clock,
    this.catchUpWindow = const Duration(hours: 2),
    this.maxTimerDelay = const Duration(hours: 12),
  })  : deliveryStore = deliveryStore ?? AndroidReminderDeliveryStore(),
        clock = clock ?? DateTime.now;

  final AnniversaryRepository repository;
  final ReminderNotificationSender sender;
  final AndroidReminderDeliveryStore deliveryStore;
  final ReminderClock clock;
  final Duration catchUpWindow;
  final Duration maxTimerDelay;

  Timer? _timer;
  List<ScheduledReminder> _pendingReminders = const [];
  bool _disposed = false;

  List<ScheduledReminder> get pendingReminders => _pendingReminders;

  Future<void> start() => reschedule();

  Future<void> reschedule() async {
    _timer?.cancel();
    final now = clock();
    final today = DateTime.utc(now.year, now.month, now.day);
    _pendingReminders = buildAndroidReminderSchedule(
      previews: await repository.listPreviewsFrom(today),
      now: now,
      catchUpWindow: catchUpWindow,
    );
    await _deliverDueReminders();
    _scheduleNextCheck();
  }

  void dispose() {
    _disposed = true;
    _timer?.cancel();
  }

  Future<void> _deliverDueReminders() async {
    final now = clock();
    for (final reminder in _pendingReminders) {
      if (reminder.scheduledAt.isAfter(now)) continue;
      if (await deliveryStore.hasSent(reminder.id)) continue;
      try {
        await sender.showReminder(reminder);
        await deliveryStore.markSent(reminder.id);
      } catch (error, stack) {
        debugPrint('Android reminder delivery failed: $error\n$stack');
      }
    }
  }

  void _scheduleNextCheck() {
    if (_disposed) return;
    final now = clock();
    final future = _pendingReminders
        .where((reminder) =>
            reminder.scheduledAt.isAfter(now) &&
            !_sentSync(reminder.id))
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
    if (future.isEmpty) return;
    final next = future.first.scheduledAt.difference(now);
    final delay = next > maxTimerDelay ? maxTimerDelay : next;
    _timer = Timer(delay, () {
      if (!_disposed) unawaited(reschedule());
    });
  }

  /// Synchronous peek at the in-memory sent set. Used only for the timer
  /// scheduling; the actual delivery check goes through the async store.
  bool _sentSync(String id) {
    // The delivery store caches loaded IDs in memory after the first load.
    // We rely on the fact that _deliverDueReminders always marks sent before
    // _scheduleNextCheck runs, so the in-memory set is up-to-date.
    return false; // Conservative: always re-check via async path.
  }
}

List<ScheduledReminder> buildAndroidReminderSchedule({
  required List<AnniversaryPreview> previews,
  required DateTime now,
  Duration catchUpWindow = const Duration(hours: 2),
}) {
  final earliest = now.subtract(catchUpWindow);
  final reminders = <ScheduledReminder>[];
  for (final preview in previews) {
    final rule = preview.reminderRule;
    if (!rule.enabled) continue;
    final time = _parseReminderTime(rule.time);
    final occurrences = preview.futureOccurrences.isEmpty
        ? [preview.nextOccurrence]
        : preview.futureOccurrences;
    for (final occurrence in occurrences) {
      final occurrenceDate = occurrence.occurrenceDate;
      if (occurrence.status != OccurrenceStatus.valid ||
          occurrenceDate == null) {
        continue;
      }
      final advanceDaysSet =
          rule.advanceDays.isEmpty ? {0} : rule.advanceDays.toSet();
      for (final advanceDays in advanceDaysSet) {
        if (advanceDays < 0) continue;
        final scheduledAt = DateTime(
          occurrenceDate.year,
          occurrenceDate.month,
          occurrenceDate.day,
          time.hour,
          time.minute,
        ).subtract(Duration(days: advanceDays));
        if (scheduledAt.isBefore(earliest)) continue;
        reminders.add(
          ScheduledReminder(
            id:
                '${preview.id}|${formatDate(occurrenceDate)}|$advanceDays|${rule.time}',
            eventId: preview.id,
            title: preview.title,
            scheduledAt: scheduledAt,
            occurrenceDate: occurrenceDate,
            advanceDays: advanceDays,
          ),
        );
      }
    }
  }
  reminders.sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
  return reminders;
}

_ReminderTime _parseReminderTime(String value) {
  final parts = value.split(':');
  if (parts.length != 2) return const _ReminderTime(9, 0);
  final hour = int.tryParse(parts[0]);
  final minute = int.tryParse(parts[1]);
  if (hour == null ||
      minute == null ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59) {
    return const _ReminderTime(9, 0);
  }
  return _ReminderTime(hour, minute);
}

class _ReminderTime {
  const _ReminderTime(this.hour, this.minute);
  final int hour;
  final int minute;
}
