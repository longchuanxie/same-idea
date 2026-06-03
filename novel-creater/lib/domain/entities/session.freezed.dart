// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'session.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

SessionMessage _$SessionMessageFromJson(Map<String, dynamic> json) {
  return _SessionMessage.fromJson(json);
}

/// @nodoc
mixin _$SessionMessage {
  String get id => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  String? get agentTaskId => throw _privateConstructorUsedError;

  /// Serializes this SessionMessage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SessionMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SessionMessageCopyWith<SessionMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SessionMessageCopyWith<$Res> {
  factory $SessionMessageCopyWith(
          SessionMessage value, $Res Function(SessionMessage) then) =
      _$SessionMessageCopyWithImpl<$Res, SessionMessage>;
  @useResult
  $Res call(
      {String id,
      String role,
      String content,
      DateTime? createdAt,
      String? agentTaskId});
}

/// @nodoc
class _$SessionMessageCopyWithImpl<$Res, $Val extends SessionMessage>
    implements $SessionMessageCopyWith<$Res> {
  _$SessionMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SessionMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? role = null,
    Object? content = null,
    Object? createdAt = freezed,
    Object? agentTaskId = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      agentTaskId: freezed == agentTaskId
          ? _value.agentTaskId
          : agentTaskId // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SessionMessageImplCopyWith<$Res>
    implements $SessionMessageCopyWith<$Res> {
  factory _$$SessionMessageImplCopyWith(_$SessionMessageImpl value,
          $Res Function(_$SessionMessageImpl) then) =
      __$$SessionMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String role,
      String content,
      DateTime? createdAt,
      String? agentTaskId});
}

/// @nodoc
class __$$SessionMessageImplCopyWithImpl<$Res>
    extends _$SessionMessageCopyWithImpl<$Res, _$SessionMessageImpl>
    implements _$$SessionMessageImplCopyWith<$Res> {
  __$$SessionMessageImplCopyWithImpl(
      _$SessionMessageImpl _value, $Res Function(_$SessionMessageImpl) _then)
      : super(_value, _then);

  /// Create a copy of SessionMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? role = null,
    Object? content = null,
    Object? createdAt = freezed,
    Object? agentTaskId = freezed,
  }) {
    return _then(_$SessionMessageImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      agentTaskId: freezed == agentTaskId
          ? _value.agentTaskId
          : agentTaskId // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SessionMessageImpl implements _SessionMessage {
  const _$SessionMessageImpl(
      {required this.id,
      required this.role,
      required this.content,
      this.createdAt,
      this.agentTaskId});

  factory _$SessionMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$SessionMessageImplFromJson(json);

  @override
  final String id;
  @override
  final String role;
  @override
  final String content;
  @override
  final DateTime? createdAt;
  @override
  final String? agentTaskId;

  @override
  String toString() {
    return 'SessionMessage(id: $id, role: $role, content: $content, createdAt: $createdAt, agentTaskId: $agentTaskId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SessionMessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.agentTaskId, agentTaskId) ||
                other.agentTaskId == agentTaskId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, role, content, createdAt, agentTaskId);

  /// Create a copy of SessionMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SessionMessageImplCopyWith<_$SessionMessageImpl> get copyWith =>
      __$$SessionMessageImplCopyWithImpl<_$SessionMessageImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SessionMessageImplToJson(
      this,
    );
  }
}

abstract class _SessionMessage implements SessionMessage {
  const factory _SessionMessage(
      {required final String id,
      required final String role,
      required final String content,
      final DateTime? createdAt,
      final String? agentTaskId}) = _$SessionMessageImpl;

  factory _SessionMessage.fromJson(Map<String, dynamic> json) =
      _$SessionMessageImpl.fromJson;

  @override
  String get id;
  @override
  String get role;
  @override
  String get content;
  @override
  DateTime? get createdAt;
  @override
  String? get agentTaskId;

  /// Create a copy of SessionMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SessionMessageImplCopyWith<_$SessionMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Session _$SessionFromJson(Map<String, dynamic> json) {
  return _Session.fromJson(json);
}

/// @nodoc
mixin _$Session {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  SessionStage get stage => throw _privateConstructorUsedError;
  String? get parentSessionId => throw _privateConstructorUsedError;
  String? get branchName => throw _privateConstructorUsedError;
  List<SessionMessage> get messages => throw _privateConstructorUsedError;
  String? get contextSnapshotId => throw _privateConstructorUsedError;
  bool get archived => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this Session to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Session
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SessionCopyWith<Session> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SessionCopyWith<$Res> {
  factory $SessionCopyWith(Session value, $Res Function(Session) then) =
      _$SessionCopyWithImpl<$Res, Session>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String title,
      DateTime createdAt,
      DateTime updatedAt,
      SessionStage stage,
      String? parentSessionId,
      String? branchName,
      List<SessionMessage> messages,
      String? contextSnapshotId,
      bool archived,
      int schemaVersion});
}

