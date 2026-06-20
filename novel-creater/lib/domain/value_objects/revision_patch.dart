import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

part 'revision_patch.freezed.dart';
part 'revision_patch.g.dart';

@freezed
class RevisionPatch with _$RevisionPatch {
  const factory RevisionPatch({
    required String chapterId,
    required String baseContentHash,
    required RevisionOperation operation,
    required RevisionAnchor anchor,
    required String beforeText,
    required String afterText,
    required RevisionSource source,
    required RevisionPatchMetadata metadata,
  }) = _RevisionPatch;

  factory RevisionPatch.fromJson(Map<String, dynamic> json) =>
      _$RevisionPatchFromJson(json);
}
