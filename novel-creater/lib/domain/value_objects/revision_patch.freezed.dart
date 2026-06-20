// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'revision_patch.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RevisionPatch _$RevisionPatchFromJson(Map<String, dynamic> json) {
  return _RevisionPatch.fromJson(json);
}

/// @nodoc
mixin _$RevisionPatch {
  String get chapterId => throw _privateConstructorUsedError;
  String get baseContentHash => throw _privateConstructorUsedError;
  RevisionOperation get operation => throw _privateConstructorUsedError;
  RevisionAnchor get anchor => throw _privateConstructorUsedError;
  String get beforeText => throw _privateConstructorUsedError;
  String get afterText => throw _privateConstructorUsedError;
  RevisionSource get source => throw _privateConstructorUsedError;
  RevisionPatchMetadata get metadata => throw _privateConstructorUsedError;

  /// Serializes this RevisionPatch to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RevisionPatchCopyWith<RevisionPatch> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RevisionPatchCopyWith<$Res> {
  factory $RevisionPatchCopyWith(
          RevisionPatch value, $Res Function(RevisionPatch) then) =
      _$RevisionPatchCopyWithImpl<$Res, RevisionPatch>;
  @useResult
  $Res call(
      {String chapterId,
      String baseContentHash,
      RevisionOperation operation,
      RevisionAnchor anchor,
      String beforeText,
      String afterText,
      RevisionSource source,
      RevisionPatchMetadata metadata});

  $RevisionAnchorCopyWith<$Res> get anchor;
  $RevisionPatchMetadataCopyWith<$Res> get metadata;
}

