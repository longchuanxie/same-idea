import 'dart:convert';
import 'dart:io';

import 'package:calendar_core/calendar_core.dart';

import '../domain/anniversary_reminder.dart';

class BackupImportResult {
  const BackupImportResult({
    required this.events,
    required this.report,
    required this.normalizedJson,
  });

  final List<ImportedBackupEvent> events;
  final BackupImportReport report;
  final Map<String, Object?> normalizedJson;
}

class BackupImportReport {
  const BackupImportReport({
    required this.schemaVersion,
    required this.calendarRuleVersion,
    required this.total,
    required this.imported,
    required this.skipped,
    required this.failed,
    required this.messages,
  });

  final String schemaVersion;
  final String calendarRuleVersion;
  final int total;
  final int imported;
  final int skipped;
  final int failed;
  final List<String> messages;

  bool get isSuccessful => failed == 0;
}

class ImportedBackupEvent {
  const ImportedBackupEvent({
    required this.input,
    required this.category,
    required this.categoryLabel,
    required this.primaryLabel,
    required this.reminderRule,
    required this.isPinned,
    required this.note,
  });

  final AnniversaryEventInput input;
  final String category;
  final String categoryLabel;
  final String primaryLabel;
  final AnniversaryReminderRule reminderRule;
  final bool isPinned;
  final String note;
}

class BackupImportException implements Exception {
  BackupImportException(this.message);

  final String message;

  @override
  String toString() => message;
}

class BackupImporter {
  BackupImporter({
    required this.expectedCalendarRuleVersion,
  });

  static const supportedSchemaVersion = '1.0.0';

  final String expectedCalendarRuleVersion;

  BackupImportResult importFile(File file) {
    if (!file.existsSync()) {
      throw BackupImportException('备份文件不存在：${file.path}');
    }
    try {
      final decoded = json.decode(file.readAsStringSync());
      if (decoded is! Map<String, Object?>) {
        throw BackupImportException('备份文件必须是 JSON 对象。');
      }
      return importJson(decoded);
    } on FormatException catch (error) {
      throw BackupImportException('备份文件不是有效 JSON：${error.message}');
    }
  }

  BackupImportResult importJson(Map<String, Object?> jsonObject) {
    final schemaVersion = _requiredString(jsonObject, 'schemaVersion');
    if (schemaVersion != supportedSchemaVersion) {
      throw BackupImportException(
        '不支持的备份版本：$schemaVersion。当前支持 $supportedSchemaVersion。',
      );
    }

    final calendarRuleVersion =
        _requiredString(jsonObject, 'calendarRuleVersion');
    if (calendarRuleVersion != expectedCalendarRuleVersion) {
      throw BackupImportException(
        '农历规则版本不一致：$calendarRuleVersion。当前需要 $expectedCalendarRuleVersion。',
      );
    }

    _requiredString(jsonObject, 'exportedAt');
    _requiredString(jsonObject, 'appVersion');
    final rawEvents = _requiredList(jsonObject, 'events');
    final events = <ImportedBackupEvent>[];
    final messages = <String>[];
    var skipped = 0;
    var failed = 0;

    for (var index = 0; index < rawEvents.length; index++) {
      final raw = rawEvents[index];
      if (raw is! Map<String, Object?>) {
        failed++;
        messages.add('第 ${index + 1} 条事件不是 JSON 对象，已跳过。');
        continue;
      }
      try {
        if (_requiredBool(raw, 'isArchived')) {
          skipped++;
          messages
              .add('事件「${_requiredString(raw, 'title')}」已归档，未进入 Windows 展示缓存。');
          continue;
        }
        events.add(_parseEvent(raw));
      } on Object catch (error) {
        failed++;
        final title = raw['title'];
        final prefix = title is String && title.isNotEmpty
            ? '事件「$title」'
            : '第 ${index + 1} 条事件';
        messages.add('$prefix 导入失败：$error');
      }
    }

    return BackupImportResult(
      events: events,
      normalizedJson: jsonObject,
      report: BackupImportReport(
        schemaVersion: schemaVersion,
        calendarRuleVersion: calendarRuleVersion,
        total: rawEvents.length,
        imported: events.length,
        skipped: skipped,
        failed: failed,
        messages: List.unmodifiable(messages),
      ),
    );
  }

