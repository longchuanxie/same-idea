// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'revision_anchor.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RevisionAnchor _$RevisionAnchorFromJson(Map<String, dynamic> json) {
  return _RevisionAnchor.fromJson(json);
}

/// @nodoc
mixin _$RevisionAnchor {
  int get startOffset => throw _privateConstructorUsedError;
  int get endOffset => throw _privateConstructorUsedError;

  /// Serializes this RevisionAnchor to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RevisionAnchor
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RevisionAnchorCopyWith<RevisionAnchor> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RevisionAnchorCopyWith<$Res> {
  factory $RevisionAnchorCopyWith(
          RevisionAnchor value, $Res Function(RevisionAnchor) then) =
      _$RevisionAnchorCopyWithImpl<$Res, RevisionAnchor>;
  @useResult
  $Res call({int startOffset, int endOffset});
}

/// @nodoc
class _$RevisionAnchorCopyWithImpl<$Res, $Val extends RevisionAnchor>
    implements $RevisionAnchorCopyWith<$Res> {
  _$RevisionAnchorCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RevisionAnchor
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startOffset = null,
    Object? endOffset = null,
  }) {
    return _then(_value.copyWith(
      startOffset: null == startOffset
          ? _value.startOffset
          : startOffset // ignore: cast_nullable_to_non_nullable
              as int,
      endOffset: null == endOffset
          ? _value.endOffset
          : endOffset // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RevisionAnchorImplCopyWith<$Res>
    implements $RevisionAnchorCopyWith<$Res> {
  factory _$$RevisionAnchorImplCopyWith(_$RevisionAnchorImpl value,
          $Res Function(_$RevisionAnchorImpl) then) =
      __$$RevisionAnchorImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int startOffset, int endOffset});
}

/// @nodoc
class __$$RevisionAnchorImplCopyWithImpl<$Res>
    extends _$RevisionAnchorCopyWithImpl<$Res, _$RevisionAnchorImpl>
    implements _$$RevisionAnchorImplCopyWith<$Res> {
  __$$RevisionAnchorImplCopyWithImpl(
      _$RevisionAnchorImpl _value, $Res Function(_$RevisionAnchorImpl) _then)
      : super(_value, _then);

  /// Create a copy of RevisionAnchor
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startOffset = null,
    Object? endOffset = null,
  }) {
    return _then(_$RevisionAnchorImpl(
      startOffset: null == startOffset
          ? _value.startOffset
          : startOffset // ignore: cast_nullable_to_non_nullable
              as int,
      endOffset: null == endOffset
          ? _value.endOffset
          : endOffset // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RevisionAnchorImpl implements _RevisionAnchor {
  const _$RevisionAnchorImpl(
      {required this.startOffset, required this.endOffset});

  factory _$RevisionAnchorImpl.fromJson(Map<String, dynamic> json) =>
      _$$RevisionAnchorImplFromJson(json);

  @override
  final int startOffset;
  @override
  final int endOffset;

  @override
  String toString() {
    return 'RevisionAnchor(startOffset: $startOffset, endOffset: $endOffset)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RevisionAnchorImpl &&
            (identical(other.startOffset, startOffset) ||
                other.startOffset == startOffset) &&
            (identical(other.endOffset, endOffset) ||
                other.endOffset == endOffset));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, startOffset, endOffset);

  /// Create a copy of RevisionAnchor
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RevisionAnchorImplCopyWith<_$RevisionAnchorImpl> get copyWith =>
      __$$RevisionAnchorImplCopyWithImpl<_$RevisionAnchorImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RevisionAnchorImplToJson(
      this,
    );
  }
}

abstract class _RevisionAnchor implements RevisionAnchor {
  const factory _RevisionAnchor(
      {required final int startOffset,
      required final int endOffset}) = _$RevisionAnchorImpl;

  factory _RevisionAnchor.fromJson(Map<String, dynamic> json) =
      _$RevisionAnchorImpl.fromJson;

  @override
  int get startOffset;
  @override
  int get endOffset;

  /// Create a copy of RevisionAnchor
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RevisionAnchorImplCopyWith<_$RevisionAnchorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
