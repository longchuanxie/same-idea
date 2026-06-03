import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_anchor.freezed.dart';
part 'revision_anchor.g.dart';

enum AnchorType { cursor, selection, line, paragraph }

@Freezed(toJson: true, fromJson: true)
class RevisionAnchor with _$RevisionAnchor {
  const factory RevisionAnchor({
    required AnchorType type,
    required int offset,
    @Default(0) int length,
    @Default('') String contextBefore,
    @Default('') String contextAfter,
  }) = _RevisionAnchor;

  factory RevisionAnchor.fromJson(Map<String, dynamic> json) =>
      _$RevisionAnchorFromJson(json);
}
