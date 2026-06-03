import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

part 'revision.freezed.dart';
part 'revision.g.dart';

@Freezed(toJson: true, fromJson: true)
class Revision with _$Revision {
  const factory Revision({
    required String id,
    required String projectId,
    required String chapterId,
    required RevisionOperation operation,
    required RevisionAnchor anchor,
    required String beforeText,
    required String afterText,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(RevisionSource.agent) RevisionSource source,
    @Default(RevisionStatus.pending) RevisionStatus status,
    RevisionPatchMetadata? metadata,
    DateTime? resolvedAt,
    @Default(1) int schemaVersion,
  }) = _Revision;

  const Revision._();

  factory Revision.fromJson(Map<String, dynamic> json) =>
      _$RevisionFromJson(json);

  bool get isPending => status == RevisionStatus.pending;
  bool get isTerminal => status.isTerminal;
}
