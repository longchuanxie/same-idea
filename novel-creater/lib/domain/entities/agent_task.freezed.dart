// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'agent_task.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AgentTask _$AgentTaskFromJson(Map<String, dynamic> json) {
  return _AgentTask.fromJson(json);
}

/// @nodoc
mixin _$AgentTask {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get taskType => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  AgentTaskStatus get status => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;
  String? get chapterId => throw _privateConstructorUsedError;
  String? get instruction => throw _privateConstructorUsedError;
  String? get result => throw _privateConstructorUsedError;
  String? get errorMessage => throw _privateConstructorUsedError;

  /// Serializes this AgentTask to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentTaskCopyWith<AgentTask> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentTaskCopyWith<$Res> {
  factory $AgentTaskCopyWith(AgentTask value, $Res Function(AgentTask) then) =
      _$AgentTaskCopyWithImpl<$Res, AgentTask>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String taskType,
      DateTime createdAt,
      DateTime updatedAt,
      AgentTaskStatus status,
      int schemaVersion,
      String? chapterId,
      String? instruction,
      String? result,
      String? errorMessage});
}

/// @nodoc
class _$AgentTaskCopyWithImpl<$Res, $Val extends AgentTask>
    implements $AgentTaskCopyWith<$Res> {
  _$AgentTaskCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? taskType = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? status = null,
    Object? schemaVersion = null,
    Object? chapterId = freezed,
    Object? instruction = freezed,
    Object? result = freezed,
    Object? errorMessage = freezed,
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
      taskType: null == taskType
          ? _value.taskType
          : taskType // ignore: cast_nullable_to_non_nullable
              as String,
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
              as AgentTaskStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
      chapterId: freezed == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      instruction: freezed == instruction
          ? _value.instruction
          : instruction // ignore: cast_nullable_to_non_nullable
              as String?,
      result: freezed == result
          ? _value.result
          : result // ignore: cast_nullable_to_non_nullable
              as String?,
      errorMessage: freezed == errorMessage
          ? _value.errorMessage
          : errorMessage // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentTaskImplCopyWith<$Res>
    implements $AgentTaskCopyWith<$Res> {
  factory _$$AgentTaskImplCopyWith(
          _$AgentTaskImpl value, $Res Function(_$AgentTaskImpl) then) =
      __$$AgentTaskImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String taskType,
      DateTime createdAt,
      DateTime updatedAt,
      AgentTaskStatus status,
      int schemaVersion,
      String? chapterId,
      String? instruction,
      String? result,
      String? errorMessage});
}

/// @nodoc
class __$$AgentTaskImplCopyWithImpl<$Res>
    extends _$AgentTaskCopyWithImpl<$Res, _$AgentTaskImpl>
    implements _$$AgentTaskImplCopyWith<$Res> {
  __$$AgentTaskImplCopyWithImpl(
      _$AgentTaskImpl _value, $Res Function(_$AgentTaskImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? taskType = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? status = null,
    Object? schemaVersion = null,
    Object? chapterId = freezed,
    Object? instruction = freezed,
    Object? result = freezed,
    Object? errorMessage = freezed,
  }) {
    return _then(_$AgentTaskImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      taskType: null == taskType
          ? _value.taskType
          : taskType // ignore: cast_nullable_to_non_nullable
              as String,
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
              as AgentTaskStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
      chapterId: freezed == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      instruction: freezed == instruction
          ? _value.instruction
          : instruction // ignore: cast_nullable_to_non_nullable
              as String?,
      result: freezed == result
          ? _value.result
          : result // ignore: cast_nullable_to_non_nullable
              as String?,
      errorMessage: freezed == errorMessage
          ? _value.errorMessage
          : errorMessage // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentTaskImpl extends _AgentTask {
  const _$AgentTaskImpl(
      {required this.id,
      required this.projectId,
      required this.taskType,
      required this.createdAt,
      required this.updatedAt,
      this.status = AgentTaskStatus.created,
      this.schemaVersion = 1,
      this.chapterId,
      this.instruction,
      this.result,
      this.errorMessage})
      : super._();

  factory _$AgentTaskImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentTaskImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String taskType;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final AgentTaskStatus status;
  @override
  @JsonKey()
  final int schemaVersion;
  @override
  final String? chapterId;
  @override
  final String? instruction;
  @override
  final String? result;
  @override
  final String? errorMessage;

  @override
  String toString() {
    return 'AgentTask(id: $id, projectId: $projectId, taskType: $taskType, createdAt: $createdAt, updatedAt: $updatedAt, status: $status, schemaVersion: $schemaVersion, chapterId: $chapterId, instruction: $instruction, result: $result, errorMessage: $errorMessage)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentTaskImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.taskType, taskType) ||
                other.taskType == taskType) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion) &&
            (identical(other.chapterId, chapterId) ||
                other.chapterId == chapterId) &&
            (identical(other.instruction, instruction) ||
                other.instruction == instruction) &&
            (identical(other.result, result) || other.result == result) &&
            (identical(other.errorMessage, errorMessage) ||
                other.errorMessage == errorMessage));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      taskType,
      createdAt,
      updatedAt,
      status,
      schemaVersion,
      chapterId,
      instruction,
      result,
      errorMessage);

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentTaskImplCopyWith<_$AgentTaskImpl> get copyWith =>
      __$$AgentTaskImplCopyWithImpl<_$AgentTaskImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentTaskImplToJson(
      this,
    );
  }
}

abstract class _AgentTask extends AgentTask {
  const factory _AgentTask(
      {required final String id,
      required final String projectId,
      required final String taskType,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final AgentTaskStatus status,
      final int schemaVersion,
      final String? chapterId,
      final String? instruction,
      final String? result,
      final String? errorMessage}) = _$AgentTaskImpl;
  const _AgentTask._() : super._();

  factory _AgentTask.fromJson(Map<String, dynamic> json) =
      _$AgentTaskImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get taskType;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  AgentTaskStatus get status;
  @override
  int get schemaVersion;
  @override
  String? get chapterId;
  @override
  String? get instruction;
  @override
  String? get result;
  @override
  String? get errorMessage;

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentTaskImplCopyWith<_$AgentTaskImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
