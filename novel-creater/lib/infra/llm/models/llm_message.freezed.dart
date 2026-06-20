// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_message.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LlmMessage _$LlmMessageFromJson(Map<String, dynamic> json) {
  return _LlmMessage.fromJson(json);
}

/// @nodoc
mixin _$LlmMessage {
  String get role => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;

  /// Serializes this LlmMessage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LlmMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LlmMessageCopyWith<LlmMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmMessageCopyWith<$Res> {
  factory $LlmMessageCopyWith(
          LlmMessage value, $Res Function(LlmMessage) then) =
      _$LlmMessageCopyWithImpl<$Res, LlmMessage>;
  @useResult
  $Res call({String role, String content});
}

/// @nodoc
class _$LlmMessageCopyWithImpl<$Res, $Val extends LlmMessage>
    implements $LlmMessageCopyWith<$Res> {
  _$LlmMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? role = null,
    Object? content = null,
  }) {
    return _then(_value.copyWith(
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LlmMessageImplCopyWith<$Res>
    implements $LlmMessageCopyWith<$Res> {
  factory _$$LlmMessageImplCopyWith(
          _$LlmMessageImpl value, $Res Function(_$LlmMessageImpl) then) =
      __$$LlmMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String role, String content});
}

/// @nodoc
class __$$LlmMessageImplCopyWithImpl<$Res>
    extends _$LlmMessageCopyWithImpl<$Res, _$LlmMessageImpl>
    implements _$$LlmMessageImplCopyWith<$Res> {
  __$$LlmMessageImplCopyWithImpl(
      _$LlmMessageImpl _value, $Res Function(_$LlmMessageImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? role = null,
    Object? content = null,
  }) {
    return _then(_$LlmMessageImpl(
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LlmMessageImpl implements _LlmMessage {
  const _$LlmMessageImpl({required this.role, required this.content});

  factory _$LlmMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmMessageImplFromJson(json);

  @override
  final String role;
  @override
  final String content;

  @override
  String toString() {
    return 'LlmMessage(role: $role, content: $content)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmMessageImpl &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.content, content) || other.content == content));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, role, content);

  /// Create a copy of LlmMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LlmMessageImplCopyWith<_$LlmMessageImpl> get copyWith =>
      __$$LlmMessageImplCopyWithImpl<_$LlmMessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LlmMessageImplToJson(
      this,
    );
  }
}

abstract class _LlmMessage implements LlmMessage {
  const factory _LlmMessage(
      {required final String role,
      required final String content}) = _$LlmMessageImpl;

  factory _LlmMessage.fromJson(Map<String, dynamic> json) =
      _$LlmMessageImpl.fromJson;

  @override
  String get role;
  @override
  String get content;

  /// Create a copy of LlmMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmMessageImplCopyWith<_$LlmMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
