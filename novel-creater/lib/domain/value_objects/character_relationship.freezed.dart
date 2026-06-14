// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'character_relationship.dart';

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