/// @nodoc
class _$SessionCopyWithImpl<$Res, $Val extends Session>
    implements $SessionCopyWith<$Res> {
  _$SessionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Session
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? title = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? stage = null,
    Object? parentSessionId = freezed,
    Object? branchName = freezed,
    Object? messages = null,
    Object? contextSnapshotId = freezed,
    Object? archived = null,
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
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      stage: null == stage
          ? _value.stage
          : stage // ignore: cast_nullable_to_non_nullable
              as SessionStage,
      parentSessionId: freezed == parentSessionId
          ? _value.parentSessionId
          : parentSessionId // ignore: cast_nullable_to_non_nullable
              as String?,
      branchName: freezed == branchName
          ? _value.branchName
          : branchName // ignore: cast_nullable_to_non_nullable
              as String?,
      messages: null == messages
          ? _value.messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<SessionMessage>,
      contextSnapshotId: freezed == contextSnapshotId
          ? _value.contextSnapshotId
          : contextSnapshotId // ignore: cast_nullable_to_non_nullable
              as String?,
      archived: null == archived
          ? _value.archived
          : archived // ignore: cast_nullable_to_non_nullable
              as bool,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SessionImplCopyWith<$Res> implements $SessionCopyWith<$Res> {
  factory _$$SessionImplCopyWith(
          _$SessionImpl value, $Res Function(_$SessionImpl) then) =
      __$$SessionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String title,
      DateTime createdAt,
      DateTime updatedAt,
      SessionStage stage,
      String? parentSessionId,
      String? branchName,
      List<SessionMessage> messages,
      String? contextSnapshotId,
      bool archived,
      int schemaVersion});
}

/// @nodoc
class __$$SessionImplCopyWithImpl<$Res>
    extends _$SessionCopyWithImpl<$Res, _$SessionImpl>
    implements _$$SessionImplCopyWith<$Res> {
  __$$SessionImplCopyWithImpl(
      _$SessionImpl _value, $Res Function(_$SessionImpl) _then)
      : super(_value, _then);

  /// Create a copy of Session
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? title = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? stage = null,
    Object? parentSessionId = freezed,
    Object? branchName = freezed,
    Object? messages = null,
    Object? contextSnapshotId = freezed,
    Object? archived = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$SessionImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      stage: null == stage
          ? _value.stage
          : stage // ignore: cast_nullable_to_non_nullable
              as SessionStage,
      parentSessionId: freezed == parentSessionId
          ? _value.parentSessionId
          : parentSessionId // ignore: cast_nullable_to_non_nullable
              as String?,
      branchName: freezed == branchName
          ? _value.branchName
          : branchName // ignore: cast_nullable_to_non_nullable
              as String?,
      messages: null == messages
          ? _value._messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<SessionMessage>,
      contextSnapshotId: freezed == contextSnapshotId
          ? _value.contextSnapshotId
          : contextSnapshotId // ignore: cast_nullable_to_non_nullable
              as String?,
      archived: null == archived
          ? _value.archived
          : archived // ignore: cast_nullable_to_non_nullable
              as bool,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SessionImpl implements _Session {
  const _$SessionImpl(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.createdAt,
      required this.updatedAt,
      this.stage = SessionStage.writing,
      this.parentSessionId,
      this.branchName,
      final List<SessionMessage> messages = const [],
      this.contextSnapshotId,
      this.archived = false,
      this.schemaVersion = 1})
      : _messages = messages;

  factory _$SessionImpl.fromJson(Map<String, dynamic> json) =>
      _$$SessionImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String title;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final SessionStage stage;
  @override
  final String? parentSessionId;
  @override
  final String? branchName;
  final List<SessionMessage> _messages;
  @override
  @JsonKey()
  List<SessionMessage> get messages {
    if (_messages is EqualUnmodifiableListView) return _messages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_messages);
  }

  @override
  final String? contextSnapshotId;
  @override
  @JsonKey()
  final bool archived;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Session(id: $id, projectId: $projectId, title: $title, createdAt: $createdAt, updatedAt: $updatedAt, stage: $stage, parentSessionId: $parentSessionId, branchName: $branchName, messages: $messages, contextSnapshotId: $contextSnapshotId, archived: $archived, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SessionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.stage, stage) || other.stage == stage) &&
            (identical(other.parentSessionId, parentSessionId) ||
                other.parentSessionId == parentSessionId) &&
            (identical(other.branchName, branchName) ||
                other.branchName == branchName) &&
            const DeepCollectionEquality().equals(other._messages, _messages) &&
            (identical(other.contextSnapshotId, contextSnapshotId) ||
                other.contextSnapshotId == contextSnapshotId) &&
            (identical(other.archived, archived) ||
                other.archived == archived) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      title,
      createdAt,
      updatedAt,
      stage,
      parentSessionId,
      branchName,
      const DeepCollectionEquality().hash(_messages),
      contextSnapshotId,
      archived,
      schemaVersion);

  /// Create a copy of Session
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SessionImplCopyWith<_$SessionImpl> get copyWith =>
      __$$SessionImplCopyWithImpl<_$SessionImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SessionImplToJson(
      this,
    );
  }
}

abstract class _Session implements Session {
  const factory _Session(
      {required final String id,
      required final String projectId,
      required final String title,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final SessionStage stage,
      final String? parentSessionId,
      final String? branchName,
      final List<SessionMessage> messages,
      final String? contextSnapshotId,
      final bool archived,
      final int schemaVersion}) = _$SessionImpl;

  factory _Session.fromJson(Map<String, dynamic> json) = _$SessionImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get title;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  SessionStage get stage;
  @override
  String? get parentSessionId;
  @override
  String? get branchName;
  @override
  List<SessionMessage> get messages;
  @override
  String? get contextSnapshotId;
  @override
  bool get archived;
  @override
  int get schemaVersion;

  /// Create a copy of Session
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SessionImplCopyWith<_$SessionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
