import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/services.dart';

import '../data/app_paths.dart';
import '../domain/anniversary_preview.dart';
import '../domain/anniversary_repository.dart';

typedef ReminderClock = DateTime Function();

class ScheduledReminder {
  const ScheduledReminder({
    required this.id,
    required this.eventId,
    required this.title,
    required this.scheduledAt,
    required this.occurrenceDate,
    required this.advanceDays,
  });

  final String id;
  final String eventId;
  final String title;
  final DateTime scheduledAt;
  final DateTime occurrenceDate;
  final int advanceDays;

  String get notificationTitle => advanceDays == 0 ? '今天的纪念日' : '纪念日提醒';

  String get notificationBody {
    final target = formatDate(occurrenceDate);
    if (advanceDays == 0) {
      return '今天是$title，日期 $target。';
    }
    return '$title 还有 $advanceDays 天，日期 $target。';
  }
}

abstract class ReminderNotificationSender {
  Future<void> showReminder(ScheduledReminder reminder);
}

class WindowsTrayReminderNotificationSender
    implements ReminderNotificationSender {
  const WindowsTrayReminderNotificationSender(this.channel);

  final MethodChannel channel;

  @override
  Future<void> showReminder(ScheduledReminder reminder) async {
    final shown = await channel.invokeMethod<bool>(
      'showReminderNotification',
      {
        'id': reminder.id,
        'title': reminder.notificationTitle,
        'body': reminder.notificationBody,
      },
    );
    if (shown == false) {
      throw StateError('Windows notification was not shown.');
    }
  }
}

class WindowsReminderDeliveryStore {
  WindowsReminderDeliveryStore({
    File? file,
    this.maxEntries = 500,
  }) : file = file ?? AppPaths.defaultWindowsReminderDeliveryFile();

  final File file;
  final int maxEntries;
  Set<String>? _sentIds;

  bool hasSent(String id) => _loadSentIds().contains(id);

  void markSent(String id) {
    final sent = _loadSentIds();
    sent.add(id);
    final trimmed = sent.length <= maxEntries
        ? sent.toList()
        : sent.toList().sublist(sent.length - maxEntries);
    file.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    file.writeAsStringSync(
      '${encoder.convert({'sentReminderIds': trimmed})}\n',
    );
    _sentIds = trimmed.toSet();
  }

  Set<String> _loadSentIds() {
    if (_sentIds != null) {
      return _sentIds!;
    }
    if (!file.existsSync()) {
      _sentIds = <String>{};
      return _sentIds!;
    }
    try {
      final decoded = json.decode(file.readAsStringSync());
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

class WindowsReminderScheduler {
  WindowsReminderScheduler({
    required this.repository,
    required this.sender,
    WindowsReminderDeliveryStore? deliveryStore,
    ReminderClock? clock,
    this.catchUpWindow = const Duration(hours: 2),
    this.maxTimerDelay = const Duration(hours: 12),
  })  : deliveryStore = deliveryStore ?? WindowsReminderDeliveryStore(),
        clock = clock ?? DateTime.now;

  final AnniversaryRepository repository;
  final ReminderNotificationSender sender;
  final WindowsReminderDeliveryStore deliveryStore;
  final ReminderClock clock;
  final Duration catchUpWindow;
  final Duration maxTimerDelay;

  Timer? _timer;
  List<ScheduledReminder> _pendingReminders = const [];

  List<ScheduledReminder> get pendingReminders => _pendingReminders;

  Future<void> start() => reschedule();

  Future<void> reschedule() async {
    _timer?.cancel();
    final now = clock();
    final today = DateTime.utc(now.year, now.month, now.day);
    _pendingReminders = buildWindowsReminderSchedule(
      previews: await repository.listPreviewsFrom(today),
      now: now,
      catchUpWindow: catchUpWindow,
    );
    await _deliverDueReminders();
    _scheduleNextCheck();
  }

  void dispose() {
    _timer?.cancel();
  }

  Future<void> _deliverDueReminders() async {
    final now = clock();
    for (final reminder in _pendingReminders) {
      if (reminder.scheduledAt.isAfter(now)) {
        continue;
      }
      if (deliveryStore.hasSent(reminder.id)) {
        continue;
      }
      await sender.showReminder(reminder);
      deliveryStore.markSent(reminder.id);
    }
  }

  void _scheduleNextCheck() {
    final now = clock();
    final future = _pendingReminders
        .where((reminder) =>
            reminder.scheduledAt.isAfter(now) &&
            !deliveryStore.hasSent(reminder.id))
        .toList()
      ..sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
    if (future.isEmpty) {
      return;
    }
    final next = future.first.scheduledAt.difference(now);
    final delay = next > maxTimerDelay ? maxTimerDelay : next;
    _timer = Timer(delay, () {
      unawaited(reschedule());
    });
  }
}

List<ScheduledReminder> buildWindowsReminderSchedule({
  required List<AnniversaryPreview> previews,
  required DateTime now,
  Duration catchUpWindow = const Duration(hours: 2),
}) {
  final earliest = now.subtract(catchUpWindow);
  final reminders = <ScheduledReminder>[];
  for (final preview in previews) {
    final rule = preview.reminderRule;
    if (!rule.enabled) {
      continue;
    }
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
        if (advanceDays < 0) {
          continue;
        }
        final scheduledAt = DateTime(
          occurrenceDate.year,
          occurrenceDate.month,
          occurrenceDate.day,
          time.hour,
          time.minute,
        ).subtract(Duration(days: advanceDays));
        if (scheduledAt.isBefore(earliest)) {
          continue;
        }
        reminders.add(
          ScheduledReminder(
            id: '${preview.id}|${formatDate(occurrenceDate)}|$advanceDays|${rule.time}',
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
  reminders
      .sort((left, right) => left.scheduledAt.compareTo(right.scheduledAt));
  return reminders;
}

_ReminderTime _parseReminderTime(String value) {
  final parts = value.split(':');
  if (parts.length != 2) {
    return const _ReminderTime(9, 0);
  }
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
