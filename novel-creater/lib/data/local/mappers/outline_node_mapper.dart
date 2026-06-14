import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/outline_node.dart';

final class OutlineNodeMapper {
  const OutlineNodeMapper();

  OutlineNodeRow toRow(OutlineNode entity) => OutlineNodeRow(
        id: entity.id,
        projectId: entity.projectId,
        title: entity.title,
        summary: entity.summary,
        chapterId: entity.chapterId,
        parentId: entity.parentId,
        sortOrder: entity.sortOrder,
        tagsJson: jsonEncode(entity.tags),
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  OutlineNode fromRow(OutlineNodeRow row) => OutlineNode(
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        summary: row.summary,
        chapterId: row.chapterId,
        parentId: row.parentId,
        sortOrder: row.sortOrder,
        tags: (jsonDecode(row.tagsJson) as List<dynamic>).cast<String>(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
