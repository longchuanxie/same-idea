// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'revision.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Revision _$RevisionFromJson(Map<String, dynamic> json) {
  return _Revision.fromJson(json);
}

/// @nodoc
mixin _$Revision {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get chapterId => throw _privateConstructorUsedError;
  RevisionOperation get operation => throw _privateConstructorUsedError;
  RevisionAnchor get anchor => throw _privateConstructorUsedError;
  String get beforeText => throw _privateConstructorUsedError;
  String get afterText => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  RevisionSource get source => throw _privateConstructorUsedError;
  RevisionStatus get status => throw _privateConstructorUsedError;
  RevisionPatchMetadata? get metadata => throw _privateConstructorUsedError;
  DateTime? get resolvedAt => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this Revision to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RevisionCopyWith<Revision> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RevisionCopyWith<$Res> {
  factory $RevisionCopyWith(Revision value, $Res Function(Revision) then) =
      _$RevisionCopyWithImpl<$Res, Revision>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String chapterId,
      RevisionOperation operation,
      RevisionAnchor anchor,
      String beforeText,
      String afterText,
      DateTime createdAt,
      DateTime updatedAt,
      RevisionSource source,
      RevisionStatus status,
      RevisionPatchMetadata? metadata,
      DateTime? resolvedAt,
      int schemaVersion});

  $RevisionAnchorCopyWith<$Res> get anchor;
  $RevisionPatchMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class _$RevisionCopyWithImpl<$Res, $Val extends Revision>
    implements $RevisionCopyWith<$Res> {
  _$RevisionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? chapterId = null,
    Object? operation = null,
    Object? anchor = null,
    Object? beforeText = null,
    Object? afterText = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? source = null,
    Object? status = null,
    Object? metadata = freezed,
    Object? resolvedAt = freezed,
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
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
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
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as RevisionSource,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as RevisionStatus,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as RevisionPatchMetadata?,
      resolvedAt: freezed == resolvedAt
          ? _value.resolvedAt
          : resolvedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RevisionAnchorCopyWith<$Res> get anchor {
    return $RevisionAnchorCopyWith<$Res>(_value.anchor, (value) {
      return _then(_value.copyWith(anchor: value) as $Val);
    });
  }

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RevisionPatchMetadataCopyWith<$Res>? get metadata {
    if (_value.metadata == null) {
      return null;
    }

    return $RevisionPatchMetadataCopyWith<$Res>(_value.metadata!, (value) {
      return _then(_value.copyWith(metadata: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$RevisionImplCopyWith<$Res>
    implements $RevisionCopyWith<$Res> {
  factory _$$RevisionImplCopyWith(
          _$RevisionImpl value, $Res Function(_$RevisionImpl) then) =
      __$$RevisionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String chapterId,
      RevisionOperation operation,
      RevisionAnchor anchor,
      String beforeText,
      String afterText,
      DateTime createdAt,
      DateTime updatedAt,
      RevisionSource source,
      RevisionStatus status,
      RevisionPatchMetadata? metadata,
      DateTime? resolvedAt,
      int schemaVersion});

  @override
  $RevisionAnchorCopyWith<$Res> get anchor;
  @override
  $RevisionPatchMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class __$$RevisionImplCopyWithImpl<$Res>
    extends _$RevisionCopyWithImpl<$Res, _$RevisionImpl>
    implements _$$RevisionImplCopyWith<$Res> {
  __$$RevisionImplCopyWithImpl(
      _$RevisionImpl _value, $Res Function(_$RevisionImpl) _then)
      : super(_value, _then);

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? chapterId = null,
    Object? operation = null,
    Object? anchor = null,
    Object? beforeText = null,
    Object? afterText = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? source = null,
    Object? status = null,
    Object? metadata = freezed,
    Object? resolvedAt = freezed,
    Object? schemaVersion = null,
  }) {
    return _then(_$RevisionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
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
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as RevisionSource,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as RevisionStatus,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as RevisionPatchMetadata?,
      resolvedAt: freezed == resolvedAt
          ? _value.resolvedAt
          : resolvedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RevisionImpl extends _Revision {
  const _$RevisionImpl(
      {required this.id,
      required this.projectId,
      required this.chapterId,
      required this.operation,
      required this.anchor,
      required this.beforeText,
      required this.afterText,
      required this.createdAt,
      required this.updatedAt,
      this.source = RevisionSource.agent,
      this.status = RevisionStatus.pending,
      this.metadata,
      this.resolvedAt,
      this.schemaVersion = 1})
      : super._();

  factory _$RevisionImpl.fromJson(Map<String, dynamic> json) =>
      _$$RevisionImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String chapterId;
  @override
  final RevisionOperation operation;
  @override
  final RevisionAnchor anchor;
  @override
  final String beforeText;
  @override
  final String afterText;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final RevisionSource source;
  @override
  @JsonKey()
  final RevisionStatus status;
  @override
  final RevisionPatchMetadata? metadata;
  @override
  final DateTime? resolvedAt;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Revision(id: $id, projectId: $projectId, chapterId: $chapterId, operation: $operation, anchor: $anchor, beforeText: $beforeText, afterText: $afterText, createdAt: $createdAt, updatedAt: $updatedAt, source: $source, status: $status, metadata: $metadata, resolvedAt: $resolvedAt, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RevisionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.chapterId, chapterId) ||
                other.chapterId == chapterId) &&
            (identical(other.operation, operation) ||
                other.operation == operation) &&
            (identical(other.anchor, anchor) || other.anchor == anchor) &&
            (identical(other.beforeText, beforeText) ||
                other.beforeText == beforeText) &&
            (identical(other.afterText, afterText) ||
                other.afterText == afterText) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.metadata, metadata) ||
                other.metadata == metadata) &&
            (identical(other.resolvedAt, resolvedAt) ||
                other.resolvedAt == resolvedAt) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      chapterId,
      operation,
      anchor,
      beforeText,
      afterText,
      createdAt,
      updatedAt,
      source,
      status,
      metadata,
      resolvedAt,
      schemaVersion);

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RevisionImplCopyWith<_$RevisionImpl> get copyWith =>
      __$$RevisionImplCopyWithImpl<_$RevisionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RevisionImplToJson(
      this,
    );
  }
}

abstract class _Revision extends Revision {
  const factory _Revision(
      {required final String id,
      required final String projectId,
      required final String chapterId,
      required final RevisionOperation operation,
      required final RevisionAnchor anchor,
      required final String beforeText,
      required final String afterText,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final RevisionSource source,
      final RevisionStatus status,
      final RevisionPatchMetadata? metadata,
      final DateTime? resolvedAt,
      final int schemaVersion}) = _$RevisionImpl;
  const _Revision._() : super._();

  factory _Revision.fromJson(Map<String, dynamic> json) =
      _$RevisionImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get chapterId;
  @override
  RevisionOperation get operation;
  @override
  RevisionAnchor get anchor;
  @override
  String get beforeText;
  @override
  String get afterText;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  RevisionSource get source;
  @override
  RevisionStatus get status;
  @override
  RevisionPatchMetadata? get metadata;
  @override
  DateTime? get resolvedAt;
  @override
  int get schemaVersion;

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RevisionImplCopyWith<_$RevisionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
