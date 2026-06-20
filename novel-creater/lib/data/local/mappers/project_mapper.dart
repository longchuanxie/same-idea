import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/project.dart';

final class ProjectMapper {
  const ProjectMapper();

  ProjectRow toRow(Project entity) => ProjectRow(
        id: entity.id,
        name: entity.name,
        description: entity.description,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  Project fromRow(ProjectRow row) => Project(
        id: row.id,
        name: row.name,
        description: row.description,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
