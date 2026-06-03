import 'package:novel_creator/domain/domain.dart';

abstract class OutlineNodeRepository {
  Future<AppResult<OutlineNode>> getById(String id);
  Future<AppResult<List<OutlineNode>>> getByProjectId(String projectId);
  Future<AppResult<OutlineNode>> create(OutlineNode node);
  Future<AppResult<OutlineNode>> update(OutlineNode node);
  Future<AppResult<void>> delete(String id);
  Future<AppResult<void>> reorder(String projectId, List<String> orderedIds);
}
