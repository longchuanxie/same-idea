// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'timeline_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

TimelineEvent _$TimelineEventFromJson(Map<String, dynamic> json) {
  return _TimelineEvent.fromJson(json);
}

/// @nodoc
mixin _$TimelineEvent {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get characterId => throw _privateConstructorUsedError;
  String get chapterId => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  int get chapterOrder => throw _privateConstructorUsedError;
  String get eventType => throw _privateConstructorUsedError;
  List<String> get relatedCharacterIds => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this TimelineEvent to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TimelineEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TimelineEventCopyWith<TimelineEvent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TimelineEventCopyWith<$Res> {
  factory $TimelineEventCopyWith(
          TimelineEvent value, $Res Function(TimelineEvent) then) =
      _$TimelineEventCopyWithImpl<$Res, TimelineEvent>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String characterId,
      String chapterId,
      String description,
      int chapterOrder,
      String eventType,
      List<String> relatedCharacterIds,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion});
}

/// @nodoc
class _$TimelineEventCopyWithImpl<$Res, $Val extends TimelineEvent>
    implements $TimelineEventCopyWith<$Res> {
  _$TimelineEventCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TimelineEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? characterId = null,
    Object? chapterId = null,
    Object? description = null,
    Object? chapterOrder = null,
    Object? eventType = null,
    Object? relatedCharacterIds = null,
    Object? createdAt = null,
    Object? updatedAt = null,
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
      characterId: null == characterId
          ? _value.characterId
          : characterId // ignore: cast_nullable_to_non_nullable
              as String,
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      chapterOrder: null == chapterOrder
          ? _value.chapterOrder
          : chapterOrder // ignore: cast_nullable_to_non_nullable
              as int,
      eventType: null == eventType
          ? _value.eventType
          : eventType // ignore: cast_nullable_to_non_nullable
              as String,
      relatedCharacterIds: null == relatedCharacterIds
          ? _value.relatedCharacterIds
          : relatedCharacterIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
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
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TimelineEventImplCopyWith<$Res>
    implements $TimelineEventCopyWith<$Res> {
  factory _$$TimelineEventImplCopyWith(
          _$TimelineEventImpl value, $Res Function(_$TimelineEventImpl) then) =
      __$$TimelineEventImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String characterId,
      String chapterId,
      String description,
      int chapterOrder,
      String eventType,
      List<String> relatedCharacterIds,
      DateTime createdAt,
      DateTime updatedAt,
      int schemaVersion});
}

/// @nodoc
class __$$TimelineEventImplCopyWithImpl<$Res>
    extends _$TimelineEventCopyWithImpl<$Res, _$TimelineEventImpl>
    implements _$$TimelineEventImplCopyWith<$Res> {
  __$$TimelineEventImplCopyWithImpl(
      _$TimelineEventImpl _value, $Res Function(_$TimelineEventImpl) _then)
      : super(_value, _then);

  /// Create a copy of TimelineEvent
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? characterId = null,
    Object? chapterId = null,
    Object? description = null,
    Object? chapterOrder = null,
    Object? eventType = null,
    Object? relatedCharacterIds = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$TimelineEventImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      characterId: null == characterId
          ? _value.characterId
          : characterId // ignore: cast_nullable_to_non_nullable
              as String,
      chapterId: null == chapterId
          ? _value.chapterId
          : chapterId // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      chapterOrder: null == chapterOrder
          ? _value.chapterOrder
          : chapterOrder // ignore: cast_nullable_to_non_nullable
              as int,
      eventType: null == eventType
          ? _value.eventType
          : eventType // ignore: cast_nullable_to_non_nullable
              as String,
      relatedCharacterIds: null == relatedCharacterIds
          ? _value._relatedCharacterIds
          : relatedCharacterIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
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
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TimelineEventImpl extends _TimelineEvent {
  const _$TimelineEventImpl(
      {required this.id,
      required this.projectId,
      required this.characterId,
      required this.chapterId,
      required this.description,
      this.chapterOrder = 0,
      this.eventType = '',
      final List<String> relatedCharacterIds = const [],
      required this.createdAt,
      required this.updatedAt,
      this.schemaVersion = 1})
      : _relatedCharacterIds = relatedCharacterIds,
        super._();

  factory _$TimelineEventImpl.fromJson(Map<String, dynamic> json) =>
      _$$TimelineEventImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String characterId;
  @override
  final String chapterId;
  @override
  final String description;
  @override
  @JsonKey()
  final int chapterOrder;
  @override
  @JsonKey()
  final String eventType;
  final List<String> _relatedCharacterIds;
  @override
  @JsonKey()
  List<String> get relatedCharacterIds {
    if (_relatedCharacterIds is EqualUnmodifiableListView)
      return _relatedCharacterIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_relatedCharacterIds);
  }

  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'TimelineEvent(id: $id, projectId: $projectId, characterId: $characterId, chapterId: $chapterId, description: $description, chapterOrder: $chapterOrder, eventType: $eventType, relatedCharacterIds: $relatedCharacterIds, createdAt: $createdAt, updatedAt: $updatedAt, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TimelineEventImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.characterId, characterId) ||
                other.characterId == characterId) &&
            (identical(other.chapterId, chapterId) ||
                other.chapterId == chapterId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.chapterOrder, chapterOrder) ||
                other.chapterOrder == chapterOrder) &&
            (identical(other.eventType, eventType) ||
                other.eventType == eventType) &&
            const DeepCollectionEquality()
                .equals(other._relatedCharacterIds, _relatedCharacterIds) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      characterId,
      chapterId,
      description,
      chapterOrder,
      eventType,
      const DeepCollectionEquality().hash(_relatedCharacterIds),
      createdAt,
      updatedAt,
      schemaVersion);

  /// Create a copy of TimelineEvent
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TimelineEventImplCopyWith<_$TimelineEventImpl> get copyWith =>
      __$$TimelineEventImplCopyWithImpl<_$TimelineEventImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TimelineEventImplToJson(
      this,
    );
  }
}

abstract class _TimelineEvent extends TimelineEvent {
  const factory _TimelineEvent(
      {required final String id,
      required final String projectId,
      required final String characterId,
      required final String chapterId,
      required final String description,
      final int chapterOrder,
      final String eventType,
      final List<String> relatedCharacterIds,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final int schemaVersion}) = _$TimelineEventImpl;
  const _TimelineEvent._() : super._();

  factory _TimelineEvent.fromJson(Map<String, dynamic> json) =
      _$TimelineEventImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get characterId;
  @override
  String get chapterId;
  @override
  String get description;
  @override
  int get chapterOrder;
  @override
  String get eventType;
  @override
  List<String> get relatedCharacterIds;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  int get schemaVersion;

  /// Create a copy of TimelineEvent
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TimelineEventImplCopyWith<_$TimelineEventImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
