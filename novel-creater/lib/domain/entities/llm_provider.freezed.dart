// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_provider.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LlmProvider _$LlmProviderFromJson(Map<String, dynamic> json) {
  return _LlmProvider.fromJson(json);
}

/// @nodoc
mixin _$LlmProvider {
  String get id => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String get baseUrl => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String get apiKey => throw _privateConstructorUsedError;
  String get defaultModel => throw _privateConstructorUsedError;
  bool get enabled => throw _privateConstructorUsedError;

  /// Serializes this LlmProvider to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LlmProviderCopyWith<LlmProvider> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmProviderCopyWith<$Res> {
  factory $LlmProviderCopyWith(
          LlmProvider value, $Res Function(LlmProvider) then) =
      _$LlmProviderCopyWithImpl<$Res, LlmProvider>;
  @useResult
  $Res call(
      {String id,
      String displayName,
      String baseUrl,
      DateTime createdAt,
      DateTime updatedAt,
      String apiKey,
      String defaultModel,
      bool enabled});
}

/// @nodoc
class _$LlmProviderCopyWithImpl<$Res, $Val extends LlmProvider>
    implements $LlmProviderCopyWith<$Res> {
  _$LlmProviderCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? baseUrl = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? apiKey = null,
    Object? defaultModel = null,
    Object? enabled = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      defaultModel: null == defaultModel
          ? _value.defaultModel
          : defaultModel // ignore: cast_nullable_to_non_nullable
              as String,
      enabled: null == enabled
          ? _value.enabled
          : enabled // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LlmProviderImplCopyWith<$Res>
    implements $LlmProviderCopyWith<$Res> {
  factory _$$LlmProviderImplCopyWith(
          _$LlmProviderImpl value, $Res Function(_$LlmProviderImpl) then) =
      __$$LlmProviderImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String displayName,
      String baseUrl,
      DateTime createdAt,
      DateTime updatedAt,
      String apiKey,
      String defaultModel,
      bool enabled});
}

/// @nodoc
class __$$LlmProviderImplCopyWithImpl<$Res>
    extends _$LlmProviderCopyWithImpl<$Res, _$LlmProviderImpl>
    implements _$$LlmProviderImplCopyWith<$Res> {
  __$$LlmProviderImplCopyWithImpl(
      _$LlmProviderImpl _value, $Res Function(_$LlmProviderImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? baseUrl = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? apiKey = null,
    Object? defaultModel = null,
    Object? enabled = null,
  }) {
    return _then(_$LlmProviderImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      displayName: null == displayName
          ? _value.displayName
          : displayName // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      defaultModel: null == defaultModel
          ? _value.defaultModel
          : defaultModel // ignore: cast_nullable_to_non_nullable
              as String,
      enabled: null == enabled
          ? _value.enabled
          : enabled // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LlmProviderImpl implements _LlmProvider {
  const _$LlmProviderImpl(
      {required this.id,
      required this.displayName,
      required this.baseUrl,
      required this.createdAt,
      required this.updatedAt,
      this.apiKey = '',
      this.defaultModel = 'gpt-4o-mini',
      this.enabled = true});

  factory _$LlmProviderImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmProviderImplFromJson(json);

  @override
  final String id;
  @override
  final String displayName;
  @override
  final String baseUrl;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  @JsonKey()
  final String apiKey;
  @override
  @JsonKey()
  final String defaultModel;
  @override
  @JsonKey()
  final bool enabled;

  @override
  String toString() {
    return 'LlmProvider(id: $id, displayName: $displayName, baseUrl: $baseUrl, createdAt: $createdAt, updatedAt: $updatedAt, apiKey: $apiKey, defaultModel: $defaultModel, enabled: $enabled)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmProviderImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.baseUrl, baseUrl) || other.baseUrl == baseUrl) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.apiKey, apiKey) || other.apiKey == apiKey) &&
            (identical(other.defaultModel, defaultModel) ||
                other.defaultModel == defaultModel) &&
            (identical(other.enabled, enabled) || other.enabled == enabled));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, displayName, baseUrl,
      createdAt, updatedAt, apiKey, defaultModel, enabled);

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LlmProviderImplCopyWith<_$LlmProviderImpl> get copyWith =>
      __$$LlmProviderImplCopyWithImpl<_$LlmProviderImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LlmProviderImplToJson(
      this,
    );
  }
}

abstract class _LlmProvider implements LlmProvider {
  const factory _LlmProvider(
      {required final String id,
      required final String displayName,
      required final String baseUrl,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final String apiKey,
      final String defaultModel,
      final bool enabled}) = _$LlmProviderImpl;

  factory _LlmProvider.fromJson(Map<String, dynamic> json) =
      _$LlmProviderImpl.fromJson;

  @override
  String get id;
  @override
  String get displayName;
  @override
  String get baseUrl;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  String get apiKey;
  @override
  String get defaultModel;
  @override
  bool get enabled;

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmProviderImplCopyWith<_$LlmProviderImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