/// @nodoc
class _$RevisionPatchCopyWithImpl<$Res, $Val extends RevisionPatch>
    implements $RevisionPatchCopyWith<$Res> {
  _$RevisionPatchCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chapterId = null,
    Object? baseContentHash = null,
    Object? operation = null,
    Object? anchor = null,
    Object? beforeText = null,
    Object? afterText = null,
    Object? source = null,
    Object? metadata = null,
  }) {
    return _then(_value.copyWith(
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String,
      baseContentHash: null == baseContentHash
          ? _value.baseContentHash
          : baseContentHash // ignore: cast_nullable_to_non_nullable
              as String,
      operation: null == operation
          ? _value.operation
          : operation // ignore: cast_nullable_to_non_nullable
              as RevisionOperation,
      anchor: null == anchor
          ? _value.anchor
          : anchor // ignore: cast_nullable_to_non_nullable
              as RevisionAnchor,
      beforeText: null == beforeText
          ? _value.beforeText
          : beforeText // ignore: cast_nullable_to_non_nullable
              as String,
      afterText: null == afterText
          ? _value.afterText
          : afterText // ignore: cast_nullable_to_non_nullable
              as String,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as RevisionSource,
      metadata: null == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as RevisionPatchMetadata,
    ) as $Val);
  }

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RevisionAnchorCopyWith<$Res> get anchor {
    return $RevisionAnchorCopyWith<$Res>(_value.anchor, (value) {
      return _then(_value.copyWith(anchor: value) as $Val);
    });
  }

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RevisionPatchMetadataCopyWith<$Res> get metadata {
    return $RevisionPatchMetadataCopyWith<$Res>(_value.metadata, (value) {
      return _then(_value.copyWith(metadata: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$RevisionPatchImplCopyWith<$Res>
    implements $RevisionPatchCopyWith<$Res> {
  factory _$$RevisionPatchImplCopyWith(
          _$RevisionPatchImpl value, $Res Function(_$RevisionPatchImpl) then) =
      __$$RevisionPatchImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String chapterId,
      String baseContentHash,
      RevisionOperation operation,
      RevisionAnchor anchor,
      String beforeText,
      String afterText,
      RevisionSource source,
      RevisionPatchMetadata metadata});

  @override
  $RevisionAnchorCopyWith<$Res> get anchor;
  @override
  $RevisionPatchMetadataCopyWith<$Res> get metadata;
}

/// @nodoc
class __$$RevisionPatchImplCopyWithImpl<$Res>
    extends _$RevisionPatchCopyWithImpl<$Res, _$RevisionPatchImpl>
    implements _$$RevisionPatchImplCopyWith<$Res> {
  __$$RevisionPatchImplCopyWithImpl(
      _$RevisionPatchImpl _value, $Res Function(_$RevisionPatchImpl) _then)
      : super(_value, _then);

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chapterId = null,
    Object? baseContentHash = null,
    Object? operation = null,
    Object? anchor = null,
    Object? beforeText = null,
    Object? afterText = null,
    Object? source = null,
    Object? metadata = null,
  }) {
    return _then(_$RevisionPatchImpl(
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String,
      baseContentHash: null == baseContentHash
          ? _value.baseContentHash
          : baseContentHash // ignore: cast_nullable_to_non_nullable
              as String,
      operation: null == operation
          ? _value.operation
          : operation // ignore: cast_nullable_to_non_nullable
              as RevisionOperation,
      anchor: null == anchor
          ? _value.anchor
          : anchor // ignore: cast_nullable_to_non_nullable
              as RevisionAnchor,
      beforeText: null == beforeText
          ? _value.beforeText
          : beforeText // ignore: cast_nullable_to_non_nullable
              as String,
      afterText: null == afterText
          ? _value.afterText
          : afterText // ignore: cast_nullable_to_non_nullable
              as String,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as RevisionSource,
      metadata: null == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as RevisionPatchMetadata,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RevisionPatchImpl implements _RevisionPatch {
  const _$RevisionPatchImpl(
      {required this.chapterId,
      required this.baseContentHash,
      required this.operation,
      required this.anchor,
      required this.beforeText,
      required this.afterText,
      required this.source,
      required this.metadata});

  factory _$RevisionPatchImpl.fromJson(Map<String, dynamic> json) =>
      _$$RevisionPatchImplFromJson(json);

  @override
  final String chapterId;
  @override
  final String baseContentHash;
  @override
  final RevisionOperation operation;
  @override
  final RevisionAnchor anchor;
  @override
  final String beforeText;
  @override
  final String afterText;
  @override
  final RevisionSource source;
  @override
  final RevisionPatchMetadata metadata;

  @override
  String toString() {
    return 'RevisionPatch(chapterId: $chapterId, baseContentHash: $baseContentHash, operation: $operation, anchor: $anchor, beforeText: $beforeText, afterText: $afterText, source: $source, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RevisionPatchImpl &&
            (identical(other.chapterId, chapterId) ||
                other.chapterId == chapterId) &&
            (identical(other.baseContentHash, baseContentHash) ||
                other.baseContentHash == baseContentHash) &&
            (identical(other.operation, operation) ||
                other.operation == operation) &&
            (identical(other.anchor, anchor) || other.anchor == anchor) &&
            (identical(other.beforeText, beforeText) ||
                other.beforeText == beforeText) &&
            (identical(other.afterText, afterText) ||
                other.afterText == afterText) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.metadata, metadata) ||
                other.metadata == metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, chapterId, baseContentHash,
      operation, anchor, beforeText, afterText, source, metadata);

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RevisionPatchImplCopyWith<_$RevisionPatchImpl> get copyWith =>
      __$$RevisionPatchImplCopyWithImpl<_$RevisionPatchImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RevisionPatchImplToJson(
      this,
    );
  }
}

abstract class _RevisionPatch implements RevisionPatch {
  const factory _RevisionPatch(
      {required final String chapterId,
      required final String baseContentHash,
      required final RevisionOperation operation,
      required final RevisionAnchor anchor,
      required final String beforeText,
      required final String afterText,
      required final RevisionSource source,
      required final RevisionPatchMetadata metadata}) = _$RevisionPatchImpl;

  factory _RevisionPatch.fromJson(Map<String, dynamic> json) =
      _$RevisionPatchImpl.fromJson;

  @override
  String get chapterId;
  @override
  String get baseContentHash;
  @override
  RevisionOperation get operation;
  @override
  RevisionAnchor get anchor;
  @override
  String get beforeText;
  @override
  String get afterText;
  @override
  RevisionSource get source;
  @override
  RevisionPatchMetadata get metadata;

  /// Create a copy of RevisionPatch
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RevisionPatchImplCopyWith<_$RevisionPatchImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
