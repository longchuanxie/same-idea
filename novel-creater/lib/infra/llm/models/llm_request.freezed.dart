// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LlmRequest _$LlmRequestFromJson(Map<String, dynamic> json) {
  return _LlmRequest.fromJson(json);
}

/// @nodoc
mixin _$LlmRequest {
  String get baseUrl => throw _privateConstructorUsedError;
  String get apiKey => throw _privateConstructorUsedError;
  String get model => throw _privateConstructorUsedError;
  List<LlmMessage> get messages => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  double get topP => throw _privateConstructorUsedError;
  int get maxTokens => throw _privateConstructorUsedError;
  bool get stream => throw _privateConstructorUsedError;

  /// Serializes this LlmRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LlmRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LlmRequestCopyWith<LlmRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmRequestCopyWith<$Res> {
  factory $LlmRequestCopyWith(
          LlmRequest value, $Res Function(LlmRequest) then) =
      _$LlmRequestCopyWithImpl<$Res, LlmRequest>;
  @useResult
  $Res call(
      {String baseUrl,
      String apiKey,
      String model,
      List<LlmMessage> messages,
      double temperature,
      double topP,
      int maxTokens,
      bool stream});
}

/// @nodoc
class _$LlmRequestCopyWithImpl<$Res, $Val extends LlmRequest>
    implements $LlmRequestCopyWith<$Res> {
  _$LlmRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? baseUrl = null,
    Object? apiKey = null,
    Object? model = null,
    Object? messages = null,
    Object? temperature = null,
    Object? topP = null,
    Object? maxTokens = null,
    Object? stream = null,
  }) {
    return _then(_value.copyWith(
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      messages: null == messages
          ? _value.messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<LlmMessage>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      topP: null == topP
          ? _value.topP
          : topP // ignore: cast_nullable_to_non_nullable
              as double,
      maxTokens: null == maxTokens
          ? _value.maxTokens
          : maxTokens // ignore: cast_nullable_to_non_nullable
              as int,
      stream: null == stream
          ? _value.stream
          : stream // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LlmRequestImplCopyWith<$Res>
    implements $LlmRequestCopyWith<$Res> {
  factory _$$LlmRequestImplCopyWith(
          _$LlmRequestImpl value, $Res Function(_$LlmRequestImpl) then) =
      __$$LlmRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String baseUrl,
      String apiKey,
      String model,
      List<LlmMessage> messages,
      double temperature,
      double topP,
      int maxTokens,
      bool stream});
}

/// @nodoc
class __$$LlmRequestImplCopyWithImpl<$Res>
    extends _$LlmRequestCopyWithImpl<$Res, _$LlmRequestImpl>
    implements _$$LlmRequestImplCopyWith<$Res> {
  __$$LlmRequestImplCopyWithImpl(
      _$LlmRequestImpl _value, $Res Function(_$LlmRequestImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? baseUrl = null,
    Object? apiKey = null,
    Object? model = null,
    Object? messages = null,
    Object? temperature = null,
    Object? topP = null,
    Object? maxTokens = null,
    Object? stream = null,
  }) {
    return _then(_$LlmRequestImpl(
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      messages: null == messages
          ? _value._messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<LlmMessage>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      topP: null == topP
          ? _value.topP
          : topP // ignore: cast_nullable_to_non_nullable
              as double,
      maxTokens: null == maxTokens
          ? _value.maxTokens
          : maxTokens // ignore: cast_nullable_to_non_nullable
              as int,
      stream: null == stream
          ? _value.stream
          : stream // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc

@JsonSerializable(explicitToJson: true)
class _$LlmRequestImpl implements _LlmRequest {
  const _$LlmRequestImpl(
      {required this.baseUrl,
      required this.apiKey,
      required this.model,
      required final List<LlmMessage> messages,
      this.temperature = 0.7,
      this.topP = 0.9,
      this.maxTokens = 2048,
      this.stream = true})
      : _messages = messages;

  factory _$LlmRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmRequestImplFromJson(json);

  @override
  final String baseUrl;
  @override
  final String apiKey;
  @override
  final String model;
  final List<LlmMessage> _messages;
  @override
  List<LlmMessage> get messages {
    if (_messages is EqualUnmodifiableListView) return _messages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_messages);
  }

  @override
  @JsonKey()
  final double temperature;
  @override
  @JsonKey()
  final double topP;
  @override
  @JsonKey()
  final int maxTokens;
  @override
  @JsonKey()
  final bool stream;

  @override
  String toString() {
    return 'LlmRequest(baseUrl: $baseUrl, apiKey: $apiKey, model: $model, messages: $messages, temperature: $temperature, topP: $topP, maxTokens: $maxTokens, stream: $stream)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmRequestImpl &&
            (identical(other.baseUrl, baseUrl) || other.baseUrl == baseUrl) &&
            (identical(other.apiKey, apiKey) || other.apiKey == apiKey) &&
            (identical(other.model, model) || other.model == model) &&
            const DeepCollectionEquality().equals(other._messages, _messages) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.topP, topP) || other.topP == topP) &&
            (identical(other.maxTokens, maxTokens) ||
                other.maxTokens == maxTokens) &&
            (identical(other.stream, stream) || other.stream == stream));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      baseUrl,
      apiKey,
      model,
      const DeepCollectionEquality().hash(_messages),
      temperature,
      topP,
      maxTokens,
      stream);

  /// Create a copy of LlmRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LlmRequestImplCopyWith<_$LlmRequestImpl> get copyWith =>
      __$$LlmRequestImplCopyWithImpl<_$LlmRequestImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LlmRequestImplToJson(
      this,
    );
  }
}

abstract class _LlmRequest implements LlmRequest {
  const factory _LlmRequest(
      {required final String baseUrl,
      required final String apiKey,
      required final String model,
      required final List<LlmMessage> messages,
      final double temperature,
      final double topP,
      final int maxTokens,
      final bool stream}) = _$LlmRequestImpl;

  factory _LlmRequest.fromJson(Map<String, dynamic> json) =
      _$LlmRequestImpl.fromJson;

  @override
  String get baseUrl;
  @override
  String get apiKey;
  @override
  String get model;
  @override
  List<LlmMessage> get messages;
  @override
  double get temperature;
  @override
  double get topP;
  @override
  int get maxTokens;
  @override
  bool get stream;

  /// Create a copy of LlmRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmRequestImplCopyWith<_$LlmRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
