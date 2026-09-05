import 'package:calendar_core/calendar_core.dart';

import 'anniversary_preview.dart';
import 'anniversary_reminder.dart';

abstract class AnniversaryRepository {
  DateTime get today;

  RuntimeRulesCalendarEngine get calendarEngine;

  Future<List<AnniversaryPreview>> listHomePreviews();

  Future<List<AnniversaryPreview>> listPreviewsFrom(DateTime fromDate);

  Future<AnniversaryPreview> primaryPreview();

  Future<AnniversaryEventDraft?> getEventDraft(String id);

  Future<void> saveEvent(AnniversaryEventDraft draft);

  Future<void> deleteEvent(String id);
}

class DuplicateAnniversaryTitleException implements Exception {
  const DuplicateAnniversaryTitleException(this.title);

  final String title;

  @override
  String toString() => 'DuplicateAnniversaryTitleException: $title';
}

String anniversaryTitleKey(String title) {
  return title.trim().replaceAll(RegExp(r'\s+'), ' ').toLowerCase();
}

class AnniversaryEventDraft {
  const AnniversaryEventDraft({
    this.id,
    required this.title,
    required this.calendarType,
    required this.datePayload,
    required this.repeatRule,
    this.category = 'OTHER',
    this.note = '',
    this.reminderRule = const AnniversaryReminderRule.disabled(),
  });

  final String? id;
  final String title;
  final CalendarType calendarType;
  final DatePayload datePayload;
  final RepeatRule repeatRule;
  final String category;
  final String note;
  final AnniversaryReminderRule reminderRule;
}
