import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';

final class SessionMapper {
  const SessionMapper();

  SessionRow toRow(Session entity) => SessionRow(
        id: entity.id,
        projectId: entity.projectId,
        title: entity.title,
        status: entity.status.name,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
        chapterId: entity.chapterId,
        agentMode: entity.agentMode,
        summary: entity.summary,
        startedAt: entity.startedAt?.millisecondsSinceEpoch,
        endedAt: entity.endedAt?.millisecondsSinceEpoch,
      );

  Session fromRow(SessionRow row) => Session(
        id: row.id,
        projectId: row.projectId,
        title: row.title,
        status: SessionStatus.values.byName(row.status),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
        chapterId: row.chapterId,
        agentMode: row.agentMode,
        summary: row.summary,
        startedAt: row.startedAt != null
            ? DateTime.fromMillisecondsSinceEpoch(row.startedAt!, isUtc: true)
            : null,
        endedAt: row.endedAt != null
            ? DateTime.fromMillisecondsSinceEpoch(row.endedAt!, isUtc: true)
            : null,
      );
}
