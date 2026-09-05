import 'package:calendar_core/calendar_core.dart';

import 'anniversary_reminder.dart';

class AnniversaryPreview {
  const AnniversaryPreview({
    required this.id,
    required this.title,
    required this.category,
    required this.sourceDisplay,
    required this.nextOccurrence,
    required this.futureOccurrences,
    required this.primaryLabel,
    required this.reminderRule,
    this.note = '',
  });

  final String id;
  final String title;
  final String category;
  final String sourceDisplay;
  final Occurrence nextOccurrence;
  final List<Occurrence> futureOccurrences;
  final String primaryLabel;
  final AnniversaryReminderRule reminderRule;
  final String note;

  int daysUntil(DateTime fromDate) {
    final date = nextOccurrence.occurrenceDate;
    if (date == null) {
      return 0;
    }
    return date
        .difference(DateTime.utc(fromDate.year, fromDate.month, fromDate.day))
        .inDays;
  }

  String get targetDateText {
    final date = nextOccurrence.occurrenceDate;
    if (date == null) {
      return '暂不可计算';
    }
    return formatDate(date);
  }
}
