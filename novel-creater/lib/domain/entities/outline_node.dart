import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/outline_node_status.dart';
import 'package:novel_creator/domain/enums/outline_node_type.dart';

part 'outline_node.freezed.dart';
part 'outline_node.g.dart';

@Freezed(toJson: true, fromJson: true)
class OutlineNode with _$OutlineNode {
  const factory OutlineNode({
    required String id,
    required String projectId,
    required int order,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? parentId,
    @Default(OutlineNodeType.chapter) OutlineNodeType nodeType,
    @Default('') String summary,
    String? linkedChapterId,
    @Default(OutlineNodeStatus.planned) OutlineNodeStatus status,
    @Default(1) int schemaVersion,
  }) = _OutlineNode;

  factory OutlineNode.fromJson(Map<String, dynamic> json) =>
      _$OutlineNodeFromJson(json);
}
