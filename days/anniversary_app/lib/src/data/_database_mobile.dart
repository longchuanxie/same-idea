/// Mobile (Android / iOS) database platform — uses the standard `sqflite`
/// plugin which delegates to the device's native SQLite.
library;

import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import 'database.dart' show openAppDatabase;

/// Opens the SQLite database using the `sqflite` plugin on mobile.
Future<Database> openMobileDatabase({String? testPath}) async {
  final databasesPath = await getDatabasesPath();
  final path = testPath ?? p.join(databasesPath, 'jinnian.db');
  return openAppDatabase(factory: databaseFactory, path: path);
}
