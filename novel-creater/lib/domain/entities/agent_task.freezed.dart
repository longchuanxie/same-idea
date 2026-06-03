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

TokenUsage _$TokenUsageFromJson(Map<String, dynamic> json) {
  return _TokenUsage.fromJson(json);
}

/// @nodoc
mixin _$TokenUsage {
  int get promptTokens => throw _privateConstructorUsedError;
  int get completionTokens => throw _privateConstructorUsedError;
  bool get isEstimated => throw _privateConstructorUsedError;

  /// Serializes this TokenUsage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TokenUsage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TokenUsageCopyWith<TokenUsage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TokenUsageCopyWith<$Res> {
  factory $TokenUsageCopyWith(
          TokenUsage value, $Res Function(TokenUsage) then) =
      _$TokenUsageCopyWithImpl<$Res, TokenUsage>;
  @useResult
  $Res call({int promptTokens, int completionTokens, bool isEstimated});
}

/// @nodoc
class _$TokenUsageCopyWithImpl<$Res, $Val extends TokenUsage>
    implements $TokenUsageCopyWith<$Res> {
  _$TokenUsageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TokenUsage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? promptTokens = null,
    Object? completionTokens = null,
    Object? isEstimated = null,
  }) {
    return _then(_value.copyWith(
      promptTokens: null == promptTokens
          ? _value.promptTokens
          : promptTokens // ignore: cast_nullable_to_non_nullable
              as int,
      completionTokens: null == completionTokens
          ? _value.completionTokens
          : completionTokens // ignore: cast_nullable_to_non_nullable
              as int,
      isEstimated: null == isEstimated
          ? _value.isEstimated
          : isEstimated // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TokenUsageImplCopyWith<$Res>
    implements $TokenUsageCopyWith<$Res> {
  factory _$$TokenUsageImplCopyWith(
          _$TokenUsageImpl value, $Res Function(_$TokenUsageImpl) then) =
      __$$TokenUsageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int promptTokens, int completionTokens, bool isEstimated});
}

/// @nodoc
class __$$TokenUsageImplCopyWithImpl<$Res>
    extends _$TokenUsageCopyWithImpl<$Res, _$TokenUsageImpl>
    implements _$$TokenUsageImplCopyWith<$Res> {
  __$$TokenUsageImplCopyWithImpl(
      _$TokenUsageImpl _value, $Res Function(_$TokenUsageImpl) _then)
      : super(_value, _then);

  /// Create a copy of TokenUsage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? promptTokens = null,
    Object? completionTokens = null,
    Object? isEstimated = null,
  }) {
    return _then(_$TokenUsageImpl(
      promptTokens: null == promptTokens
          ? _value.promptTokens
          : promptTokens // ignore: cast_nullable_to_non_nullable
              as int,
      completionTokens: null == completionTokens
          ? _value.completionTokens
          : completionTokens // ignore: cast_nullable_to_non_nullable
              as int,
      isEstimated: null == isEstimated
          ? _value.isEstimated
          : isEstimated // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TokenUsageImpl implements _TokenUsage {
  const _$TokenUsageImpl(
      {this.promptTokens = 0,
      this.completionTokens = 0,
      this.isEstimated = false});

  factory _$TokenUsageImpl.fromJson(Map<String, dynamic> json) =>
      _$$TokenUsageImplFromJson(json);

  @override
  @JsonKey()
  final int promptTokens;
  @override
  @JsonKey()
  final int completionTokens;
  @override
  @JsonKey()
  final bool isEstimated;

  @override
  String toString() {
    return 'TokenUsage(promptTokens: $promptTokens, completionTokens: $completionTokens, isEstimated: $isEstimated)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TokenUsageImpl &&
            (identical(other.promptTokens, promptTokens) ||
                other.promptTokens == promptTokens) &&
            (identical(other.completionTokens, completionTokens) ||
                other.completionTokens == completionTokens) &&
            (identical(other.isEstimated, isEstimated) ||
                other.isEstimated == isEstimated));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, promptTokens, completionTokens, isEstimated);

  /// Create a copy of TokenUsage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TokenUsageImplCopyWith<_$TokenUsageImpl> get copyWith =>
      __$$TokenUsageImplCopyWithImpl<_$TokenUsageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TokenUsageImplToJson(
      this,
    );
  }
}

