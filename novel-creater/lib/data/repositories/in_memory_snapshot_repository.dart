import 'package:novel_creator/domain/entities/snapshot.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';
import 'package:novel_creator/domain/repositories/snapshot_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemorySnapshotRepository implements SnapshotRepository {
  final Map<String, Snapshot> _snapshots = <String, Snapshot>{};

  @override
  Future<AppResult<Snapshot>> create(Snapshot snapshot) async {
    _snapshots[snapshot.id] = snapshot;
    return AppResult<Snapshot>.success(snapshot);
  }

  @override
  Future<AppResult<Snapshot>> getById(String id) async {
    final snapshot = _snapshots[id];
    if (snapshot == null) {
      return const AppResult<Snapshot>.failure(
        AppError(
          code: 'snapshot.not_found',
          message: 'Snapshot was not found.',
          userMessage: '未找到快照记录。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新快照列表后重试。',
        ),
      );
    }
    return AppResult<Snapshot>.success(snapshot);
  }

  @override
  Future<AppResult<List<Snapshot>>> listByProject(String projectId) async {
    final snapshots = _snapshots.values
        .where((s) => s.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<Snapshot>>.success(
      List<Snapshot>.unmodifiable(snapshots),
    );
  }

  @override
  Future<AppResult<List<Snapshot>>> listByType(
    String projectId,
    SnapshotType type,
  ) async {
    final snapshots = _snapshots.values
        .where((s) => s.projectId == projectId && s.type == type)
        .toList(growable: false);
    return AppResult<List<Snapshot>>.success(
      List<Snapshot>.unmodifiable(snapshots),
    );
  }

  @override
  Future<AppResult<List<Snapshot>>> listByChapter(
    String projectId,
    String chapterId,
  ) async {
    final snapshots = _snapshots.values
        .where(
          (s) => s.projectId == projectId && s.chapterId == chapterId,
        )
        .toList(growable: false);
    return AppResult<List<Snapshot>>.success(
      List<Snapshot>.unmodifiable(snapshots),
    );
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _snapshots.remove(id);
    return AppResult<void>.success(null);
  }
}
