import 'package:novel_creator/domain/entities/outline_node.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class OutlineNodeRepository {
  Future<AppResult<OutlineNode>> create(OutlineNode node);
  Future<AppResult<List<OutlineNode>>> list(String projectId);
  Future<AppResult<OutlineNode?>> get(String id);
  Future<AppResult<OutlineNode>> update(OutlineNode node);
  Future<AppResult<void>> delete(String id);
  Future<AppResult<List<OutlineNode>>> listChildren(String parentId);
}
