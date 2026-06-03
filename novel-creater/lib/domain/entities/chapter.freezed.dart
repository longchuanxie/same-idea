// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chapter.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Chapter _$ChapterFromJson(Map<String, dynamic> json) {
  return _Chapter.fromJson(json);
}

/// @nodoc
mixin _$Chapter {
  String get id => throw _privateConstructorUsedError;
  String get projectId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  int get order => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String? get outlineNodeId => throw _privateConstructorUsedError;
  ContentFormat get contentFormat => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  String get plainTextCache => throw _privateConstructorUsedError;
  int get wordCount => throw _privateConstructorUsedError;
  ChapterStatus get status => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

  /// Serializes this Chapter to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Chapter
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChapterCopyWith<Chapter> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChapterCopyWith<$Res> {
  factory $ChapterCopyWith(Chapter value, $Res Function(Chapter) then) =
      _$ChapterCopyWithImpl<$Res, Chapter>;
  @useResult
  $Res call(
      {String id,
      String projectId,
      String title,
      int order,
      DateTime createdAt,
      DateTime updatedAt,
      String? outlineNodeId,
      ContentFormat contentFormat,
      String content,
      String plainTextCache,
      int wordCount,
      ChapterStatus status,
      int schemaVersion});
}

/// @nodoc
class _$ChapterCopyWithImpl<$Res, $Val extends Chapter>
    implements $ChapterCopyWith<$Res> {
  _$ChapterCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Chapter
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? title = null,
    Object? order = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? outlineNodeId = freezed,
    Object? contentFormat = null,
    Object? content = null,
    Object? plainTextCache = null,
    Object? wordCount = null,
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
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      outlineNodeId: freezed == outlineNodeId
          ? _value.outlineNodeId
          : outlineNodeId // ignore: cast_nullable_to_non_nullable
              as String?,
      contentFormat: null == contentFormat
          ? _value.contentFormat
          : contentFormat // ignore: cast_nullable_to_non_nullable
              as ContentFormat,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      plainTextCache: null == plainTextCache
          ? _value.plainTextCache
          : plainTextCache // ignore: cast_nullable_to_non_nullable
              as String,
      wordCount: null == wordCount
          ? _value.wordCount
          : wordCount // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ChapterStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ChapterImplCopyWith<$Res> implements $ChapterCopyWith<$Res> {
  factory _$$ChapterImplCopyWith(
          _$ChapterImpl value, $Res Function(_$ChapterImpl) then) =
      __$$ChapterImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String projectId,
      String title,
      int order,
      DateTime createdAt,
      DateTime updatedAt,
      String? outlineNodeId,
      ContentFormat contentFormat,
      String content,
      String plainTextCache,
      int wordCount,
      ChapterStatus status,
      int schemaVersion});
}

/// @nodoc
class __$$ChapterImplCopyWithImpl<$Res>
    extends _$ChapterCopyWithImpl<$Res, _$ChapterImpl>
    implements _$$ChapterImplCopyWith<$Res> {
  __$$ChapterImplCopyWithImpl(
      _$ChapterImpl _value, $Res Function(_$ChapterImpl) _then)
      : super(_value, _then);

  /// Create a copy of Chapter
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? projectId = null,
    Object? title = null,
    Object? order = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? outlineNodeId = freezed,
    Object? contentFormat = null,
    Object? content = null,
    Object? plainTextCache = null,
    Object? wordCount = null,
    Object? status = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$ChapterImpl(
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
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      outlineNodeId: freezed == outlineNodeId
          ? _value.outlineNodeId
          : outlineNodeId // ignore: cast_nullable_to_non_nullable
              as String?,
      contentFormat: null == contentFormat
          ? _value.contentFormat
          : contentFormat // ignore: cast_nullable_to_non_nullable
              as ContentFormat,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      plainTextCache: null == plainTextCache
          ? _value.plainTextCache
          : plainTextCache // ignore: cast_nullable_to_non_nullable
              as String,
      wordCount: null == wordCount
          ? _value.wordCount
          : wordCount // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ChapterStatus,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ChapterImpl extends _Chapter {
  const _$ChapterImpl(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.order,
      required this.createdAt,
      required this.updatedAt,
      this.outlineNodeId,
      this.contentFormat = ContentFormat.markdown,
      this.content = '',
      this.plainTextCache = '',
      this.wordCount = 0,
      this.status = ChapterStatus.draft,
      this.schemaVersion = 1})
      : super._();

  factory _$ChapterImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChapterImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String title;
  @override
  final int order;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? outlineNodeId;
  @override
  @JsonKey()
  final ContentFormat contentFormat;
  @override
  @JsonKey()
  final String content;
  @override
  @JsonKey()
  final String plainTextCache;
  @override
  @JsonKey()
  final int wordCount;
  @override
  @JsonKey()
  final ChapterStatus status;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'Chapter(id: $id, projectId: $projectId, title: $title, order: $order, createdAt: $createdAt, updatedAt: $updatedAt, outlineNodeId: $outlineNodeId, contentFormat: $contentFormat, content: $content, plainTextCache: $plainTextCache, wordCount: $wordCount, status: $status, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChapterImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.order, order) || other.order == order) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.outlineNodeId, outlineNodeId) ||
                other.outlineNodeId == outlineNodeId) &&
            (identical(other.contentFormat, contentFormat) ||
                other.contentFormat == contentFormat) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.plainTextCache, plainTextCache) ||
                other.plainTextCache == plainTextCache) &&
            (identical(other.wordCount, wordCount) ||
                other.wordCount == wordCount) &&
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
      title,
      order,
      createdAt,
      updatedAt,
      outlineNodeId,
      contentFormat,
      content,
      plainTextCache,
      wordCount,
      status,
      schemaVersion);

  /// Create a copy of Chapter
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChapterImplCopyWith<_$ChapterImpl> get copyWith =>
      __$$ChapterImplCopyWithImpl<_$ChapterImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChapterImplToJson(
      this,
    );
  }
}

abstract class _Chapter extends Chapter {
  const factory _Chapter(
      {required final String id,
      required final String projectId,
      required final String title,
      required final int order,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final String? outlineNodeId,
      final ContentFormat contentFormat,
      final String content,
      final String plainTextCache,
      final int wordCount,
      final ChapterStatus status,
      final int schemaVersion}) = _$ChapterImpl;
  const _Chapter._() : super._();

  factory _Chapter.fromJson(Map<String, dynamic> json) = _$ChapterImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get title;
  @override
  int get order;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  String? get outlineNodeId;
  @override
  ContentFormat get contentFormat;
  @override
  String get content;
  @override
  String get plainTextCache;
  @override
  int get wordCount;
  @override
  ChapterStatus get status;
  @override
  int get schemaVersion;

  /// Create a copy of Chapter
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChapterImplCopyWith<_$ChapterImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
