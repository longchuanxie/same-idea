import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';

final class SnapshotMapper {
  const SnapshotMapper();

  SnapshotRow toRow(Snapshot entity) => SnapshotRow(
        id: entity.id,
        projectId: entity.projectId,
        name: entity.name,
        type: entity.type.name,
        contentHash: entity.contentHash,
        contentSnapshot: entity.contentSnapshot,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
        chapterId: entity.chapterId,
        description: entity.description,
      );

  Snapshot fromRow(SnapshotRow row) => Snapshot(
        id: row.id,
        projectId: row.projectId,
        name: row.name,
        type: SnapshotType.values.byName(row.type),
        contentHash: row.contentHash,
        contentSnapshot: row.contentSnapshot,
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
        chapterId: row.chapterId,
        description: row.description,
      );
}
