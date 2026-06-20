// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'snapshot.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Snapshot _$SnapshotFromJson(Map<String, dynamic> json) {
  return _Snapshot.fromJson(json);
}

/// @nodoc
mixin _$Snapshot {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  SnapshotType get type => throw _privateConstructorUsedError;
  String get contentHash => throw _privateConstructorUsedError;
  String get contentSnapshot => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;
  String? get chapterId => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;

  /// Serializes this Snapshot to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SnapshotCopyWith<Snapshot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SnapshotCopyWith<$Res> {
  factory $SnapshotCopyWith(Snapshot value, $Res Function(Snapshot) then) =
      _$SnapshotCopyWithImpl<$Res, Snapshot>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String name,
      SnapshotType type,
      String contentHash,
      String contentSnapshot,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion,
      String? chapterId,
      String? description});
}

/// @nodoc
class _$SnapshotCopyWithImpl<$Res, $Val extends Snapshot>
    implements $SnapshotCopyWith<$Res> {
  _$SnapshotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? name = null,
    Object? type = null,
    Object? contentHash = null,
    Object? contentSnapshot = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? schemaVersion = null,
    Object? chapterId = freezed,
    Object? description = freezed,
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
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as SnapshotType,
      contentHash: null == contentHash
          ? _value.contentHash
          : contentHash // ignore: cast_nullable_to_non_nullable
              as String,
      contentSnapshot: null == contentSnapshot
          ? _value.contentSnapshot
          : contentSnapshot // ignore: cast_nullable_to_non_nullable
              as String,
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
      chapterId: freezed == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SnapshotImplCopyWith<$Res>
    implements $SnapshotCopyWith<$Res> {
  factory _$$SnapshotImplCopyWith(
          _$SnapshotImpl value, $Res Function(_$SnapshotImpl) then) =
      __$$SnapshotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String name,
      SnapshotType type,
      String contentHash,
      String contentSnapshot,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion,
      String? chapterId,
      String? description});
}

/// @nodoc
class __$$SnapshotImplCopyWithImpl<$Res>
    extends _$SnapshotCopyWithImpl<$Res, _$SnapshotImpl>
    implements _$$SnapshotImplCopyWith<$Res> {
  __$$SnapshotImplCopyWithImpl(
      _$SnapshotImpl _value, $Res Function(_$SnapshotImpl) _then)
      : super(_value, _then);

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? name = null,
    Object? type = null,
    Object? contentHash = null,
    Object? contentSnapshot = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? schemaVersion = null,
    Object? chapterId = freezed,
    Object? description = freezed,
  }) {
    return _then(_$SnapshotImpl(
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
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as SnapshotType,
      contentHash: null == contentHash
          ? _value.contentHash
          : contentHash // ignore: cast_nullable_to_non_nullable
              as String,
      contentSnapshot: null == contentSnapshot
          ? _value.contentSnapshot
          : contentSnapshot // ignore: cast_nullable_to_non_nullable
              as String,
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
      chapterId: freezed == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SnapshotImpl implements _Snapshot {
  const _$SnapshotImpl(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.type,
      required this.contentHash,
      required this.contentSnapshot,
      required this.createdAt,
      required this.updatedAt,
      this.schemaVersion = 1,
      this.chapterId,
      this.description});

  factory _$SnapshotImpl.fromJson(Map<String, dynamic> json) =>
      _$$SnapshotImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String name;
  @override
  final SnapshotType type;
  @override
  final String contentHash;
  @override
  final String contentSnapshot;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final int schemaVersion;
  @override
  final String? chapterId;
  @override
  final String? description;

  @override
  String toString() {
    return 'Snapshot(id: $id, projectId: $projectId, name: $name, type: $type, contentHash: $contentHash, contentSnapshot: $contentSnapshot, createdAt: $createdAt, updatedAt: $updatedAt, schemaVersion: $schemaVersion, chapterId: $chapterId, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SnapshotImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.contentHash, contentHash) ||
                other.contentHash == contentHash) &&
            (identical(other.contentSnapshot, contentSnapshot) ||
                other.contentSnapshot == contentSnapshot) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion) &&
            (identical(other.chapterId, chapterId) ||
                other.chapterId == chapterId) &&
            (identical(other.description, description) ||
                other.description == description));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      name,
      type,
      contentHash,
      contentSnapshot,
      createdAt,
      updatedAt,
      schemaVersion,
      chapterId,
      description);

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SnapshotImplCopyWith<_$SnapshotImpl> get copyWith =>
      __$$SnapshotImplCopyWithImpl<_$SnapshotImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SnapshotImplToJson(
      this,
    );
  }
}

abstract class _Snapshot implements Snapshot {
  const factory _Snapshot(
      {required final String id,
      required final String projectId,
      required final String name,
      required final SnapshotType type,
      required final String contentHash,
      required final String contentSnapshot,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final int schemaVersion,
      final String? chapterId,
      final String? description}) = _$SnapshotImpl;

  factory _Snapshot.fromJson(Map<String, dynamic> json) =
      _$SnapshotImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get name;
  @override
  SnapshotType get type;
  @override
  String get contentHash;
  @override
  String get contentSnapshot;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  int get schemaVersion;
  @override
  String? get chapterId;
  @override
  String? get description;

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SnapshotImplCopyWith<_$SnapshotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
