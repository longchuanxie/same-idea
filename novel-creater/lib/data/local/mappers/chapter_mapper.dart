import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

final class ChapterMapper {
  const ChapterMapper();

  ChapterRow toRow(Chapter entity) => ChapterRow(
        id: entity.id,
        projectId: entity.projectId,
        title: entity.title,
        markdownContent: entity.markdownContent,
        plainTextCache: entity.plainTextCache,
        wordCount: entity.wordCount,
        status: entity.status.name,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  Chapter fromRow(ChapterRow row) => Chapter(
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        markdownContent: row.markdownContent,
        plainTextCache: row.plainTextCache,
        wordCount: row.wordCount,
        status: ChapterStatus.values.byName(row.status),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
