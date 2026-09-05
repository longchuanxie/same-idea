import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';

import '../domain/anniversary_preview.dart';
import '../domain/anniversary_repository.dart';
import 'app_clock.dart';
import 'app_paths.dart';
import 'backup_importer.dart';

class WindowsAnniversaryRepository implements AnniversaryRepository {
  WindowsAnniversaryRepository({
    DateTime? today,
    File? cacheFile,
    RuntimeRulesCalendarEngine? engine,
  })  : today = today ?? currentLocalUtcDate(),
        cacheFile = cacheFile ?? AppPaths.defaultWindowsBackupCacheFile(),
        _engine = engine ??
            RuntimeRulesCalendarEngine.load(
              AppPaths.calendarRuntimeRulesFile().path,
            );

  @override
  final DateTime today;

  final File cacheFile;
  final RuntimeRulesCalendarEngine _engine;

  @override
  RuntimeRulesCalendarEngine get calendarEngine => _engine;

  BackupImportReport? lastImportReport;
  List<ImportedBackupEvent>? _cachedEvents;
  var _localIdCounter = 0;

  BackupImportReport importBackupFile(File file) {
    final importer = BackupImporter(
      expectedCalendarRuleVersion: _engine.ruleVersion,
    );
    final result = importer.importFile(file);
    cacheFile.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    cacheFile.writeAsStringSync('${encoder.convert(result.normalizedJson)}\n');
    _cachedEvents = result.events;
    lastImportReport = result.report;
    return result.report;
  }

  void refreshCache() {
    _cachedEvents = null;
    lastImportReport = null;
  }

