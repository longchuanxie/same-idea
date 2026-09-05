class AnniversaryReminderRule {
  const AnniversaryReminderRule({
    required this.enabled,
    required this.time,
    required this.advanceDays,
    required this.timezoneMode,
    this.fixedTimezone,
  });

  const AnniversaryReminderRule.disabled()
      : enabled = false,
        time = '09:00',
        advanceDays = const [],
        timezoneMode = 'DEVICE',
        fixedTimezone = null;

  final bool enabled;
  final String time;
  final List<int> advanceDays;
  final String timezoneMode;
  final String? fixedTimezone;

  String get displayText {
    if (!enabled) {
      return '未启用';
    }
    final sortedDays = [...advanceDays]..sort((left, right) => right - left);
    if (sortedDays.isEmpty) {
      return '当天 $time';
    }
    final parts = [
      for (final day in sortedDays)
        if (day == 0) '当天' else '提前 $day 天',
    ];
    return '${parts.join('，')} $time';
  }
}
