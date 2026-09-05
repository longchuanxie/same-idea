import 'dart:io';

class AppPaths {
  const AppPaths._();

  static File calendarRuntimeRulesFile() {
    return findUpward(
      relativePath: 'shared/calendar/calendar-runtime-rules-v1.json',
      from: [
        Directory.current,
        File(Platform.resolvedExecutable).parent,
      ],
    );
  }

  static File findUpward({
    required String relativePath,
    required List<Directory> from,
  }) {
    for (final start in from) {
      Directory? current = start.absolute;
      while (current != null) {
        final candidate =
            File('${current.path}${Platform.pathSeparator}$relativePath');
        if (candidate.existsSync()) {
          return candidate;
        }
        final parent = current.parent;
        if (parent.path == current.path) {
          current = null;
        } else {
          current = parent;
        }
      }
    }
    throw StateError('Required file not found: $relativePath');
  }

  static File defaultWindowsBackupCacheFile() {
    final appData = Platform.environment['APPDATA'];
    final base = appData == null || appData.isEmpty
        ? Directory(
            '${Directory.current.path}${Platform.pathSeparator}.same_idea_days')
        : Directory('$appData${Platform.pathSeparator}SameIdeaDays');
    return File(
        '${base.path}${Platform.pathSeparator}anniversary-backup-v1.cache.json');
  }

  static File defaultWindowsSettingsFile() {
    final appData = Platform.environment['APPDATA'];
    final base = appData == null || appData.isEmpty
        ? Directory(
            '${Directory.current.path}${Platform.pathSeparator}.same_idea_days')
        : Directory('$appData${Platform.pathSeparator}SameIdeaDays');
    return File(
        '${base.path}${Platform.pathSeparator}windows-settings-v1.json');
  }

  static File defaultWindowsReminderDeliveryFile() {
    final appData = Platform.environment['APPDATA'];
    final base = appData == null || appData.isEmpty
        ? Directory(
            '${Directory.current.path}${Platform.pathSeparator}.same_idea_days')
        : Directory('$appData${Platform.pathSeparator}SameIdeaDays');
    return File(
      '${base.path}${Platform.pathSeparator}windows-reminder-delivery-v1.json',
    );
  }
}
