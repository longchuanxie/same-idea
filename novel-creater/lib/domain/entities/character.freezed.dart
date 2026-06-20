// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'character.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Character _$CharacterFromJson(Map<String, dynamic> json) {
  return _Character.fromJson(json);
}

/// @nodoc
mixin _$Character {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  CharacterRole get role => throw _privateConstructorUsedError;
  String get avatarUrl => throw _privateConstructorUsedError;
  Map<String, String> get traits => throw _privateConstructorUsedError;
  String get background => throw _privateConstructorUsedError;
  List<String> get aliases => throw _privateConstructorUsedError;
  String get appearance => throw _privateConstructorUsedError;
  String get personality => throw _privateConstructorUsedError;
  String get goals => throw _privateConstructorUsedError;
  String get conflicts => throw _privateConstructorUsedError;
  String get secrets => throw _privateConstructorUsedError;
  List<CharacterRelationship> get relationships =>
      throw _privateConstructorUsedError;
  List<String> get consistencyFacts => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this Character to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CharacterCopyWith<Character> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CharacterCopyWith<$Res> {
  factory $CharacterCopyWith(Character value, $Res Function(Character) then) =
      _$CharacterCopyWithImpl<$Res, Character>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String name,
      String description,
      CharacterRole role,
      String avatarUrl,
      Map<String, String> traits,
      String background,
      List<String> aliases,
      String appearance,
      String personality,
      String goals,
      String conflicts,
      String secrets,
      List<CharacterRelationship> relationships,
      List<String> consistencyFacts,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion});
}

/// @nodoc
class _$CharacterCopyWithImpl<$Res, $Val extends Character>
    implements $CharacterCopyWith<$Res> {
  _$CharacterCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? name = null,
    Object? description = null,
    Object? role = null,
    Object? avatarUrl = null,
    Object? traits = null,
    Object? background = null,
    Object? aliases = null,
    Object? appearance = null,
    Object? personality = null,
    Object? goals = null,
    Object? conflicts = null,
    Object? secrets = null,
    Object? relationships = null,
    Object? consistencyFacts = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? schemaVersion = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as CharacterRole,
      avatarUrl: null == avatarUrl
          ? _value.avatarUrl
          : avatarUrl // ignore: cast_nullable_to_non_nullable
              as String,
      traits: null == traits
          ? _value.traits
          : traits // ignore: cast_nullable_to_non_nullable
              as Map<String, String>,
      background: null == background
          ? _value.background
          : background // ignore: cast_nullable_to_non_nullable
              as String,
      aliases: null == aliases
          ? _value.aliases
          : aliases // ignore: cast_nullable_to_non_nullable
              as List<String>,
      appearance: null == appearance
          ? _value.appearance
          : appearance // ignore: cast_nullable_to_non_nullable
              as String,
      personality: null == personality
          ? _value.personality
          : personality // ignore: cast_nullable_to_non_nullable
              as String,
      goals: null == goals
          ? _value.goals
          : goals // ignore: cast_nullable_to_non_nullable
              as String,
      conflicts: null == conflicts
          ? _value.conflicts
          : conflicts // ignore: cast_nullable_to_non_nullable
              as String,
      secrets: null == secrets
          ? _value.secrets
          : secrets // ignore: cast_nullable_to_non_nullable
              as String,
      relationships: null == relationships
          ? _value.relationships
          : relationships // ignore: cast_nullable_to_non_nullable
              as List<CharacterRelationship>,
      consistencyFacts: null == consistencyFacts
          ? _value.consistencyFacts
          : consistencyFacts // ignore: cast_nullable_to_non_nullable
              as List<String>,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CharacterImplCopyWith<$Res>
    implements $CharacterCopyWith<$Res> {
  factory _$$CharacterImplCopyWith(
          _$CharacterImpl value, $Res Function(_$CharacterImpl) then) =
      __$$CharacterImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String name,
      String description,
      CharacterRole role,
      String avatarUrl,
      Map<String, String> traits,
      String background,
      List<String> aliases,
      String appearance,
      String personality,
      String goals,
      String conflicts,
      String secrets,
      List<CharacterRelationship> relationships,
      List<String> consistencyFacts,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion});
}

