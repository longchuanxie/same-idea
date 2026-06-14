import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_patch_metadata.freezed.dart';
part 'revision_patch_metadata.g.dart';

@freezed
class RevisionPatchMetadata with _$RevisionPatchMetadata {
  const factory RevisionPatchMetadata({
    required String prompt,
    required String model,
    required String summary,
    String? taskId,
  }) = _RevisionPatchMetadata;

  factory RevisionPatchMetadata.fromJson(Map<String, dynamic> json) =>
      _$RevisionPatchMetadataFromJson(json);
}
