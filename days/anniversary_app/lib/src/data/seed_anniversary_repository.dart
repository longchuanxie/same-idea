import 'package:calendar_core/calendar_core.dart';

import '../domain/anniversary_preview.dart';
import '../domain/anniversary_repository.dart';
import '../domain/anniversary_reminder.dart';
import 'app_clock.dart';
import 'app_paths.dart';

class SeedAnniversaryRepository implements AnniversaryRepository {
  SeedAnniversaryRepository({
    DateTime? today,
    RuntimeRulesCalendarEngine? engine,
  })  : today = today ?? currentLocalUtcDate(),
        _engine = engine ??
            RuntimeRulesCalendarEngine.load(
              AppPaths.calendarRuntimeRulesFile().path,
            );

  @override
  final DateTime today;
  final RuntimeRulesCalendarEngine _engine;
  final List<_SeedEvent> _savedEvents = [];
  final Set<String> _deletedEventIds = {};
  var _localIdCounter = 0;

  @override
  RuntimeRulesCalendarEngine get calendarEngine => _engine;

  @override
  Future<List<AnniversaryPreview>> listHomePreviews() async {
    return listPreviewsFrom(today);
  }

  @override
  Future<List<AnniversaryPreview>> listPreviewsFrom(DateTime fromDate) async {
    final previews =
        _events().map((event) => _previewFromEvent(event, fromDate)).toList();
    final sorted = [...previews]..sort((left, right) =>
        left.daysUntil(fromDate).compareTo(right.daysUntil(fromDate)));
    return sorted;
  }

  @override
  Future<AnniversaryPreview> primaryPreview() async =>
      (await listHomePreviews()).first;

  @override
  Future<void> saveEvent(AnniversaryEventDraft draft) async {
    final id = draft.id ?? _newLocalId();
    _ensureUniqueTitle(
      title: draft.title,
      editingId: id,
    );
    _savedEvents.removeWhere((event) => event.input.id == id);
    _deletedEventIds.remove(id);
    _savedEvents.add(
      _SeedEvent(
        category: _categoryLabel(draft.category),
        categoryCode: draft.category,
        primaryLabel: '天后',
        note: draft.note,
        input: AnniversaryEventInput(
          id: id,
          title: draft.title.trim().isEmpty ? '新的纪念日' : draft.title.trim(),
          calendarType: draft.calendarType,
          datePayload: draft.datePayload,
          repeatRule: draft.repeatRule,
        ),
        reminderRule: draft.reminderRule,
      ),
    );
  }

  @override
  Future<AnniversaryEventDraft?> getEventDraft(String id) async {
    for (final event in _events()) {
      if (event.input.id == id) {
        return AnniversaryEventDraft(
          id: event.input.id,
          title: event.input.title,
          calendarType: event.input.calendarType,
          datePayload: event.input.datePayload,
          repeatRule: event.input.repeatRule,
          category: event.categoryCode,
          note: event.note,
          reminderRule: event.reminderRule,
        );
      }
    }
    return null;
  }

  @override
  Future<void> deleteEvent(String id) async {
    _savedEvents.removeWhere((event) => event.input.id == id);
    _deletedEventIds.add(id);
  }

  void _ensureUniqueTitle({
    required String title,
    required String editingId,
  }) {
    final titleKey = anniversaryTitleKey(
      title.trim().isEmpty ? '新的纪念日' : title,
    );
    final isDuplicate = _events().any(
      (event) =>
          event.input.id != editingId &&
          anniversaryTitleKey(event.input.title) == titleKey,
    );
    if (isDuplicate) {
      throw DuplicateAnniversaryTitleException(title);
    }
  }

  String _newLocalId() {
    return 'draft-${DateTime.now().microsecondsSinceEpoch}-${_localIdCounter++}';
  }

  AnniversaryPreview _previewFromEvent(_SeedEvent event, DateTime fromDate) {
    final next = _engine.getNextOccurrence(event.input, fromDate);
    final future = _engine.getFutureOccurrences(event.input, fromDate, 5);
    return AnniversaryPreview(
      id: event.input.id,
      title: event.input.title,
      category: event.category,
      sourceDisplay: next.sourceDisplay,
      nextOccurrence: next,
      futureOccurrences: future,
      primaryLabel: event.primaryLabel,
      reminderRule: event.reminderRule,
      note: event.note,
    );
  }

  List<_SeedEvent> _events() {
    return [
      ..._savedEvents,
      const _SeedEvent(
        category: '家人 · 生日',
        categoryCode: 'FAMILY',
        primaryLabel: '天后提醒',
        note: '记得提前准备祝福。',
        reminderRule: AnniversaryReminderRule(
          enabled: true,
          time: '09:00',
          advanceDays: [7, 0],
          timezoneMode: 'DEVICE',
        ),
        input: AnniversaryEventInput(
          id: 'mom-birthday',
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
        ),
      ),
      const _SeedEvent(
        category: '纪念日',
        categoryCode: 'ANNIVERSARY',
        primaryLabel: '天后',
        note: '',
        reminderRule: AnniversaryReminderRule.disabled(),
        input: AnniversaryEventInput(
          id: 'wedding-anniversary',
          title: '结婚纪念日',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2021,
            month: 10,
            day: 6,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      ),
      const _SeedEvent(
        category: '生活',
        categoryCode: 'LIFE',
        primaryLabel: '天后',
        note: '',
        reminderRule: AnniversaryReminderRule.disabled(),
        input: AnniversaryEventInput(
          id: 'baby-birthday',
          title: '宝宝生日',
          calendarType: CalendarType.gregorian,
          datePayload: GregorianDatePayload(
            year: 2024,
            month: 12,
            day: 18,
            timezone: 'Asia/Shanghai',
          ),
          repeatRule: RepeatRule(type: RepeatType.yearly),
        ),
      ),
    ].where((event) => !_deletedEventIds.contains(event.input.id)).toList();
  }
}

class _SeedEvent {
  const _SeedEvent({
    required this.input,
    required this.category,
    required this.categoryCode,
    required this.primaryLabel,
    required this.note,
    this.reminderRule = const AnniversaryReminderRule.disabled(),
  });

  final AnniversaryEventInput input;
  final String category;
  final String categoryCode;
  final String primaryLabel;
  final String note;
  final AnniversaryReminderRule reminderRule;
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
