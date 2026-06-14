import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';

final class AgentTaskMapper {
  const AgentTaskMapper();

  AgentTaskRow toRow(AgentTask entity) => AgentTaskRow(
        id: entity.id,
        projectId: entity.projectId,
        taskType: entity.taskType,
        status: entity.status.name,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
        chapterId: entity.chapterId,
        instruction: entity.instruction,
        result: entity.result,
        errorMessage: entity.errorMessage,
      );

  AgentTask fromRow(AgentTaskRow row) => AgentTask(
        id: row.id,
        projectId: row.projectId,
        taskType: row.taskType,
        status: AgentTaskStatus.values.byName(row.status),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
        chapterId: row.chapterId,
        instruction: row.instruction,
        result: row.result,
        errorMessage: row.errorMessage,
      );
}
