import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class RevisionRepository {
  Future<AppResult<Revision>> create(Revision revision);

  Future<AppResult<List<Revision>>> listPending(String chapterId);

  Future<AppResult<Revision>> updateStatus({
    required String id,
    required RevisionStatus status,
  });
}
