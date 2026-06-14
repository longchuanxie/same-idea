import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';

part 'character.freezed.dart';
part 'character.g.dart';

@freezed
class Character with _$Character {
  const factory Character({
    required String id,
    required String projectId,
    required String name,
    @Default('') String description,
    @Default(CharacterRole.supporting) CharacterRole role,
    @Default('') String avatarUrl,
    @Default({}) Map<String, String> traits,
    @Default('') String background,
    @Default([]) List<String> aliases,
    @Default('') String appearance,
    @Default('') String personality,
    @Default('') String goals,
    @Default('') String conflicts,
    @Default('') String secrets,
    @Default([]) List<CharacterRelationship> relationships,
    @Default([]) List<String> consistencyFacts,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Character;

  factory Character.fromJson(Map<String, dynamic> json) =>
      _$CharacterFromJson(json);
}
