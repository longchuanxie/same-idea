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
  String get projectId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get baseUrl => throw _privateConstructorUsedError;
  String get secretKeyRef => throw _privateConstructorUsedError;
  String? get selectedModelId => throw _privateConstructorUsedError;
  ProviderStatus get status => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  List<LlmModel> get cachedModels => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  double get topP => throw _privateConstructorUsedError;
  bool get streamingEnabled => throw _privateConstructorUsedError;
  int get schemaVersion => throw _privateConstructorUsedError;

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
      String projectId,
      String name,
      String baseUrl,
      String secretKeyRef,
      String? selectedModelId,
      ProviderStatus status,
      DateTime createdAt,
      DateTime updatedAt,
      List<LlmModel> cachedModels,
      double temperature,
      double topP,
      bool streamingEnabled,
      int schemaVersion});
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
    Object? projectId = null,
    Object? name = null,
    Object? baseUrl = null,
    Object? secretKeyRef = null,
    Object? selectedModelId = freezed,
    Object? status = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? cachedModels = null,
    Object? temperature = null,
    Object? topP = null,
    Object? streamingEnabled = null,
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
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      secretKeyRef: null == secretKeyRef
          ? _value.secretKeyRef
          : secretKeyRef // ignore: cast_nullable_to_non_nullable
              as String,
      selectedModelId: freezed == selectedModelId
          ? _value.selectedModelId
          : selectedModelId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ProviderStatus,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      cachedModels: null == cachedModels
          ? _value.cachedModels
          : cachedModels // ignore: cast_nullable_to_non_nullable
              as List<LlmModel>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      topP: null == topP
          ? _value.topP
          : topP // ignore: cast_nullable_to_non_nullable
              as double,
      streamingEnabled: null == streamingEnabled
          ? _value.streamingEnabled
          : streamingEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
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
      String projectId,
      String name,
      String baseUrl,
      String secretKeyRef,
      String? selectedModelId,
      ProviderStatus status,
      DateTime createdAt,
      DateTime updatedAt,
      List<LlmModel> cachedModels,
      double temperature,
      double topP,
      bool streamingEnabled,
      int schemaVersion});
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
    Object? projectId = null,
    Object? name = null,
    Object? baseUrl = null,
    Object? secretKeyRef = null,
    Object? selectedModelId = freezed,
    Object? status = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? cachedModels = null,
    Object? temperature = null,
    Object? topP = null,
    Object? streamingEnabled = null,
    Object? schemaVersion = null,
  }) {
    return _then(_$LlmProviderImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      secretKeyRef: null == secretKeyRef
          ? _value.secretKeyRef
          : secretKeyRef // ignore: cast_nullable_to_non_nullable
              as String,
      selectedModelId: freezed == selectedModelId
          ? _value.selectedModelId
          : selectedModelId // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ProviderStatus,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      cachedModels: null == cachedModels
          ? _value._cachedModels
          : cachedModels // ignore: cast_nullable_to_non_nullable
              as List<LlmModel>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      topP: null == topP
          ? _value.topP
          : topP // ignore: cast_nullable_to_non_nullable
              as double,
      streamingEnabled: null == streamingEnabled
          ? _value.streamingEnabled
          : streamingEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      schemaVersion: null == schemaVersion
          ? _value.schemaVersion
          : schemaVersion // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc

@JsonSerializable(explicitToJson: true)
class _$LlmProviderImpl implements _LlmProvider {
  const _$LlmProviderImpl(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.baseUrl,
      required this.secretKeyRef,
      required this.selectedModelId,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      final List<LlmModel> cachedModels = const <LlmModel>[],
      this.temperature = 0.7,
      this.topP = 0.9,
      this.streamingEnabled = true,
      this.schemaVersion = 1})
      : _cachedModels = cachedModels;

  factory _$LlmProviderImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmProviderImplFromJson(json);

  @override
  final String id;
  @override
  final String projectId;
  @override
  final String name;
  @override
  final String baseUrl;
  @override
  final String secretKeyRef;
  @override
  final String? selectedModelId;
  @override
  final ProviderStatus status;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  final List<LlmModel> _cachedModels;
  @override
  @JsonKey()
  List<LlmModel> get cachedModels {
    if (_cachedModels is EqualUnmodifiableListView) return _cachedModels;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_cachedModels);
  }

  @override
  @JsonKey()
  final double temperature;
  @override
  @JsonKey()
  final double topP;
  @override
  @JsonKey()
  final bool streamingEnabled;
  @override
  @JsonKey()
  final int schemaVersion;

  @override
  String toString() {
    return 'LlmProvider(id: $id, projectId: $projectId, name: $name, baseUrl: $baseUrl, secretKeyRef: $secretKeyRef, selectedModelId: $selectedModelId, status: $status, createdAt: $createdAt, updatedAt: $updatedAt, cachedModels: $cachedModels, temperature: $temperature, topP: $topP, streamingEnabled: $streamingEnabled, schemaVersion: $schemaVersion)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmProviderImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.baseUrl, baseUrl) || other.baseUrl == baseUrl) &&
            (identical(other.secretKeyRef, secretKeyRef) ||
                other.secretKeyRef == secretKeyRef) &&
            (identical(other.selectedModelId, selectedModelId) ||
                other.selectedModelId == selectedModelId) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality()
                .equals(other._cachedModels, _cachedModels) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.topP, topP) || other.topP == topP) &&
            (identical(other.streamingEnabled, streamingEnabled) ||
                other.streamingEnabled == streamingEnabled) &&
            (identical(other.schemaVersion, schemaVersion) ||
                other.schemaVersion == schemaVersion));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      projectId,
      name,
      baseUrl,
      secretKeyRef,
      selectedModelId,
      status,
      createdAt,
      updatedAt,
      const DeepCollectionEquality().hash(_cachedModels),
      temperature,
      topP,
      streamingEnabled,
      schemaVersion);

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
      required final String projectId,
      required final String name,
      required final String baseUrl,
      required final String secretKeyRef,
      required final String? selectedModelId,
      required final ProviderStatus status,
      required final DateTime createdAt,
      required final DateTime updatedAt,
      final List<LlmModel> cachedModels,
      final double temperature,
      final double topP,
      final bool streamingEnabled,
      final int schemaVersion}) = _$LlmProviderImpl;

  factory _LlmProvider.fromJson(Map<String, dynamic> json) =
      _$LlmProviderImpl.fromJson;

  @override
  String get id;
  @override
  String get projectId;
  @override
  String get name;
  @override
  String get baseUrl;
  @override
  String get secretKeyRef;
  @override
  String? get selectedModelId;
  @override
  ProviderStatus get status;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  List<LlmModel> get cachedModels;
  @override
  double get temperature;
  @override
  double get topP;
  @override
  bool get streamingEnabled;
  @override
  int get schemaVersion;

  /// Create a copy of LlmProvider
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmProviderImplCopyWith<_$LlmProviderImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