  ImportedBackupEvent _parseEvent(Map<String, Object?> raw) {
    final calendarType =
        CalendarType.parse(_requiredString(raw, 'calendarType'));
    final payload = _parsePayload(
      calendarType,
      _requiredMap(raw, 'datePayload'),
    );
    final category = _requiredString(raw, 'category');
    return ImportedBackupEvent(
      input: AnniversaryEventInput(
        id: _requiredString(raw, 'id'),
        title: _requiredString(raw, 'title'),
        calendarType: calendarType,
        datePayload: payload,
        repeatRule: _parseRepeatRule(_requiredMap(raw, 'repeatRule')),
      ),
      category: category,
      categoryLabel: _categoryLabel(category),
      primaryLabel: _primaryLabel(_requiredMap(raw, 'displayRule')),
      reminderRule: _parseReminderRule(_requiredMap(raw, 'reminderRule')),
      isPinned: _requiredBool(raw, 'isPinned'),
      note: _requiredString(raw, 'note'),
    );
  }

  DatePayload _parsePayload(
    CalendarType calendarType,
    Map<String, Object?> raw,
  ) {
    return switch (calendarType) {
      CalendarType.gregorian => GregorianDatePayload(
          year: _requiredInt(raw, 'year'),
          month: _requiredInt(raw, 'month'),
          day: _requiredInt(raw, 'day'),
          timezone: _requiredString(raw, 'timezone'),
        ),
      CalendarType.chineseLunar => LunarDatePayload(
          lunarYear: _requiredInt(raw, 'lunarYear'),
          lunarMonth: _requiredInt(raw, 'lunarMonth'),
          lunarDay: _requiredInt(raw, 'lunarDay'),
          isLeapMonth: _requiredBool(raw, 'isLeapMonth'),
          timezoneBasis: _requiredString(raw, 'timezoneBasis'),
        ),
    };
  }

  RepeatRule _parseRepeatRule(Map<String, Object?> raw) {
    return RepeatRule(
      type: RepeatType.parse(_requiredString(raw, 'type')),
      leapDayPolicy: LeapDayPolicy.parse(_requiredString(raw, 'leapDayPolicy')),
      missingLunarDayPolicy: MissingLunarDayPolicy.parse(
        _requiredString(raw, 'missingLunarDayPolicy'),
      ),
      leapMonthPolicy: LeapMonthPolicy.parse(
        _requiredString(raw, 'leapMonthPolicy'),
      ),
    );
  }

  AnniversaryReminderRule _parseReminderRule(Map<String, Object?> raw) {
    return AnniversaryReminderRule(
      enabled: _requiredBool(raw, 'enabled'),
      time: _requiredString(raw, 'time'),
      advanceDays: _requiredList(raw, 'advanceDays').map((value) {
        if (value is int) {
          return value;
        }
        throw BackupImportException('advanceDays 必须是整数数组');
      }).toList(growable: false),
      timezoneMode: _optionalString(raw, 'timezoneMode') ??
          _optionalString(raw, 'timezone') ??
          'DEVICE',
      fixedTimezone: _optionalString(raw, 'fixedTimezone'),
    );
  }

  String _categoryLabel(String value) {
    return switch (value) {
      'BIRTHDAY' => '生日',
      'FAMILY' => '家人',
      'LOVE' => '恋爱',
      'ANNIVERSARY' => '纪念日',
      'LIFE' => '生活',
      'OTHER' => '其他',
      _ => throw BackupImportException('未知分类：$value'),
    };
  }

  String _primaryLabel(Map<String, Object?> displayRule) {
    final mainDisplay = _requiredString(displayRule, 'mainDisplay');
    return switch (mainDisplay) {
      'COUNTDOWN' => '天后',
      'ELAPSED_DAYS' => '天后',
      'ANNIVERSARY_YEAR' => '周年',
      _ => throw BackupImportException('未知展示类型：$mainDisplay'),
    };
  }

  static String _requiredString(Map<String, Object?> raw, String key) {
    final value = raw[key];
    if (value is String) {
      return value;
    }
    throw BackupImportException('缺少或错误的字段 $key');
  }

  static String? _optionalString(Map<String, Object?> raw, String key) {
    final value = raw[key];
    if (value == null) {
      return null;
    }
    if (value is String) {
      return value;
    }
    throw BackupImportException('字段 $key 类型错误');
  }

  static int _requiredInt(Map<String, Object?> raw, String key) {
    final value = raw[key];
    if (value is int) {
      return value;
    }
    throw BackupImportException('缺少或错误的字段 $key');
  }

  static bool _requiredBool(Map<String, Object?> raw, String key) {
    final value = raw[key];
    if (value is bool) {
      return value;
    }
    throw BackupImportException('缺少或错误的字段 $key');
  }

  static List<Object?> _requiredList(Map<String, Object?> raw, String key) {
    final value = raw[key];
    if (value is List<Object?>) {
      return value;
    }
    throw BackupImportException('缺少或错误的字段 $key');
  }

  static Map<String, Object?> _requiredMap(
    Map<String, Object?> raw,
    String key,
  ) {
    final value = raw[key];
    if (value is Map<String, Object?>) {
      return value;
    }
    throw BackupImportException('缺少或错误的字段 $key');
  }
}
