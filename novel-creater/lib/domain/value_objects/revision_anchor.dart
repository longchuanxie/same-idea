import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_anchor.freezed.dart';
part 'revision_anchor.g.dart';

@freezed
class RevisionAnchor with _$RevisionAnchor {
  const factory RevisionAnchor({
    required int startOffset,
    required int endOffset,
  }) = _RevisionAnchor;

  factory RevisionAnchor.fromJson(Map<String, dynamic> json) =>
      _$RevisionAnchorFromJson(json);
}
