import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryRevisionRepository implements RevisionRepository {
  final Map<String, Revision> _revisions = <String, Revision>{};

  @override
  Future<AppResult<Revision>> create(Revision revision) async {
    _revisions[revision.id] = revision;
    return AppResult<Revision>.success(revision);
  }

  @override
  Future<AppResult<List<Revision>>> listPending(String chapterId) async {
    final revisions = _revisions.values
        .where(
          (revision) =>
              revision.chapterId == chapterId &&
              revision.status == RevisionStatus.pending,
        )
        .toList(growable: false);
    return AppResult<List<Revision>>.success(
      List<Revision>.unmodifiable(revisions),
    );
  }

  @override
  Future<AppResult<Revision>> updateStatus({
    required String id,
    required RevisionStatus status,
  }) async {
    final revision = _revisions[id];
    if (revision == null) {
      return const AppResult<Revision>.failure(
        AppError(
          code: 'revision.not_found',
          message: 'Revision was not found.',
          userMessage: '未找到修订，无法更新状态。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新修订列表后重试。',
        ),
      );
    }

    final validationError = revision.validateTransition(status);
    if (validationError != null) {
      return AppResult<Revision>.failure(
        AppError(
          code: 'revision.invalid_transition',
          message: validationError,
          userMessage: '修订状态转换无效：$validationError',
          source: AppErrorSource.storage,
          recoverable: false,
        ),
      );
    }

    final updated = revision.copyWith(
      status: status,
      updatedAt: DateTime.now().toUtc(),
    );
    _revisions[id] = updated;
    return AppResult<Revision>.success(updated);
  }
}
