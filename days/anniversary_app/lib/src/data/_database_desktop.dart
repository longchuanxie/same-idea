/// Desktop (Windows) database platform — uses `sqflite_common_ffi`.
library;

import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'database.dart' show openAppDatabase;

/// Initialises the FFI-based SQLite factory and opens the database.
Future<Database> openDesktopDatabase({String? testPath}) async {
  sqfliteFfiInit();
  final factory = databaseFactoryFfi;
  final path = testPath ?? _defaultDatabasePath();
  return openAppDatabase(factory: factory, path: path);
}

String _defaultDatabasePath() {
  final appData = Platform.environment['APPDATA'];
  final base = (appData != null && appData.isNotEmpty)
      ? p.join(appData, 'SameIdeaDays')
      : p.join(Directory.current.path, '.same_idea_days');
  Directory(base).createSync(recursive: true);
  return p.join(base, 'jinnian.db');
}
