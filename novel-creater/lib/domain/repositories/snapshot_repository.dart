import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class SnapshotRepository {
  Future<AppResult<Snapshot>> create(Snapshot snapshot);

  Future<AppResult<Snapshot>> getById(String id);

  Future<AppResult<List<Snapshot>>> listByProject(String projectId);

  Future<AppResult<List<Snapshot>>> listByType(
    String projectId,
    SnapshotType type,
  );

  Future<AppResult<List<Snapshot>>> listByChapter(
    String projectId,
    String chapterId,
  );

  Future<AppResult<void>> delete(String id);
}
