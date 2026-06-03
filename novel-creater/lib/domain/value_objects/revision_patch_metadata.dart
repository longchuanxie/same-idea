import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_patch_metadata.freezed.dart';
part 'revision_patch_metadata.g.dart';

@Freezed(toJson: true, fromJson: true)
class RevisionPatchMetadata with _$RevisionPatchMetadata {
  const factory RevisionPatchMetadata({
    String? prompt,
    String? model,
    String? taskId,
    String? summary,
    String? changeSummary,
    String? baseContentHash,
  }) = _RevisionPatchMetadata;

  factory RevisionPatchMetadata.fromJson(Map<String, dynamic> json) =>
      _$RevisionPatchMetadataFromJson(json);
}
