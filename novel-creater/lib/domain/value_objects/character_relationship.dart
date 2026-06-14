import 'package:freezed_annotation/freezed_annotation.dart';

part 'character_relationship.freezed.dart';
part 'character_relationship.g.dart';

@freezed
class CharacterRelationship with _$CharacterRelationship {
  const factory CharacterRelationship({
    required String targetCharacterId,
    required String relationType,
    @Default('') String description,
  }) = _CharacterRelationship;

  factory CharacterRelationship.fromJson(Map<String, dynamic> json) =>
      _$CharacterRelationshipFromJson(json);
}