abstract class _TokenUsage implements TokenUsage {
  const factory _TokenUsage(
      {final int promptTokens,
      final int completionTokens,
      final bool isEstimated}) = _$TokenUsageImpl;

  factory _TokenUsage.fromJson(Map<String, dynamic> json) =
      _$TokenUsageImpl.fromJson;

  @override
  int get promptTokens;
  @override
  int get completionTokens;
  @override
  bool get isEstimated;

  /// Create a copy of TokenUsage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TokenUsageImplCopyWith<_$TokenUsageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgentTask _$AgentTaskFromJson(Map<String, dynamic> json) {
  return _AgentTask.fromJson(json);
}

/// @nodoc
mixin _$AgentTask {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  AgentTaskType get taskType => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  AgentTaskStatus get status => throw _privateConstructorUsedError;
  String get inputJson => throw _privateConstructorUsedError;
  String get outputJson => throw _privateConstructorUsedError;
  String? get model => throw _privateConstructorUsedError;
  TokenUsage? get tokenUsage => throw _privateConstructorUsedError;
  String? get error => throw _privateConstructorUsedError;
  List<String> get sideEffects => throw _privateConstructorUsedError;
  DateTime? get startedAt => throw _privateConstructorUsedError;
  DateTime? get completedAt => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

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
      AgentTaskType taskType,
      DateTime createdAt,
      DateTime updatedAt,
      AgentTaskStatus status,
      String inputJson,
      String outputJson,
      String? model,
      TokenUsage? tokenUsage,
      String? error,
      List<String> sideEffects,
      DateTime? startedAt,
      DateTime? completedAt,
      int schemaVersion});

  $TokenUsageCopyWith<$Res>? get tokenUsage;
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
    Object? inputJson = null,
    Object? outputJson = null,
    Object? model = freezed,
    Object? tokenUsage = freezed,
    Object? error = freezed,
    Object? sideEffects = null,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
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
      taskType: null == taskType
          ? _value.taskType
          : taskType // ignore: cast_nullable_to_non_nullable
              as AgentTaskType,
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
      inputJson: null == inputJson
          ? _value.inputJson
          : inputJson // ignore: cast_nullable_to_non_nullable
              as String,
      outputJson: null == outputJson
          ? _value.outputJson
          : outputJson // ignore: cast_nullable_to_non_nullable
              as String,
      model: freezed == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String?,
      tokenUsage: freezed == tokenUsage
          ? _value.tokenUsage
          : tokenUsage // ignore: cast_nullable_to_non_nullable
              as TokenUsage?,
      error: freezed == error
          ? _value.error
          : error // ignore: cast_nullable_to_non_nullable
              as String?,
      sideEffects: null == sideEffects
          ? _value.sideEffects
          : sideEffects // ignore: cast_nullable_to_non_nullable
              as List<String>,
      startedAt: freezed == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TokenUsageCopyWith<$Res>? get tokenUsage {
    if (_value.tokenUsage == null) {
      return null;
    }

    return $TokenUsageCopyWith<$Res>(_value.tokenUsage!, (value) {
      return _then(_value.copyWith(tokenUsage: value) as $Val);
    });
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
      AgentTaskType taskType,
      DateTime createdAt,
      DateTime updatedAt,
      AgentTaskStatus status,
      String inputJson,
      String outputJson,
      String? model,
      TokenUsage? tokenUsage,
      String? error,
      List<String> sideEffects,
      DateTime? startedAt,
      DateTime? completedAt,
      int schemaVersion});

  @override
  $TokenUsageCopyWith<$Res>? get tokenUsage;
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
    Object? inputJson = null,
    Object? outputJson = null,
    Object? model = freezed,
    Object? tokenUsage = freezed,
    Object? error = freezed,
    Object? sideEffects = null,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? schemaVersion = null,
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
              as AgentTaskType,
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
      inputJson: null == inputJson
          ? _value.inputJson
          : inputJson // ignore: cast_nullable_to_non_nullable
              as String,
      outputJson: null == outputJson
          ? _value.outputJson
          : outputJson // ignore: cast_nullable_to_non_nullable
              as String,
      model: freezed == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String?,
      tokenUsage: freezed == tokenUsage
          ? _value.tokenUsage
          : tokenUsage // ignore: cast_nullable_to_non_nullable
              as TokenUsage?,
      error: freezed == error
          ? _value.error
          : error // ignore: cast_nullable_to_non_nullable
              as String?,
      sideEffects: null == sideEffects
          ? _value._sideEffects
          : sideEffects // ignore: cast_nullable_to_non_nullable
              as List<String>,
      startedAt: freezed == startedAt
          ? _value.startedAt
          : startedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      completedAt: freezed == completedAt
          ? _value.completedAt
          : completedAt // ignore: cast_nullable_to_non_nullable
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
class _$AgentTaskImpl extends _AgentTask {
  const _$AgentTaskImpl(
      {required this.id,
      required this.projectId,
      required this.taskType,
      required this.createdAt,
      required this.updatedAt,
      this.status = AgentTaskStatus.created,
      this.inputJson = '',
      this.outputJson = '',
      this.model,
      this.tokenUsage,
      this.error,
      final List<String> sideEffects = const [],
      this.startedAt,
      this.completedAt,
      this.schemaVersion = 1})
      : _sideEffects = sideEffects,
        super._();

