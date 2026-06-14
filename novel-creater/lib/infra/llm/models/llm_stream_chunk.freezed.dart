// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_stream_chunk.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$LlmStreamChunk {
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String text) textDelta,
    required TResult Function(String? finishReason) done,
    required TResult Function(AppError error) error,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String text)? textDelta,
    TResult? Function(String? finishReason)? done,
    TResult? Function(AppError error)? error,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String text)? textDelta,
    TResult Function(String? finishReason)? done,
    TResult Function(AppError error)? error,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(TextDelta value) textDelta,
    required TResult Function(StreamDone value) done,
    required TResult Function(StreamErrorChunk value) error,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(TextDelta value)? textDelta,
    TResult? Function(StreamDone value)? done,
    TResult? Function(StreamErrorChunk value)? error,
  }) =>
      throw _privateConstructorUsedError;
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(TextDelta value)? textDelta,
    TResult Function(StreamDone value)? done,
    TResult Function(StreamErrorChunk value)? error,
    required TResult orElse(),
  }) =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmStreamChunkCopyWith<$Res> {
  factory $LlmStreamChunkCopyWith(
          LlmStreamChunk value, $Res Function(LlmStreamChunk) then) =
      _$LlmStreamChunkCopyWithImpl<$Res, LlmStreamChunk>;
}

/// @nodoc
class _$LlmStreamChunkCopyWithImpl<$Res, $Val extends LlmStreamChunk>
    implements $LlmStreamChunkCopyWith<$Res> {
  _$LlmStreamChunkCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
}

/// @nodoc
abstract class _$$TextDeltaImplCopyWith<$Res> {
  factory _$$TextDeltaImplCopyWith(
          _$TextDeltaImpl value, $Res Function(_$TextDeltaImpl) then) =
      __$$TextDeltaImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String text});
}

/// @nodoc
class __$$TextDeltaImplCopyWithImpl<$Res>
    extends _$LlmStreamChunkCopyWithImpl<$Res, _$TextDeltaImpl>
    implements _$$TextDeltaImplCopyWith<$Res> {
  __$$TextDeltaImplCopyWithImpl(
      _$TextDeltaImpl _value, $Res Function(_$TextDeltaImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? text = null,
  }) {
    return _then(_$TextDeltaImpl(
      null == text
          ? _value.text
          : text // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc

class _$TextDeltaImpl implements TextDelta {
  const _$TextDeltaImpl(this.text);

  @override
  final String text;

  @override
  String toString() {
    return 'LlmStreamChunk.textDelta(text: $text)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TextDeltaImpl &&
            (identical(other.text, text) || other.text == text));
  }

  @override
  int get hashCode => Object.hash(runtimeType, text);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TextDeltaImplCopyWith<_$TextDeltaImpl> get copyWith =>
      __$$TextDeltaImplCopyWithImpl<_$TextDeltaImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String text) textDelta,
    required TResult Function(String? finishReason) done,
    required TResult Function(AppError error) error,
  }) {
    return textDelta(text);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String text)? textDelta,
    TResult? Function(String? finishReason)? done,
    TResult? Function(AppError error)? error,
  }) {
    return textDelta?.call(text);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String text)? textDelta,
    TResult Function(String? finishReason)? done,
    TResult Function(AppError error)? error,
    required TResult orElse(),
  }) {
    if (textDelta != null) {
      return textDelta(text);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(TextDelta value) textDelta,
    required TResult Function(StreamDone value) done,
    required TResult Function(StreamErrorChunk value) error,
  }) {
    return textDelta(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(TextDelta value)? textDelta,
    TResult? Function(StreamDone value)? done,
    TResult? Function(StreamErrorChunk value)? error,
  }) {
    return textDelta?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(TextDelta value)? textDelta,
    TResult Function(StreamDone value)? done,
    TResult Function(StreamErrorChunk value)? error,
    required TResult orElse(),
  }) {
    if (textDelta != null) {
      return textDelta(this);
    }
    return orElse();
  }
}

abstract class TextDelta implements LlmStreamChunk {
  const factory TextDelta(final String text) = _$TextDeltaImpl;

