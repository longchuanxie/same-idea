import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

QueryExecutor openConnection() => LazyDatabase(() async {
      final dir = await getApplicationDocumentsDirectory();
      final dbPath = p.join(dir.path, 'novel_creator.sqlite');
      return NativeDatabase.createInBackground(File(dbPath));
    });
