// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LlmResponse _$LlmResponseFromJson(Map<String, dynamic> json) {
  return _LlmResponse.fromJson(json);
}

/// @nodoc
mixin _$LlmResponse {
  String get content => throw _privateConstructorUsedError;
  String? get finishReason => throw _privateConstructorUsedError;
  int? get promptTokens => throw _privateConstructorUsedError;
  int? get completionTokens => throw _privateConstructorUsedError;

  /// Serializes this LlmResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LlmResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LlmResponseCopyWith<LlmResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmResponseCopyWith<$Res> {
  factory $LlmResponseCopyWith(
          LlmResponse value, $Res Function(LlmResponse) then) =
      _$LlmResponseCopyWithImpl<$Res, LlmResponse>;
  @useResult
  $Res call(
      {String content,
      String? finishReason,
      int? promptTokens,
      int? completionTokens});
}

/// @nodoc
class _$LlmResponseCopyWithImpl<$Res, $Val extends LlmResponse>
    implements $LlmResponseCopyWith<$Res> {
  _$LlmResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? content = null,
    Object? finishReason = freezed,
    Object? promptTokens = freezed,
    Object? completionTokens = freezed,
  }) {
    return _then(_value.copyWith(
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      finishReason: freezed == finishReason
          ? _value.finishReason
          : finishReason // ignore: cast_nullable_to_non_nullable
              as String?,
      promptTokens: freezed == promptTokens
          ? _value.promptTokens
          : promptTokens // ignore: cast_nullable_to_non_nullable
              as int?,
      completionTokens: freezed == completionTokens
          ? _value.completionTokens
          : completionTokens // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LlmResponseImplCopyWith<$Res>
    implements $LlmResponseCopyWith<$Res> {
  factory _$$LlmResponseImplCopyWith(
          _$LlmResponseImpl value, $Res Function(_$LlmResponseImpl) then) =
      __$$LlmResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String content,
      String? finishReason,
      int? promptTokens,
      int? completionTokens});
}

/// @nodoc
class __$$LlmResponseImplCopyWithImpl<$Res>
    extends _$LlmResponseCopyWithImpl<$Res, _$LlmResponseImpl>
    implements _$$LlmResponseImplCopyWith<$Res> {
  __$$LlmResponseImplCopyWithImpl(
      _$LlmResponseImpl _value, $Res Function(_$LlmResponseImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? content = null,
    Object? finishReason = freezed,
    Object? promptTokens = freezed,
    Object? completionTokens = freezed,
  }) {
    return _then(_$LlmResponseImpl(
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      finishReason: freezed == finishReason
          ? _value.finishReason
          : finishReason // ignore: cast_nullable_to_non_nullable
              as String?,
      promptTokens: freezed == promptTokens
          ? _value.promptTokens
          : promptTokens // ignore: cast_nullable_to_non_nullable
              as int?,
      completionTokens: freezed == completionTokens
          ? _value.completionTokens
          : completionTokens // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LlmResponseImpl implements _LlmResponse {
  const _$LlmResponseImpl(
      {required this.content,
      this.finishReason,
      this.promptTokens,
      this.completionTokens});

  factory _$LlmResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmResponseImplFromJson(json);

  @override
  final String content;
  @override
  final String? finishReason;
  @override
  final int? promptTokens;
  @override
  final int? completionTokens;

  @override
  String toString() {
    return 'LlmResponse(content: $content, finishReason: $finishReason, promptTokens: $promptTokens, completionTokens: $completionTokens)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmResponseImpl &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.finishReason, finishReason) ||
                other.finishReason == finishReason) &&
            (identical(other.promptTokens, promptTokens) ||
                other.promptTokens == promptTokens) &&
            (identical(other.completionTokens, completionTokens) ||
                other.completionTokens == completionTokens));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, content, finishReason, promptTokens, completionTokens);

  /// Create a copy of LlmResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LlmResponseImplCopyWith<_$LlmResponseImpl> get copyWith =>
      __$$LlmResponseImplCopyWithImpl<_$LlmResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LlmResponseImplToJson(
      this,
    );
  }
}

abstract class _LlmResponse implements LlmResponse {
  const factory _LlmResponse(
      {required final String content,
      final String? finishReason,
      final int? promptTokens,
      final int? completionTokens}) = _$LlmResponseImpl;

  factory _LlmResponse.fromJson(Map<String, dynamic> json) =
      _$LlmResponseImpl.fromJson;

  @override
  String get content;
  @override
  String? get finishReason;
  @override
  int? get promptTokens;
  @override
  int? get completionTokens;

  /// Create a copy of LlmResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmResponseImplCopyWith<_$LlmResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