  String get text;

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TextDeltaImplCopyWith<_$TextDeltaImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$StreamDoneImplCopyWith<$Res> {
  factory _$$StreamDoneImplCopyWith(
          _$StreamDoneImpl value, $Res Function(_$StreamDoneImpl) then) =
      __$$StreamDoneImplCopyWithImpl<$Res>;
  @useResult
  $Res call({String? finishReason});
}

/// @nodoc
class __$$StreamDoneImplCopyWithImpl<$Res>
    extends _$LlmStreamChunkCopyWithImpl<$Res, _$StreamDoneImpl>
    implements _$$StreamDoneImplCopyWith<$Res> {
  __$$StreamDoneImplCopyWithImpl(
      _$StreamDoneImpl _value, $Res Function(_$StreamDoneImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? finishReason = freezed,
  }) {
    return _then(_$StreamDoneImpl(
      freezed == finishReason
          ? _value.finishReason
          : finishReason // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc

class _$StreamDoneImpl implements StreamDone {
  const _$StreamDoneImpl(this.finishReason);

  @override
  final String? finishReason;

  @override
  String toString() {
    return 'LlmStreamChunk.done(finishReason: $finishReason)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StreamDoneImpl &&
            (identical(other.finishReason, finishReason) ||
                other.finishReason == finishReason));
  }

  @override
  int get hashCode => Object.hash(runtimeType, finishReason);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StreamDoneImplCopyWith<_$StreamDoneImpl> get copyWith =>
      __$$StreamDoneImplCopyWithImpl<_$StreamDoneImpl>(this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String text) textDelta,
    required TResult Function(String? finishReason) done,
    required TResult Function(AppError error) error,
  }) {
    return done(finishReason);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String text)? textDelta,
    TResult? Function(String? finishReason)? done,
    TResult? Function(AppError error)? error,
  }) {
    return done?.call(finishReason);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String text)? textDelta,
    TResult Function(String? finishReason)? done,
    TResult Function(AppError error)? error,
    required TResult orElse(),
  }) {
    if (done != null) {
      return done(finishReason);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(TextDelta value) textDelta,
    required TResult Function(StreamDone value) done,
    required TResult Function(StreamErrorChunk value) error,
  }) {
    return done(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(TextDelta value)? textDelta,
    TResult? Function(StreamDone value)? done,
    TResult? Function(StreamErrorChunk value)? error,
  }) {
    return done?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(TextDelta value)? textDelta,
    TResult Function(StreamDone value)? done,
    TResult Function(StreamErrorChunk value)? error,
    required TResult orElse(),
  }) {
    if (done != null) {
      return done(this);
    }
    return orElse();
  }
}

abstract class StreamDone implements LlmStreamChunk {
  const factory StreamDone(final String? finishReason) = _$StreamDoneImpl;

  String? get finishReason;

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StreamDoneImplCopyWith<_$StreamDoneImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class _$$StreamErrorChunkImplCopyWith<$Res> {
  factory _$$StreamErrorChunkImplCopyWith(_$StreamErrorChunkImpl value,
          $Res Function(_$StreamErrorChunkImpl) then) =
      __$$StreamErrorChunkImplCopyWithImpl<$Res>;
  @useResult
  $Res call({AppError error});
}

/// @nodoc
class __$$StreamErrorChunkImplCopyWithImpl<$Res>
    extends _$LlmStreamChunkCopyWithImpl<$Res, _$StreamErrorChunkImpl>
    implements _$$StreamErrorChunkImplCopyWith<$Res> {
  __$$StreamErrorChunkImplCopyWithImpl(_$StreamErrorChunkImpl _value,
      $Res Function(_$StreamErrorChunkImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? error = null,
  }) {
    return _then(_$StreamErrorChunkImpl(
      null == error
          ? _value.error
          : error // ignore: cast_nullable_to_non_nullable
              as AppError,
    ));
  }
}

/// @nodoc

class _$StreamErrorChunkImpl implements StreamErrorChunk {
  const _$StreamErrorChunkImpl(this.error);

  @override
  final AppError error;

  @override
  String toString() {
    return 'LlmStreamChunk.error(error: $error)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$StreamErrorChunkImpl &&
            (identical(other.error, error) || other.error == error));
  }

  @override
  int get hashCode => Object.hash(runtimeType, error);

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$StreamErrorChunkImplCopyWith<_$StreamErrorChunkImpl> get copyWith =>
      __$$StreamErrorChunkImplCopyWithImpl<_$StreamErrorChunkImpl>(
          this, _$identity);

  @override
  @optionalTypeArgs
  TResult when<TResult extends Object?>({
    required TResult Function(String text) textDelta,
    required TResult Function(String? finishReason) done,
    required TResult Function(AppError error) error,
  }) {
    return error(this.error);
  }

  @override
  @optionalTypeArgs
  TResult? whenOrNull<TResult extends Object?>({
    TResult? Function(String text)? textDelta,
    TResult? Function(String? finishReason)? done,
    TResult? Function(AppError error)? error,
  }) {
    return error?.call(this.error);
  }

  @override
  @optionalTypeArgs
  TResult maybeWhen<TResult extends Object?>({
    TResult Function(String text)? textDelta,
    TResult Function(String? finishReason)? done,
    TResult Function(AppError error)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this.error);
    }
    return orElse();
  }

  @override
  @optionalTypeArgs
  TResult map<TResult extends Object?>({
    required TResult Function(TextDelta value) textDelta,
    required TResult Function(StreamDone value) done,
    required TResult Function(StreamErrorChunk value) error,
  }) {
    return error(this);
  }

  @override
  @optionalTypeArgs
  TResult? mapOrNull<TResult extends Object?>({
    TResult? Function(TextDelta value)? textDelta,
    TResult? Function(StreamDone value)? done,
    TResult? Function(StreamErrorChunk value)? error,
  }) {
    return error?.call(this);
  }

  @override
  @optionalTypeArgs
  TResult maybeMap<TResult extends Object?>({
    TResult Function(TextDelta value)? textDelta,
    TResult Function(StreamDone value)? done,
    TResult Function(StreamErrorChunk value)? error,
    required TResult orElse(),
  }) {
    if (error != null) {
      return error(this);
    }
    return orElse();
  }
}

abstract class StreamErrorChunk implements LlmStreamChunk {
  const factory StreamErrorChunk(final AppError error) = _$StreamErrorChunkImpl;

  AppError get error;

  /// Create a copy of LlmStreamChunk
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$StreamErrorChunkImplCopyWith<_$StreamErrorChunkImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
