import 'package:novel_creator/domain/entities/outline_node.dart';
import 'package:novel_creator/domain/repositories/outline_node_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryOutlineNodeRepository implements OutlineNodeRepository {
  final Map<String, OutlineNode> _nodes = <String, OutlineNode>{};

  @override
  Future<AppResult<OutlineNode>> create(OutlineNode node) async {
    _nodes[node.id] = node;
    return AppResult<OutlineNode>.success(node);
  }

  @override
  Future<AppResult<List<OutlineNode>>> list(String projectId) async {
    final nodes = _nodes.values
        .where((node) => node.projectId == projectId)
        .toList()
      ..sort((a, b) {
        final sortCompare = a.sortOrder.compareTo(b.sortOrder);
        return sortCompare != 0
            ? sortCompare
            : a.createdAt.compareTo(b.createdAt);
      });
    return AppResult<List<OutlineNode>>.success(
      List<OutlineNode>.unmodifiable(nodes),
    );
  }

  @override
  Future<AppResult<OutlineNode?>> get(String id) async =>
      AppResult<OutlineNode?>.success(_nodes[id]);

  @override
  Future<AppResult<OutlineNode>> update(OutlineNode node) async {
    final existing = _nodes[node.id];
    if (existing == null) {
      return const AppResult<OutlineNode>.failure(
        AppError(
          code: 'outline_node.not_found',
          message: 'Outline node not found.',
          userMessage: '未找到大纲节点。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新大纲后重试。',
        ),
      );
    }
    final updated = node.copyWith(updatedAt: DateTime.now().toUtc());
    _nodes[node.id] = updated;
    return AppResult<OutlineNode>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _nodes.remove(id);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<List<OutlineNode>>> listChildren(String parentId) async {
    final children = _nodes.values
        .where((node) => node.parentId == parentId)
        .toList()
      ..sort((a, b) {
        final sortCompare = a.sortOrder.compareTo(b.sortOrder);
        return sortCompare != 0
            ? sortCompare
            : a.createdAt.compareTo(b.createdAt);
      });
    return AppResult<List<OutlineNode>>.success(
      List<OutlineNode>.unmodifiable(children),
    );
  }
}