/// @nodoc
class __$$CharacterImplCopyWithImpl<$Res>
    extends _$CharacterCopyWithImpl<$Res, _$CharacterImpl>
    implements _$$CharacterImplCopyWith<$Res> {
  __$$CharacterImplCopyWithImpl(
      _$CharacterImpl _value, $Res Function(_$CharacterImpl) _then)
      : super(_value, _then);

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? name = null,
    Object? description = null,
    Object? role = null,
    Object? avatarUrl = null,
    Object? traits = null,
    Object? background = null,
    Object? aliases = null,
    Object? appearance = null,
    Object? personality = null,
    Object? goals = null,
    Object? conflicts = null,
    Object? secrets = null,
    Object? relationships = null,
    Object? consistencyFacts = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$CharacterImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as CharacterRole,
      avatarUrl: null == avatarUrl
          ? _value.avatarUrl
          : avatarUrl // ignore: cast_nullable_to_non_nullable
              as String,
      traits: null == traits
          ? _value._traits
          : traits // ignore: cast_nullable_to_non_nullable
              as Map<String, String>,
      background: null == background
          ? _value.background
          : background // ignore: cast_nullable_to_non_nullable
              as String,
      aliases: null == aliases
          ? _value._aliases
          : aliases // ignore: cast_nullable_to_non_nullable
              as List<String>,
      appearance: null == appearance
          ? _value.appearance
          : appearance // ignore: cast_nullable_to_non_nullable
              as String,
      personality: null == personality
          ? _value.personality
          : personality // ignore: cast_nullable_to_non_nullable
              as String,
      goals: null == goals
          ? _value.goals
          : goals // ignore: cast_nullable_to_non_nullable
              as String,
      conflicts: null == conflicts
          ? _value.conflicts
          : conflicts // ignore: cast_nullable_to_non_nullable
              as String,
      secrets: null == secrets
          ? _value.secrets
          : secrets // ignore: cast_nullable_to_non_nullable
              as String,
      relationships: null == relationships
          ? _value._relationships
          : relationships // ignore: cast_nullable_to_non_nullable
              as List<CharacterRelationship>,
      consistencyFacts: null == consistencyFacts
          ? _value._consistencyFacts
          : consistencyFacts // ignore: cast_nullable_to_non_nullable
              as List<String>,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CharacterImpl implements _Character {
  const _$CharacterImpl(
      {required this.id,
      required this.projectId,
      required this.name,
      this.description = '',
      this.role = CharacterRole.supporting,
      this.avatarUrl = '',
      final Map<String, String> traits = const {},
      this.background = '',
      final List<String> aliases = const [],
      this.appearance = '',
      this.personality = '',
      this.goals = '',
      this.conflicts = '',
      this.secrets = '',
      final List<CharacterRelationship> relationships = const [],
      final List<String> consistencyFacts = const [],
      required this.createdAt,
      required this.updatedAt,
      this.schemaVersion = 1})
      : _traits = traits,
        _aliases = aliases,
        _relationships = relationships,
        _consistencyFacts = consistencyFacts;

  factory _$CharacterImpl.fromJson(Map<String, dynamic> json) =>
      _$$CharacterImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String name;
  @override
  @JsonKey()
  final String description;
  @override
  @JsonKey()
  final CharacterRole role;
  @override
  @JsonKey()
  final String avatarUrl;
  final Map<String, String> _traits;
  @override
  @JsonKey()
  Map<String, String> get traits {
    if (_traits is EqualUnmodifiableMapView) return _traits;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_traits);
  }

  @override
  @JsonKey()
  final String background;
  final List<String> _aliases;
  @override
  @JsonKey()
  List<String> get aliases {
    if (_aliases is EqualUnmodifiableListView) return _aliases;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_aliases);
  }

  @override
  @JsonKey()
  final String appearance;
  @override
  @JsonKey()
  final String personality;
  @override
  @JsonKey()
  final String goals;
  @override
  @JsonKey()
  final String conflicts;
  @override
  @JsonKey()
  final String secrets;
  final List<CharacterRelationship> _relationships;
  @override
  @JsonKey()
  List<CharacterRelationship> get relationships {
    if (_relationships is EqualUnmodifiableListView) return _relationships;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_relationships);
  }

  final List<String> _consistencyFacts;
  @override
  @JsonKey()
  List<String> get consistencyFacts {
    if (_consistencyFacts is EqualUnmodifiableListView)
      return _consistencyFacts;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_consistencyFacts);
  }

  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Character(id: $id, projectId: $projectId, name: $name, description: $description, role: $role, avatarUrl: $avatarUrl, traits: $traits, background: $background, aliases: $aliases, appearance: $appearance, personality: $personality, goals: $goals, conflicts: $conflicts, secrets: $secrets, relationships: $relationships, consistencyFacts: $consistencyFacts, createdAt: $createdAt, updatedAt: $updatedAt, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CharacterImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl) &&
            const DeepCollectionEquality().equals(other._traits, _traits) &&
            (identical(other.background, background) ||
                other.background == background) &&
            const DeepCollectionEquality().equals(other._aliases, _aliases) &&
            (identical(other.appearance, appearance) ||
                other.appearance == appearance) &&
            (identical(other.personality, personality) ||
                other.personality == personality) &&
            (identical(other.goals, goals) || other.goals == goals) &&
            (identical(other.conflicts, conflicts) ||
                other.conflicts == conflicts) &&
            (identical(other.secrets, secrets) || other.secrets == secrets) &&
            const DeepCollectionEquality()
                .equals(other._relationships, _relationships) &&
            const DeepCollectionEquality()
                .equals(other._consistencyFacts, _consistencyFacts) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        projectId,
        name,
        description,
        role,
        avatarUrl,
        const DeepCollectionEquality().hash(_traits),
        background,
        const DeepCollectionEquality().hash(_aliases),
        appearance,
        personality,
        goals,
        conflicts,
        secrets,
        const DeepCollectionEquality().hash(_relationships),
        const DeepCollectionEquality().hash(_consistencyFacts),
        createdAt,
        updatedAt,
        schemaVersion
      ]);

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CharacterImplCopyWith<_$CharacterImpl> get copyWith =>
      __$$CharacterImplCopyWithImpl<_$CharacterImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CharacterImplToJson(
      this,
    );
  }
}

abstract class _Character implements Character {
  const factory _Character(
      {required final String id,
      required final String projectId,
      required final String name,
      final String description,
      final CharacterRole role,
      final String avatarUrl,
      final Map<String, String> traits,
      final String background,
      final List<String> aliases,
      final String appearance,
      final String personality,
      final String goals,
      final String conflicts,
      final String secrets,
      final List<CharacterRelationship> relationships,
      final List<String> consistencyFacts,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final int schemaVersion}) = _$CharacterImpl;

  factory _Character.fromJson(Map<String, dynamic> json) =
      _$CharacterImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get name;
  @override
  String get description;
  @override
  CharacterRole get role;
  @override
  String get avatarUrl;
  @override
  Map<String, String> get traits;
  @override
  String get background;
  @override
  List<String> get aliases;
  @override
  String get appearance;
  @override
  String get personality;
  @override
  String get goals;
  @override
  String get conflicts;
  @override
  String get secrets;
  @override
  List<CharacterRelationship> get relationships;
  @override
  List<String> get consistencyFacts;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  int get schemaVersion;

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CharacterImplCopyWith<_$CharacterImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
