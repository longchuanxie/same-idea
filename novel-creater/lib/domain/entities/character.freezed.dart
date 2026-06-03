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

CharacterRelationship _$CharacterRelationshipFromJson(
    Map<String, dynamic> json) {
  return _CharacterRelationship.fromJson(json);
}

/// @nodoc
mixin _$CharacterRelationship {
  String get targetCharacterId => throw _privateConstructorUsedError;
  String get relationType => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;

  /// Serializes this CharacterRelationship to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CharacterRelationship
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CharacterRelationshipCopyWith<CharacterRelationship> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CharacterRelationshipCopyWith<$Res> {
  factory $CharacterRelationshipCopyWith(CharacterRelationship value,
          $Res Function(CharacterRelationship) then) =
      _$CharacterRelationshipCopyWithImpl<$Res, CharacterRelationship>;
  @useResult
  $Res call(
      {String targetCharacterId, String relationType, String description});
}

/// @nodoc
class _$CharacterRelationshipCopyWithImpl<$Res,
        $Val extends CharacterRelationship>
    implements $CharacterRelationshipCopyWith<$Res> {
  _$CharacterRelationshipCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CharacterRelationship
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? targetCharacterId = null,
    Object? relationType = null,
    Object? description = null,
  }) {
    return _then(_value.copyWith(
      targetCharacterId: null == targetCharacterId
          ? _value.targetCharacterId
          : targetCharacterId // ignore: cast_nullable_to_non_nullable
              as String,
      relationType: null == relationType
          ? _value.relationType
          : relationType // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CharacterRelationshipImplCopyWith<$Res>
    implements $CharacterRelationshipCopyWith<$Res> {
  factory _$$CharacterRelationshipImplCopyWith(
          _$CharacterRelationshipImpl value,
          $Res Function(_$CharacterRelationshipImpl) then) =
      __$$CharacterRelationshipImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String targetCharacterId, String relationType, String description});
}

/// @nodoc
class __$$CharacterRelationshipImplCopyWithImpl<$Res>
    extends _$CharacterRelationshipCopyWithImpl<$Res,
        _$CharacterRelationshipImpl>
    implements _$$CharacterRelationshipImplCopyWith<$Res> {
  __$$CharacterRelationshipImplCopyWithImpl(_$CharacterRelationshipImpl _value,
      $Res Function(_$CharacterRelationshipImpl) _then)
      : super(_value, _then);

  /// Create a copy of CharacterRelationship
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? targetCharacterId = null,
    Object? relationType = null,
    Object? description = null,
  }) {
    return _then(_$CharacterRelationshipImpl(
      targetCharacterId: null == targetCharacterId
          ? _value.targetCharacterId
          : targetCharacterId // ignore: cast_nullable_to_non_nullable
              as String,
      relationType: null == relationType
          ? _value.relationType
          : relationType // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CharacterRelationshipImpl implements _CharacterRelationship {
  const _$CharacterRelationshipImpl(
      {required this.targetCharacterId,
      required this.relationType,
      this.description = ''});

  factory _$CharacterRelationshipImpl.fromJson(Map<String, dynamic> json) =>
      _$$CharacterRelationshipImplFromJson(json);

  @override
  final String targetCharacterId;
  @override
  final String relationType;
  @override
  @JsonKey()
  final String description;

  @override
  String toString() {
    return 'CharacterRelationship(targetCharacterId: $targetCharacterId, relationType: $relationType, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CharacterRelationshipImpl &&
            (identical(other.targetCharacterId, targetCharacterId) ||
                other.targetCharacterId == targetCharacterId) &&
            (identical(other.relationType, relationType) ||
                other.relationType == relationType) &&
            (identical(other.description, description) ||
                other.description == description));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, targetCharacterId, relationType, description);

  /// Create a copy of CharacterRelationship
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CharacterRelationshipImplCopyWith<_$CharacterRelationshipImpl>
      get copyWith => __$$CharacterRelationshipImplCopyWithImpl<
          _$CharacterRelationshipImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CharacterRelationshipImplToJson(
      this,
    );
  }
}

abstract class _CharacterRelationship implements CharacterRelationship {
  const factory _CharacterRelationship(
      {required final String targetCharacterId,
      required final String relationType,
      final String description}) = _$CharacterRelationshipImpl;

  factory _CharacterRelationship.fromJson(Map<String, dynamic> json) =
      _$CharacterRelationshipImpl.fromJson;

  @override
  String get targetCharacterId;
  @override
  String get relationType;
  @override
  String get description;

  /// Create a copy of CharacterRelationship
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CharacterRelationshipImplCopyWith<_$CharacterRelationshipImpl>
      get copyWith => throw _privateConstructorUsedError;
}

ConsistencyFact _$ConsistencyFactFromJson(Map<String, dynamic> json) {
  return _ConsistencyFact.fromJson(json);
}

