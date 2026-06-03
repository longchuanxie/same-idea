import 'package:novel_creator/domain/domain.dart';

abstract class SnapshotRepository {
  Future<AppResult<Snapshot>> getById(String id);
  Future<AppResult<List<Snapshot>>> getByProjectId(String projectId);
  Future<AppResult<Snapshot>> create(Snapshot snapshot);
  Future<AppResult<void>> delete(String id);
}
