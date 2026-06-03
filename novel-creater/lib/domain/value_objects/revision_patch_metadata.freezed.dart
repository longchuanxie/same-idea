// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'revision_patch_metadata.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RevisionPatchMetadata _$RevisionPatchMetadataFromJson(
    Map<String, dynamic> json) {
  return _RevisionPatchMetadata.fromJson(json);
}

/// @nodoc
mixin _$RevisionPatchMetadata {
  String? get prompt => throw _privateConstructorUsedError;
  String? get model => throw _privateConstructorUsedError;
  String? get taskId => throw _privateConstructorUsedError;
  String? get summary => throw _privateConstructorUsedError;
  String? get changeSummary => throw _privateConstructorUsedError;
  String? get baseContentHash => throw _privateConstructorUsedError;

  /// Serializes this RevisionPatchMetadata to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RevisionPatchMetadata
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RevisionPatchMetadataCopyWith<RevisionPatchMetadata> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RevisionPatchMetadataCopyWith<$Res> {
  factory $RevisionPatchMetadataCopyWith(RevisionPatchMetadata value,
          $Res Function(RevisionPatchMetadata) then) =
      _$RevisionPatchMetadataCopyWithImpl<$Res, RevisionPatchMetadata>;
  @useResult
  $Res call(
      {String? prompt,
      String? model,
      String? taskId,
      String? summary,
      String? changeSummary,
      String? baseContentHash});
}

/// @nodoc
class _$RevisionPatchMetadataCopyWithImpl<$Res,
        $Val extends RevisionPatchMetadata>
    implements $RevisionPatchMetadataCopyWith<$Res> {
  _$RevisionPatchMetadataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RevisionPatchMetadata
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? prompt = freezed,
    Object? model = freezed,
    Object? taskId = freezed,
    Object? summary = freezed,
    Object? changeSummary = freezed,
    Object? baseContentHash = freezed,
  }) {
    return _then(_value.copyWith(
      prompt: freezed == prompt
          ? _value.prompt
          : prompt // ignore: cast_nullable_to_non_nullable
              as String?,
      model: freezed == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String?,
      taskId: freezed == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String?,
      summary: freezed == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String?,
      changeSummary: freezed == changeSummary
          ? _value.changeSummary
          : changeSummary // ignore: cast_nullable_to_non_nullable
              as String?,
      baseContentHash: freezed == baseContentHash
          ? _value.baseContentHash
          : baseContentHash // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RevisionPatchMetadataImplCopyWith<$Res>
    implements $RevisionPatchMetadataCopyWith<$Res> {
  factory _$$RevisionPatchMetadataImplCopyWith(
          _$RevisionPatchMetadataImpl value,
          $Res Function(_$RevisionPatchMetadataImpl) then) =
      __$$RevisionPatchMetadataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? prompt,
      String? model,
      String? taskId,
      String? summary,
      String? changeSummary,
      String? baseContentHash});
}

/// @nodoc
class __$$RevisionPatchMetadataImplCopyWithImpl<$Res>
    extends _$RevisionPatchMetadataCopyWithImpl<$Res,
        _$RevisionPatchMetadataImpl>
    implements _$$RevisionPatchMetadataImplCopyWith<$Res> {
  __$$RevisionPatchMetadataImplCopyWithImpl(_$RevisionPatchMetadataImpl _value,
      $Res Function(_$RevisionPatchMetadataImpl) _then)
      : super(_value, _then);

  /// Create a copy of RevisionPatchMetadata
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? prompt = freezed,
    Object? model = freezed,
    Object? taskId = freezed,
    Object? summary = freezed,
    Object? changeSummary = freezed,
    Object? baseContentHash = freezed,
  }) {
    return _then(_$RevisionPatchMetadataImpl(
      prompt: freezed == prompt
          ? _value.prompt
          : prompt // ignore: cast_nullable_to_non_nullable
              as String?,
      model: freezed == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String?,
      taskId: freezed == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String?,
      summary: freezed == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String?,
      changeSummary: freezed == changeSummary
          ? _value.changeSummary
          : changeSummary // ignore: cast_nullable_to_non_nullable
              as String?,
      baseContentHash: freezed == baseContentHash
          ? _value.baseContentHash
          : baseContentHash // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RevisionPatchMetadataImpl implements _RevisionPatchMetadata {
  const _$RevisionPatchMetadataImpl(
      {this.prompt,
      this.model,
      this.taskId,
      this.summary,
      this.changeSummary,
      this.baseContentHash});

  factory _$RevisionPatchMetadataImpl.fromJson(Map<String, dynamic> json) =>
      _$$RevisionPatchMetadataImplFromJson(json);

  @override
  final String? prompt;
  @override
  final String? model;
  @override
  final String? taskId;
  @override
  final String? summary;
  @override
  final String? changeSummary;
  @override
  final String? baseContentHash;

  @override
  String toString() {
    return 'RevisionPatchMetadata(prompt: $prompt, model: $model, taskId: $taskId, summary: $summary, changeSummary: $changeSummary, baseContentHash: $baseContentHash)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RevisionPatchMetadataImpl &&
            (identical(other.prompt, prompt) || other.prompt == prompt) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.taskId, taskId) || other.taskId == taskId) &&
            (identical(other.summary, summary) || other.summary == summary) &&
            (identical(other.changeSummary, changeSummary) ||
                other.changeSummary == changeSummary) &&
            (identical(other.baseContentHash, baseContentHash) ||
                other.baseContentHash == baseContentHash));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, prompt, model, taskId, summary,
      changeSummary, baseContentHash);

  /// Create a copy of RevisionPatchMetadata
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RevisionPatchMetadataImplCopyWith<_$RevisionPatchMetadataImpl>
      get copyWith => __$$RevisionPatchMetadataImplCopyWithImpl<
          _$RevisionPatchMetadataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RevisionPatchMetadataImplToJson(
      this,
    );
  }
}

abstract class _RevisionPatchMetadata implements RevisionPatchMetadata {
  const factory _RevisionPatchMetadata(
      {final String? prompt,
      final String? model,
      final String? taskId,
      final String? summary,
      final String? changeSummary,
      final String? baseContentHash}) = _$RevisionPatchMetadataImpl;

  factory _RevisionPatchMetadata.fromJson(Map<String, dynamic> json) =
      _$RevisionPatchMetadataImpl.fromJson;

  @override
  String? get prompt;
  @override
  String? get model;
  @override
  String? get taskId;
  @override
  String? get summary;
  @override
  String? get changeSummary;
  @override
  String? get baseContentHash;

  /// Create a copy of RevisionPatchMetadata
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RevisionPatchMetadataImplCopyWith<_$RevisionPatchMetadataImpl>
      get copyWith => throw _privateConstructorUsedError;
}
