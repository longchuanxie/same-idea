import 'dart:convert';

import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';

final class RevisionMapper {
  const RevisionMapper();

  RevisionRow toRow(Revision entity) => RevisionRow(
        id: entity.id,
        projectId: entity.projectId,
        chapterId: entity.chapterId,
        patchJson: jsonEncode(entity.patch.toJson()),
        status: entity.status.name,
        createdAt: entity.createdAt.millisecondsSinceEpoch,
        updatedAt: entity.updatedAt.millisecondsSinceEpoch,
        schemaVersion: entity.schemaVersion,
      );

  Revision fromRow(RevisionRow row) => Revision(
        id: row.id,
        projectId: row.projectId,
        chapterId: row.chapterId,
        patch: RevisionPatch.fromJson(
          jsonDecode(row.patchJson) as Map<String, dynamic>,
        ),
        status: RevisionStatus.values.byName(row.status),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(row.createdAt, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(row.updatedAt, isUtc: true),
        schemaVersion: row.schemaVersion,
      );
}
