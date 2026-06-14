import 'package:freezed_annotation/freezed_annotation.dart';

part 'outline_node.freezed.dart';
part 'outline_node.g.dart';

@freezed
class OutlineNode with _$OutlineNode {
  const factory OutlineNode({
    required String id,
    required String projectId,
    required String title,
    @Default('') String summary,
    @Default('') String chapterId,
    @Default('') String parentId,
    @Default(0) int sortOrder,
    @Default([]) List<String> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _OutlineNode;

  const OutlineNode._();

  factory OutlineNode.fromJson(Map<String, dynamic> json) =>
      _$OutlineNodeFromJson(json);

  bool get isRoot => parentId.isEmpty;
  bool get hasLinkedChapter => chapterId.isNotEmpty;
}
