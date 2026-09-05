import 'dart:io';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:sqflite/sqflite.dart';

import 'src/app/anniversary_app.dart';
import 'src/data/_database_desktop.dart';
import 'src/data/_database_mobile.dart';
import 'src/data/backup_importer.dart';
import 'src/data/sqlite_anniversary_repository.dart';
import 'src/data/windows_anniversary_repository.dart';
import 'src/domain/anniversary_repository.dart';

const _calendarRulesAssetPath =
    'assets/calendar/calendar-runtime-rules-v1.json';

Future<void> main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  final engine = await _loadBundledCalendarEngine();
  final database = await _initDatabase();
  final repository = _createRepository(engine, database);
  final notificationsPlugin = await _initNotifications();
  final importPath = _importPathFromArgs(args);
  if (importPath != null && repository is WindowsAnniversaryRepository) {
    try {
      repository.importBackupFile(File(importPath));
    } on BackupImportException catch (error) {
      stderr.writeln('Backup import failed: ${error.message}');
    }
  }
  runApp(
    AnniversaryApp(
      repository: repository,
      notificationsPlugin: notificationsPlugin,
    ),
  );
}

/// Opens the platform-appropriate SQLite database.
///
/// On Android the `sqflite` plugin uses the device's native SQLite.
/// On Windows `sqflite_common_ffi` provides a bundled SQLite via FFI.
Future<Database> _initDatabase() async {
  if (Platform.isWindows) {
    return openDesktopDatabase();
  }
  return openMobileDatabase();
}

AnniversaryRepository _createRepository(
  RuntimeRulesCalendarEngine engine,
  Database database,
) {
  if (Platform.isWindows) {
    return WindowsAnniversaryRepository(engine: engine);
  }
  return SQLiteAnniversaryRepository(
    database: database,
    engine: engine,
  );
}

Future<RuntimeRulesCalendarEngine> _loadBundledCalendarEngine() async {
  final source = await rootBundle.loadString(_calendarRulesAssetPath);
  return RuntimeRulesCalendarEngine.fromJsonString(source);
}

/// Initialises local notifications on Android (creates the notification
/// channel required by Android 8.0+). Returns `null` on non-Android
/// platforms where this plugin is not used.
Future<FlutterLocalNotificationsPlugin?> _initNotifications() async {
  if (!Platform.isAndroid) return null;
  final plugin = FlutterLocalNotificationsPlugin();
  const androidInit = AndroidInitializationSettings('app_icon');
  const settings = InitializationSettings(android: androidInit);
  await plugin.initialize(settings);
  final androidImpl = plugin.resolvePlatformSpecificImplementation<
      AndroidFlutterLocalNotificationsPlugin>();
  await androidImpl?.createNotificationChannel(
    const AndroidNotificationChannel(
      'anniversary_reminders',
      '纪念日提醒',
      description: '纪念日事件提醒通知',
      importance: Importance.high,
    ),
  );
  return plugin;
}

String? _importPathFromArgs(List<String> args) {
  for (final arg in args) {
    if (arg.startsWith('--import=')) {
      return arg.substring('--import='.length);
    }
  }
  return null;
}
