import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/timeline_event.dart';

final class TimelineEventMapper {
  const TimelineEventMapper();

  TimelineEventRow toRow(TimelineEvent entity) => TimelineEventRow(
        id: entity.id,
        projectId: entity.projectId,
        characterId: entity.characterId,
        chapterId: entity.chapterId,
        description: entity.description,
        chapterOrder: entity.chapterOrder,
        eventType: entity.eventType,
        relatedCharacterIdsJson: jsonEncode(entity.relatedCharacterIds),
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  TimelineEvent fromRow(TimelineEventRow row) => TimelineEvent(
        id: row.id,
        projectId: row.projectId,
        characterId: row.characterId,
        chapterId: row.chapterId,
        description: row.description,
        chapterOrder: row.chapterOrder,
        eventType: row.eventType,
        relatedCharacterIds:
            (jsonDecode(row.relatedCharacterIdsJson) as List<dynamic>)
                .cast<String>(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
