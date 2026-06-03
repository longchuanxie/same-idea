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
  String get description => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  SnapshotTrigger get trigger => throw _privateConstructorUsedError;
  String get dataSnapshot => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

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
      String description,
      DateTime createdAt,
      SnapshotTrigger trigger,
      String dataSnapshot,
      int schemaVersion});
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
    Object? description = null,
    Object? createdAt = null,
    Object? trigger = null,
    Object? dataSnapshot = null,
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
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      trigger: null == trigger
          ? _value.trigger
          : trigger // ignore: cast_nullable_to_non_nullable
              as SnapshotTrigger,
      dataSnapshot: null == dataSnapshot
          ? _value.dataSnapshot
          : dataSnapshot // ignore: cast_nullable_to_non_nullable
              as String,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
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
      String description,
      DateTime createdAt,
      SnapshotTrigger trigger,
      String dataSnapshot,
      int schemaVersion});
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
    Object? description = null,
    Object? createdAt = null,
    Object? trigger = null,
    Object? dataSnapshot = null,
    Object? schemaVersion = null,
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
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      trigger: null == trigger
          ? _value.trigger
          : trigger // ignore: cast_nullable_to_non_nullable
              as SnapshotTrigger,
      dataSnapshot: null == dataSnapshot
          ? _value.dataSnapshot
          : dataSnapshot // ignore: cast_nullable_to_non_nullable
              as String,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SnapshotImpl implements _Snapshot {
  const _$SnapshotImpl(
      {required this.id,
      required this.projectId,
      required this.description,
      required this.createdAt,
      this.trigger = SnapshotTrigger.manual,
      this.dataSnapshot = '',
      this.schemaVersion = 1});

  factory _$SnapshotImpl.fromJson(Map<String, dynamic> json) =>
      _$$SnapshotImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String description;
  @override
  final DateTime createdAt;
  @override
  @JsonKey()
  final SnapshotTrigger trigger;
  @override
  @JsonKey()
  final String dataSnapshot;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Snapshot(id: $id, projectId: $projectId, description: $description, createdAt: $createdAt, trigger: $trigger, dataSnapshot: $dataSnapshot, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SnapshotImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.trigger, trigger) || other.trigger == trigger) &&
            (identical(other.dataSnapshot, dataSnapshot) ||
                other.dataSnapshot == dataSnapshot) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, projectId, description,
      createdAt, trigger, dataSnapshot, schemaVersion);

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
      required final String description,
      required final DateTime createdAt,
      final SnapshotTrigger trigger,
      final String dataSnapshot,
      final int schemaVersion}) = _$SnapshotImpl;

  factory _Snapshot.fromJson(Map<String, dynamic> json) =
      _$SnapshotImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get description;
  @override
  DateTime get createdAt;
  @override
  SnapshotTrigger get trigger;
  @override
  String get dataSnapshot;
  @override
  int get schemaVersion;

  /// Create a copy of Snapshot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SnapshotImplCopyWith<_$SnapshotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