  factory _$AgentTaskImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentTaskImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final AgentTaskType taskType;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final AgentTaskStatus status;
  @override
  @JsonKey()
  final String inputJson;
  @override
  @JsonKey()
  final String outputJson;
  @override
  final String? model;
  @override
  final TokenUsage? tokenUsage;
  @override
  final String? error;
  final List<String> _sideEffects;
  @override
  @JsonKey()
  List<String> get sideEffects {
    if (_sideEffects is EqualUnmodifiableListView) return _sideEffects;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_sideEffects);
  }

  @override
  final DateTime? startedAt;
  @override
  final DateTime? completedAt;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'AgentTask(id: $id, projectId: $projectId, taskType: $taskType, createdAt: $createdAt, updatedAt: $updatedAt, status: $status, inputJson: $inputJson, outputJson: $outputJson, model: $model, tokenUsage: $tokenUsage, error: $error, sideEffects: $sideEffects, startedAt: $startedAt, completedAt: $completedAt, schemaVersion: $schemaVersion)';
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
            (identical(other.inputJson, inputJson) ||
                other.inputJson == inputJson) &&
            (identical(other.outputJson, outputJson) ||
                other.outputJson == outputJson) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.tokenUsage, tokenUsage) ||
                other.tokenUsage == tokenUsage) &&
            (identical(other.error, error) || other.error == error) &&
            const DeepCollectionEquality()
                .equals(other._sideEffects, _sideEffects) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
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
      inputJson,
      outputJson,
      model,
      tokenUsage,
      error,
      const DeepCollectionEquality().hash(_sideEffects),
      startedAt,
      completedAt,
      schemaVersion);

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
      required final AgentTaskType taskType,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final AgentTaskStatus status,
      final String inputJson,
      final String outputJson,
      final String? model,
      final TokenUsage? tokenUsage,
      final String? error,
      final List<String> sideEffects,
      final DateTime? startedAt,
      final DateTime? completedAt,
      final int schemaVersion}) = _$AgentTaskImpl;
  const _AgentTask._() : super._();

  factory _AgentTask.fromJson(Map<String, dynamic> json) =
      _$AgentTaskImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  AgentTaskType get taskType;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  AgentTaskStatus get status;
  @override
  String get inputJson;
  @override
  String get outputJson;
  @override
  String? get model;
  @override
  TokenUsage? get tokenUsage;
  @override
  String? get error;
  @override
  List<String> get sideEffects;
  @override
  DateTime? get startedAt;
  @override
  DateTime? get completedAt;
  @override
  int get schemaVersion;

  /// Create a copy of AgentTask
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentTaskImplCopyWith<_$AgentTaskImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
