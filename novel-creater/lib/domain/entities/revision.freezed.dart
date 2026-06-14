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
  RevisionPatch get patch => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  RevisionStatus get status => throw _privateConstructorUsedError;
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
      RevisionPatch patch,
      DateTime createdAt,
      DateTime updatedAt,
      RevisionStatus status,
      int schemaVersion});

  $RevisionPatchCopyWith<$Res> get patch;
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
    Object? patch = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? status = null,
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
      patch: null == patch
          ? _value.patch
          : patch // ignore: cast_nullable_to_non_nullable
              as RevisionPatch,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as RevisionStatus,
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
  $RevisionPatchCopyWith<$Res> get patch {
    return $RevisionPatchCopyWith<$Res>(_value.patch, (value) {
      return _then(_value.copyWith(patch: value) as $Val);
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
      RevisionPatch patch,
      DateTime createdAt,
      DateTime updatedAt,
      RevisionStatus status,
      int schemaVersion});

  @override
  $RevisionPatchCopyWith<$Res> get patch;
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
    Object? patch = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? status = null,
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
      patch: null == patch
          ? _value.patch
          : patch // ignore: cast_nullable_to_non_nullable
              as RevisionPatch,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as RevisionStatus,
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
      required this.patch,
      required this.createdAt,
      required this.updatedAt,
      this.status = RevisionStatus.pending,
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
  final RevisionPatch patch;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final RevisionStatus status;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Revision(id: $id, projectId: $projectId, chapterId: $chapterId, patch: $patch, createdAt: $createdAt, updatedAt: $updatedAt, status: $status, schemaVersion: $schemaVersion)';
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
            (identical(other.patch, patch) || other.patch == patch) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, projectId, chapterId, patch,
      createdAt, updatedAt, status, schemaVersion);

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
      required final RevisionPatch patch,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final RevisionStatus status,
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
  RevisionPatch get patch;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  RevisionStatus get status;
  @override
  int get schemaVersion;

  /// Create a copy of Revision
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RevisionImplCopyWith<_$RevisionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