  @override
  Future<void> saveEvent(AnniversaryEventDraft draft) async {
    final cache = _loadCacheJson();
    final events = (cache['events'] as List<Object?>?) ?? <Object?>[];
    final now = DateTime.now().toUtc().toIso8601String();
    final updated = _eventJsonFromDraft(draft, now);
    final editingId = updated['id']! as String;
    _ensureUniqueTitle(
      events: events,
      title: updated['title']! as String,
      editingId: editingId,
    );
    var replaced = false;
    for (var index = 0; index < events.length; index++) {
      final event = events[index];
      if (event is Map<String, Object?> && event['id'] == editingId) {
        events[index] = updated;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      events.add(updated);
    }
    cache['events'] = events;
    cache['exportedAt'] = now;

    cacheFile.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    cacheFile.writeAsStringSync('${encoder.convert(cache)}\n');
    refreshCache();
  }

  @override
  Future<List<AnniversaryPreview>> listHomePreviews() async {
    return listPreviewsFrom(today);
  }

  @override
  Future<List<AnniversaryPreview>> listPreviewsFrom(DateTime fromDate) async {
    final imported = _loadImportedEvents();
    final previews = imported
        .map((event) => _previewFromImportedEvent(event, fromDate))
        .toList();
    previews.sort((left, right) {
      if (left.id == right.id) {
        return 0;
      }
      final leftPinned =
          imported.firstWhere((event) => event.input.id == left.id).isPinned;
      final rightPinned =
          imported.firstWhere((event) => event.input.id == right.id).isPinned;
      if (leftPinned != rightPinned) {
        return leftPinned ? -1 : 1;
      }
      return left.daysUntil(fromDate).compareTo(right.daysUntil(fromDate));
    });
    return previews;
  }

  @override
  Future<AnniversaryPreview> primaryPreview() async =>
      (await listHomePreviews()).first;

  @override
  Future<AnniversaryEventDraft?> getEventDraft(String id) async {
    for (final event in _loadImportedEvents()) {
      if (event.input.id == id) {
        return AnniversaryEventDraft(
          id: event.input.id,
          title: event.input.title,
          calendarType: event.input.calendarType,
          datePayload: event.input.datePayload,
          repeatRule: event.input.repeatRule,
          category: event.category,
          note: event.note,
          reminderRule: event.reminderRule,
        );
      }
    }
    return null;
  }

  @override
  Future<void> deleteEvent(String id) async {
    final cache = _loadCacheJson();
    final events = (cache['events'] as List<Object?>?) ?? <Object?>[];
    cache['events'] = [
      for (final event in events)
        if (event is! Map<String, Object?> || event['id'] != id) event,
    ];
    cache['exportedAt'] = DateTime.now().toUtc().toIso8601String();

    cacheFile.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    cacheFile.writeAsStringSync('${encoder.convert(cache)}\n');
    refreshCache();
  }

  List<ImportedBackupEvent> _loadImportedEvents() {
    if (_cachedEvents != null) {
      return _cachedEvents!;
    }
    if (!cacheFile.existsSync()) {
      _cachedEvents = const [];
      return _cachedEvents!;
    }
    final importer = BackupImporter(
      expectedCalendarRuleVersion: _engine.ruleVersion,
    );
    final result = importer.importFile(cacheFile);
    lastImportReport = result.report;
    _cachedEvents = result.events;
    return _cachedEvents!;
  }

  AnniversaryPreview _previewFromImportedEvent(
    ImportedBackupEvent event,
    DateTime fromDate,
  ) {
    final next = _engine.getNextOccurrence(event.input, fromDate);
    final future = _engine.getFutureOccurrences(event.input, fromDate, 5);
    return AnniversaryPreview(
      id: event.input.id,
      title: event.input.title,
      category: event.categoryLabel,
      sourceDisplay: next.sourceDisplay,
      nextOccurrence: next,
      futureOccurrences: future,
      primaryLabel: event.primaryLabel,
      reminderRule: event.reminderRule,
      note: event.note,
    );
  }

  Map<String, Object?> _loadCacheJson() {
    if (cacheFile.existsSync()) {
      final decoded = json.decode(cacheFile.readAsStringSync());
      if (decoded is Map<String, Object?>) {
        return Map<String, Object?>.from(decoded);
      }
    }
    return {
      'schemaVersion': '1.0.0',
      'exportedAt': DateTime.now().toUtc().toIso8601String(),
      'appVersion': '1.0.0',
      'calendarRuleVersion': _engine.ruleVersion,
      'events': <Object?>[],
    };
  }

  Map<String, Object?> _eventJsonFromDraft(
    AnniversaryEventDraft draft,
    String now,
  ) {
    return {
      'id': draft.id ?? _newEventId(),
      'title': draft.title.trim().isEmpty ? '新的纪念日' : draft.title.trim(),
      'category': draft.category,
      'calendarType': draft.calendarType.wireName,
      'datePayload': _datePayloadJson(draft.datePayload),
      'repeatRule': _repeatRuleJson(draft.repeatRule),
      'reminderRule': {
        'enabled': draft.reminderRule.enabled,
        'time': draft.reminderRule.time,
        'advanceDays': draft.reminderRule.advanceDays,
        'timezoneMode': draft.reminderRule.timezoneMode,
        'fixedTimezone': draft.reminderRule.fixedTimezone,
      },
      'displayRule': {
        'mainDisplay': 'COUNTDOWN',
        'showLunar': draft.calendarType == CalendarType.chineseLunar,
        'showGregorian': true,
      },
      'note': draft.note,
      'isPinned': false,
      'isArchived': false,
      'createdAt': now,
      'updatedAt': now,
    };
  }

  void _ensureUniqueTitle({
    required List<Object?> events,
    required String title,
    required String editingId,
  }) {
    final titleKey = anniversaryTitleKey(title);
    final isDuplicate = events.any((event) {
      if (event is! Map<String, Object?>) {
        return false;
      }
      final eventId = event['id'];
      final eventTitle = event['title'];
      if (eventId == editingId || eventTitle is! String) {
        return false;
      }
      return anniversaryTitleKey(eventTitle) == titleKey;
    });
    if (isDuplicate) {
      throw DuplicateAnniversaryTitleException(title);
    }
  }

  String _newEventId() {
    return 'event_${DateTime.now().microsecondsSinceEpoch}_${_localIdCounter++}';
  }

  Map<String, Object?> _datePayloadJson(DatePayload payload) {
    return switch (payload) {
      GregorianDatePayload() => {
          'year': payload.year,
          'month': payload.month,
          'day': payload.day,
          'timezone': payload.timezone,
        },
      LunarDatePayload() => {
          'lunarYear': payload.lunarYear,
          'lunarMonth': payload.lunarMonth,
          'lunarDay': payload.lunarDay,
          'isLeapMonth': payload.isLeapMonth,
          'timezoneBasis': payload.timezoneBasis,
        },
    };
  }

  Map<String, Object?> _repeatRuleJson(RepeatRule repeatRule) {
    return {
      'type': repeatRule.type.wireName,
      'leapDayPolicy': repeatRule.leapDayPolicy.wireName,
      'missingLunarDayPolicy': repeatRule.missingLunarDayPolicy.wireName,
      'leapMonthPolicy': repeatRule.leapMonthPolicy.wireName,
    };
  }
}
