import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/character_role.dart';

part 'character.freezed.dart';
part 'character.g.dart';

@Freezed(toJson: true, fromJson: true)
class CharacterRelationship with _$CharacterRelationship {
  const factory CharacterRelationship({
    required String targetCharacterId,
    required String relationType,
    @Default('') String description,
  }) = _CharacterRelationship;

  factory CharacterRelationship.fromJson(Map<String, dynamic> json) =>
      _$CharacterRelationshipFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class ConsistencyFact with _$ConsistencyFact {
  const factory ConsistencyFact({
    required String key,
    required String value,
    String? sourceChapterId,
  }) = _ConsistencyFact;

  factory ConsistencyFact.fromJson(Map<String, dynamic> json) =>
      _$ConsistencyFactFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class Character with _$Character {
  const factory Character({
    required String id,
    required String projectId,
    required String name,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default([]) List<String> aliases,
    @Default(CharacterRole.supporting) CharacterRole role,
    @Default('') String description,
    @Default('') String appearance,
    @Default('') String personality,
    @Default('') String goals,
    @Default('') String conflicts,
    @Default('') String secrets,
    @Default([]) List<CharacterRelationship> relationships,
    String? firstAppearanceChapterId,
    @Default([]) List<String> tags,
    @Default([]) List<ConsistencyFact> consistencyFacts,
    @Default(1) int schemaVersion,
  }) = _Character;

  factory Character.fromJson(Map<String, dynamic> json) =>
      _$CharacterFromJson(json);
}
