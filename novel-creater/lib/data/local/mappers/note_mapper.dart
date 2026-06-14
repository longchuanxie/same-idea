import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/enums/note_category.dart';

final class NoteMapper {
  const NoteMapper();

  NoteRow toRow(Note entity) => NoteRow(
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

  Note fromRow(NoteRow row) => Note(
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        content: row.content,
        category: NoteCategory.values.byName(row.category),
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