/// @nodoc
mixin _$ConsistencyFact {
  String get key => throw _privateConstructorUsedError;
  String get value => throw _privateConstructorUsedError;
  String? get sourceChapterId => throw _privateConstructorUsedError;

  /// Serializes this ConsistencyFact to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ConsistencyFact
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ConsistencyFactCopyWith<ConsistencyFact> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ConsistencyFactCopyWith<$Res> {
  factory $ConsistencyFactCopyWith(
          ConsistencyFact value, $Res Function(ConsistencyFact) then) =
      _$ConsistencyFactCopyWithImpl<$Res, ConsistencyFact>;
  @useResult
  $Res call({String key, String value, String? sourceChapterId});
}

/// @nodoc
class _$ConsistencyFactCopyWithImpl<$Res, $Val extends ConsistencyFact>
    implements $ConsistencyFactCopyWith<$Res> {
  _$ConsistencyFactCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ConsistencyFact
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? key = null,
    Object? value = null,
    Object? sourceChapterId = freezed,
  }) {
    return _then(_value.copyWith(
      key: null == key
          ? _value.key
          : key // ignore: cast_nullable_to_non_nullable
              as String,
      value: null == value
          ? _value.value
          : value // ignore: cast_nullable_to_non_nullable
              as String,
      sourceChapterId: freezed == sourceChapterId
          ? _value.sourceChapterId
          : sourceChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ConsistencyFactImplCopyWith<$Res>
    implements $ConsistencyFactCopyWith<$Res> {
  factory _$$ConsistencyFactImplCopyWith(_$ConsistencyFactImpl value,
          $Res Function(_$ConsistencyFactImpl) then) =
      __$$ConsistencyFactImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String key, String value, String? sourceChapterId});
}

/// @nodoc
class __$$ConsistencyFactImplCopyWithImpl<$Res>
    extends _$ConsistencyFactCopyWithImpl<$Res, _$ConsistencyFactImpl>
    implements _$$ConsistencyFactImplCopyWith<$Res> {
  __$$ConsistencyFactImplCopyWithImpl(
      _$ConsistencyFactImpl _value, $Res Function(_$ConsistencyFactImpl) _then)
      : super(_value, _then);

  /// Create a copy of ConsistencyFact
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? key = null,
    Object? value = null,
    Object? sourceChapterId = freezed,
  }) {
    return _then(_$ConsistencyFactImpl(
      key: null == key
          ? _value.key
          : key // ignore: cast_nullable_to_non_nullable
              as String,
      value: null == value
          ? _value.value
          : value // ignore: cast_nullable_to_non_nullable
              as String,
      sourceChapterId: freezed == sourceChapterId
          ? _value.sourceChapterId
          : sourceChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ConsistencyFactImpl implements _ConsistencyFact {
  const _$ConsistencyFactImpl(
      {required this.key, required this.value, this.sourceChapterId});

  factory _$ConsistencyFactImpl.fromJson(Map<String, dynamic> json) =>
      _$$ConsistencyFactImplFromJson(json);

  @override
  final String key;
  @override
  final String value;
  @override
  final String? sourceChapterId;

  @override
  String toString() {
    return 'ConsistencyFact(key: $key, value: $value, sourceChapterId: $sourceChapterId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ConsistencyFactImpl &&
            (identical(other.key, key) || other.key == key) &&
            (identical(other.value, value) || other.value == value) &&
            (identical(other.sourceChapterId, sourceChapterId) ||
                other.sourceChapterId == sourceChapterId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, key, value, sourceChapterId);

  /// Create a copy of ConsistencyFact
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ConsistencyFactImplCopyWith<_$ConsistencyFactImpl> get copyWith =>
      __$$ConsistencyFactImplCopyWithImpl<_$ConsistencyFactImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ConsistencyFactImplToJson(
      this,
    );
  }
}

abstract class _ConsistencyFact implements ConsistencyFact {
  const factory _ConsistencyFact(
      {required final String key,
      required final String value,
      final String? sourceChapterId}) = _$ConsistencyFactImpl;

  factory _ConsistencyFact.fromJson(Map<String, dynamic> json) =
      _$ConsistencyFactImpl.fromJson;

  @override
  String get key;
  @override
  String get value;
  @override
  String? get sourceChapterId;

  /// Create a copy of ConsistencyFact
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ConsistencyFactImplCopyWith<_$ConsistencyFactImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Character _$CharacterFromJson(Map<String, dynamic> json) {
  return _Character.fromJson(json);
}

/// @nodoc
mixin _$Character {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  List<String> get aliases => throw _privateConstructorUsedError;
  CharacterRole get role => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get appearance => throw _privateConstructorUsedError;
  String get personality => throw _privateConstructorUsedError;
  String get goals => throw _privateConstructorUsedError;
  String get conflicts => throw _privateConstructorUsedError;
  String get secrets => throw _privateConstructorUsedError;
  List<CharacterRelationship> get relationships =>
      throw _privateConstructorUsedError;
  String? get firstAppearanceChapterId => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  List<ConsistencyFact> get consistencyFacts =>
      throw _privateConstructorUsedError;
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
      DateTime createdAt,
      DateTime updatedAt,
      List<String> aliases,
      CharacterRole role,
      String description,
      String appearance,
      String personality,
      String goals,
      String conflicts,
      String secrets,
      List<CharacterRelationship> relationships,
      String? firstAppearanceChapterId,
      List<String> tags,
      List<ConsistencyFact> consistencyFacts,
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
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? aliases = null,
    Object? role = null,
    Object? description = null,
    Object? appearance = null,
    Object? personality = null,
    Object? goals = null,
    Object? conflicts = null,
    Object? secrets = null,
    Object? relationships = null,
    Object? firstAppearanceChapterId = freezed,
    Object? tags = null,
    Object? consistencyFacts = null,
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
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      aliases: null == aliases
          ? _value.aliases
          : aliases // ignore: cast_nullable_to_non_nullable
              as List<String>,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as CharacterRole,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
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
      firstAppearanceChapterId: freezed == firstAppearanceChapterId
          ? _value.firstAppearanceChapterId
          : firstAppearanceChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      consistencyFacts: null == consistencyFacts
          ? _value.consistencyFacts
          : consistencyFacts // ignore: cast_nullable_to_non_nullable
              as List<ConsistencyFact>,
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
      DateTime createdAt,
      DateTime updatedAt,
      List<String> aliases,
      CharacterRole role,
      String description,
      String appearance,
      String personality,
      String goals,
      String conflicts,
      String secrets,
      List<CharacterRelationship> relationships,
      String? firstAppearanceChapterId,
      List<String> tags,
      List<ConsistencyFact> consistencyFacts,
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
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? aliases = null,
    Object? role = null,
    Object? description = null,
    Object? appearance = null,
    Object? personality = null,
    Object? goals = null,
    Object? conflicts = null,
    Object? secrets = null,
    Object? relationships = null,
    Object? firstAppearanceChapterId = freezed,
    Object? tags = null,
    Object? consistencyFacts = null,
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
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      aliases: null == aliases
          ? _value._aliases
          : aliases // ignore: cast_nullable_to_non_nullable
              as List<String>,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as CharacterRole,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
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
      firstAppearanceChapterId: freezed == firstAppearanceChapterId
          ? _value.firstAppearanceChapterId
          : firstAppearanceChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      tags: null == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      consistencyFacts: null == consistencyFacts
          ? _value._consistencyFacts
          : consistencyFacts // ignore: cast_nullable_to_non_nullable
              as List<ConsistencyFact>,
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
      required this.createdAt,
      required this.updatedAt,
      final List<String> aliases = const [],
      this.role = CharacterRole.supporting,
      this.description = '',
      this.appearance = '',
      this.personality = '',
      this.goals = '',
      this.conflicts = '',
      this.secrets = '',
      final List<CharacterRelationship> relationships = const [],
      this.firstAppearanceChapterId,
      final List<String> tags = const [],
      final List<ConsistencyFact> consistencyFacts = const [],
      this.schemaVersion = 1})
      : _aliases = aliases,
        _relationships = relationships,
        _tags = tags,
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
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
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
  final CharacterRole role;
  @override
  @JsonKey()
  final String description;
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

  @override
  final String? firstAppearanceChapterId;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  final List<ConsistencyFact> _consistencyFacts;
  @override
  @JsonKey()
  List<ConsistencyFact> get consistencyFacts {
    if (_consistencyFacts is EqualUnmodifiableListView)
      return _consistencyFacts;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_consistencyFacts);
  }

  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Character(id: $id, projectId: $projectId, name: $name, createdAt: $createdAt, updatedAt: $updatedAt, aliases: $aliases, role: $role, description: $description, appearance: $appearance, personality: $personality, goals: $goals, conflicts: $conflicts, secrets: $secrets, relationships: $relationships, firstAppearanceChapterId: $firstAppearanceChapterId, tags: $tags, consistencyFacts: $consistencyFacts, schemaVersion: $schemaVersion)';
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
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(other._aliases, _aliases) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.description, description) ||
                other.description == description) &&
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
            (identical(
                    other.firstAppearanceChapterId, firstAppearanceChapterId) ||
                other.firstAppearanceChapterId == firstAppearanceChapterId) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            const DeepCollectionEquality()
                .equals(other._consistencyFacts, _consistencyFacts) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      name,
      createdAt,
      updatedAt,
      const DeepCollectionEquality().hash(_aliases),
      role,
      description,
      appearance,
      personality,
      goals,
      conflicts,
      secrets,
      const DeepCollectionEquality().hash(_relationships),
      firstAppearanceChapterId,
      const DeepCollectionEquality().hash(_tags),
      const DeepCollectionEquality().hash(_consistencyFacts),
      schemaVersion);

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
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final List<String> aliases,
      final CharacterRole role,
      final String description,
      final String appearance,
      final String personality,
      final String goals,
      final String conflicts,
      final String secrets,
      final List<CharacterRelationship> relationships,
      final String? firstAppearanceChapterId,
      final List<String> tags,
      final List<ConsistencyFact> consistencyFacts,
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
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  List<String> get aliases;
  @override
  CharacterRole get role;
  @override
  String get description;
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
  String? get firstAppearanceChapterId;
  @override
  List<String> get tags;
  @override
  List<ConsistencyFact> get consistencyFacts;
  @override
  int get schemaVersion;

  /// Create a copy of Character
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CharacterImplCopyWith<_$CharacterImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
