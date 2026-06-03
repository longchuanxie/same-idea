// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'outline_node.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

OutlineNode _$OutlineNodeFromJson(Map<String, dynamic> json) {
  return _OutlineNode.fromJson(json);
}

/// @nodoc
mixin _$OutlineNode {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  int get order => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String? get parentId => throw _privateConstructorUsedError;
  OutlineNodeType get nodeType => throw _privateConstructorUsedError;
  String get summary => throw _privateConstructorUsedError;
  String? get linkedChapterId => throw _privateConstructorUsedError;
  OutlineNodeStatus get status => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this OutlineNode to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OutlineNode
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OutlineNodeCopyWith<OutlineNode> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OutlineNodeCopyWith<$Res> {
  factory $OutlineNodeCopyWith(
          OutlineNode value, $Res Function(OutlineNode) then) =
      _$OutlineNodeCopyWithImpl<$Res, OutlineNode>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      int order,
      String title,
      DateTime createdAt,
      DateTime updatedAt,
      String? parentId,
      OutlineNodeType nodeType,
      String summary,
      String? linkedChapterId,
      OutlineNodeStatus status,
      int schemaVersion});
}

/// @nodoc
class _$OutlineNodeCopyWithImpl<$Res, $Val extends OutlineNode>
    implements $OutlineNodeCopyWith<$Res> {
  _$OutlineNodeCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OutlineNode
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? order = null,
    Object? title = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? parentId = freezed,
    Object? nodeType = null,
    Object? summary = null,
    Object? linkedChapterId = freezed,
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
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
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
      parentId: freezed == parentId
          ? _value.parentId
          : parentId // ignore: cast_nullable_to_non_nullable
              as String?,
      nodeType: null == nodeType
          ? _value.nodeType
          : nodeType // ignore: cast_nullable_to_non_nullable
              as OutlineNodeType,
      summary: null == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String,
      linkedChapterId: freezed == linkedChapterId
          ? _value.linkedChapterId
          : linkedChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as OutlineNodeStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$OutlineNodeImplCopyWith<$Res>
    implements $OutlineNodeCopyWith<$Res> {
  factory _$$OutlineNodeImplCopyWith(
          _$OutlineNodeImpl value, $Res Function(_$OutlineNodeImpl) then) =
      __$$OutlineNodeImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      int order,
      String title,
      DateTime createdAt,
      DateTime updatedAt,
      String? parentId,
      OutlineNodeType nodeType,
      String summary,
      String? linkedChapterId,
      OutlineNodeStatus status,
      int schemaVersion});
}

/// @nodoc
class __$$OutlineNodeImplCopyWithImpl<$Res>
    extends _$OutlineNodeCopyWithImpl<$Res, _$OutlineNodeImpl>
    implements _$$OutlineNodeImplCopyWith<$Res> {
  __$$OutlineNodeImplCopyWithImpl(
      _$OutlineNodeImpl _value, $Res Function(_$OutlineNodeImpl) _then)
      : super(_value, _then);

  /// Create a copy of OutlineNode
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? order = null,
    Object? title = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? parentId = freezed,
    Object? nodeType = null,
    Object? summary = null,
    Object? linkedChapterId = freezed,
    Object? status = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$OutlineNodeImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
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
      parentId: freezed == parentId
          ? _value.parentId
          : parentId // ignore: cast_nullable_to_non_nullable
              as String?,
      nodeType: null == nodeType
          ? _value.nodeType
          : nodeType // ignore: cast_nullable_to_non_nullable
              as OutlineNodeType,
      summary: null == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String,
      linkedChapterId: freezed == linkedChapterId
          ? _value.linkedChapterId
          : linkedChapterId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as OutlineNodeStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$OutlineNodeImpl implements _OutlineNode {
  const _$OutlineNodeImpl(
      {required this.id,
      required this.projectId,
      required this.order,
      required this.title,
      required this.createdAt,
      required this.updatedAt,
      this.parentId,
      this.nodeType = OutlineNodeType.chapter,
      this.summary = '',
      this.linkedChapterId,
      this.status = OutlineNodeStatus.planned,
      this.schemaVersion = 1});

  factory _$OutlineNodeImpl.fromJson(Map<String, dynamic> json) =>
      _$$OutlineNodeImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final int order;
  @override
  final String title;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? parentId;
  @override
  @JsonKey()
  final OutlineNodeType nodeType;
  @override
  @JsonKey()
  final String summary;
  @override
  final String? linkedChapterId;
  @override
  @JsonKey()
  final OutlineNodeStatus status;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'OutlineNode(id: $id, projectId: $projectId, order: $order, title: $title, createdAt: $createdAt, updatedAt: $updatedAt, parentId: $parentId, nodeType: $nodeType, summary: $summary, linkedChapterId: $linkedChapterId, status: $status, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OutlineNodeImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.order, order) || other.order == order) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.parentId, parentId) ||
                other.parentId == parentId) &&
            (identical(other.nodeType, nodeType) ||
                other.nodeType == nodeType) &&
            (identical(other.summary, summary) || other.summary == summary) &&
            (identical(other.linkedChapterId, linkedChapterId) ||
                other.linkedChapterId == linkedChapterId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      order,
      title,
      createdAt,
      updatedAt,
      parentId,
      nodeType,
      summary,
      linkedChapterId,
      status,
      schemaVersion);

  /// Create a copy of OutlineNode
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OutlineNodeImplCopyWith<_$OutlineNodeImpl> get copyWith =>
      __$$OutlineNodeImplCopyWithImpl<_$OutlineNodeImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OutlineNodeImplToJson(
      this,
    );
  }
}

abstract class _OutlineNode implements OutlineNode {
  const factory _OutlineNode(
      {required final String id,
      required final String projectId,
      required final int order,
      required final String title,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final String? parentId,
      final OutlineNodeType nodeType,
      final String summary,
      final String? linkedChapterId,
      final OutlineNodeStatus status,
      final int schemaVersion}) = _$OutlineNodeImpl;

  factory _OutlineNode.fromJson(Map<String, dynamic> json) =
      _$OutlineNodeImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  int get order;
  @override
  String get title;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  String? get parentId;
  @override
  OutlineNodeType get nodeType;
  @override
  String get summary;
  @override
  String? get linkedChapterId;
  @override
  OutlineNodeStatus get status;
  @override
  int get schemaVersion;

  /// Create a copy of OutlineNode
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OutlineNodeImplCopyWith<_$OutlineNodeImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
