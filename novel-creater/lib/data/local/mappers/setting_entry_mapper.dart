import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';

final class SettingEntryMapper {
  const SettingEntryMapper();

  SettingEntryRow toRow(SettingEntry entity) => SettingEntryRow(
        id: entity.id,
        projectId: entity.projectId,
        title: entity.title,
        content: entity.content,
        category: entity.category.name,
        tagsJson: jsonEncode(entity.tags),
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  SettingEntry fromRow(SettingEntryRow row) => SettingEntry(
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        content: row.content,
        category: SettingCategory.values.byName(row.category),
        tags: (jsonDecode(row.tagsJson) as List<dynamic>)
            .map((e) => e.toString())
            .toList(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
