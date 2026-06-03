// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_error.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AppError _$AppErrorFromJson(Map<String, dynamic> json) {
  return _AppError.fromJson(json);
}

/// @nodoc
mixin _$AppError {
  String get code => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  String get userMessage => throw _privateConstructorUsedError;
  String? get technicalDetail => throw _privateConstructorUsedError;
  bool get recoverable => throw _privateConstructorUsedError;
  String? get suggestedAction => throw _privateConstructorUsedError;
  AppErrorSource get source => throw _privateConstructorUsedError;

  /// Serializes this AppError to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AppError
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppErrorCopyWith<AppError> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppErrorCopyWith<$Res> {
  factory $AppErrorCopyWith(AppError value, $Res Function(AppError) then) =
      _$AppErrorCopyWithImpl<$Res, AppError>;
  @useResult
  $Res call(
      {String code,
      String message,
      String userMessage,
      String? technicalDetail,
      bool recoverable,
      String? suggestedAction,
      AppErrorSource source});
}

/// @nodoc
class _$AppErrorCopyWithImpl<$Res, $Val extends AppError>
    implements $AppErrorCopyWith<$Res> {
  _$AppErrorCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppError
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? code = null,
    Object? message = null,
    Object? userMessage = null,
    Object? technicalDetail = freezed,
    Object? recoverable = null,
    Object? suggestedAction = freezed,
    Object? source = null,
  }) {
    return _then(_value.copyWith(
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      userMessage: null == userMessage
          ? _value.userMessage
          : userMessage // ignore: cast_nullable_to_non_nullable
              as String,
      technicalDetail: freezed == technicalDetail
          ? _value.technicalDetail
          : technicalDetail // ignore: cast_nullable_to_non_nullable
              as String?,
      recoverable: null == recoverable
          ? _value.recoverable
          : recoverable // ignore: cast_nullable_to_non_nullable
              as bool,
      suggestedAction: freezed == suggestedAction
          ? _value.suggestedAction
          : suggestedAction // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as AppErrorSource,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AppErrorImplCopyWith<$Res>
    implements $AppErrorCopyWith<$Res> {
  factory _$$AppErrorImplCopyWith(
          _$AppErrorImpl value, $Res Function(_$AppErrorImpl) then) =
      __$$AppErrorImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String code,
      String message,
      String userMessage,
      String? technicalDetail,
      bool recoverable,
      String? suggestedAction,
      AppErrorSource source});
}

/// @nodoc
class __$$AppErrorImplCopyWithImpl<$Res>
    extends _$AppErrorCopyWithImpl<$Res, _$AppErrorImpl>
    implements _$$AppErrorImplCopyWith<$Res> {
  __$$AppErrorImplCopyWithImpl(
      _$AppErrorImpl _value, $Res Function(_$AppErrorImpl) _then)
      : super(_value, _then);

  /// Create a copy of AppError
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? code = null,
    Object? message = null,
    Object? userMessage = null,
    Object? technicalDetail = freezed,
    Object? recoverable = null,
    Object? suggestedAction = freezed,
    Object? source = null,
  }) {
    return _then(_$AppErrorImpl(
      code: null == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      userMessage: null == userMessage
          ? _value.userMessage
          : userMessage // ignore: cast_nullable_to_non_nullable
              as String,
      technicalDetail: freezed == technicalDetail
          ? _value.technicalDetail
          : technicalDetail // ignore: cast_nullable_to_non_nullable
              as String?,
      recoverable: null == recoverable
          ? _value.recoverable
          : recoverable // ignore: cast_nullable_to_non_nullable
              as bool,
      suggestedAction: freezed == suggestedAction
          ? _value.suggestedAction
          : suggestedAction // ignore: cast_nullable_to_non_nullable
              as String?,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as AppErrorSource,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AppErrorImpl implements _AppError {
  const _$AppErrorImpl(
      {required this.code,
      required this.message,
      required this.userMessage,
      this.technicalDetail,
      this.recoverable = true,
      this.suggestedAction,
      this.source = AppErrorSource.unknown});

  factory _$AppErrorImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppErrorImplFromJson(json);

  @override
  final String code;
  @override
  final String message;
  @override
  final String userMessage;
  @override
  final String? technicalDetail;
  @override
  @JsonKey()
  final bool recoverable;
  @override
  final String? suggestedAction;
  @override
  @JsonKey()
  final AppErrorSource source;

  @override
  String toString() {
    return 'AppError(code: $code, message: $message, userMessage: $userMessage, technicalDetail: $technicalDetail, recoverable: $recoverable, suggestedAction: $suggestedAction, source: $source)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppErrorImpl &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.userMessage, userMessage) ||
                other.userMessage == userMessage) &&
            (identical(other.technicalDetail, technicalDetail) ||
                other.technicalDetail == technicalDetail) &&
            (identical(other.recoverable, recoverable) ||
                other.recoverable == recoverable) &&
            (identical(other.suggestedAction, suggestedAction) ||
                other.suggestedAction == suggestedAction) &&
            (identical(other.source, source) || other.source == source));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, code, message, userMessage,
      technicalDetail, recoverable, suggestedAction, source);

  /// Create a copy of AppError
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppErrorImplCopyWith<_$AppErrorImpl> get copyWith =>
      __$$AppErrorImplCopyWithImpl<_$AppErrorImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AppErrorImplToJson(
      this,
    );
  }
}

abstract class _AppError implements AppError {
  const factory _AppError(
      {required final String code,
      required final String message,
      required final String userMessage,
      final String? technicalDetail,
      final bool recoverable,
      final String? suggestedAction,
      final AppErrorSource source}) = _$AppErrorImpl;

  factory _AppError.fromJson(Map<String, dynamic> json) =
      _$AppErrorImpl.fromJson;

  @override
  String get code;
  @override
  String get message;
  @override
  String get userMessage;
  @override
  String? get technicalDetail;
  @override
  bool get recoverable;
  @override
  String? get suggestedAction;
  @override
  AppErrorSource get source;

  /// Create a copy of AppError
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppErrorImplCopyWith<_$AppErrorImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
