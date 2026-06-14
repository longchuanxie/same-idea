// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'llm_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LlmModel _$LlmModelFromJson(Map<String, dynamic> json) {
  return _LlmModel.fromJson(json);
}

/// @nodoc
mixin _$LlmModel {
  String get id => throw _privateConstructorUsedError;
  String get modelId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  int? get contextLength => throw _privateConstructorUsedError;
  int? get maxOutput => throw _privateConstructorUsedError;
  bool get supportsStreaming => throw _privateConstructorUsedError;
  double? get temperature => throw _privateConstructorUsedError;

  /// Serializes this LlmModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LlmModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LlmModelCopyWith<LlmModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LlmModelCopyWith<$Res> {
  factory $LlmModelCopyWith(LlmModel value, $Res Function(LlmModel) then) =
      _$LlmModelCopyWithImpl<$Res, LlmModel>;
  @useResult
  $Res call(
      {String id,
      String modelId,
      String name,
      int? contextLength,
      int? maxOutput,
      bool supportsStreaming,
      double? temperature});
}

/// @nodoc
class _$LlmModelCopyWithImpl<$Res, $Val extends LlmModel>
    implements $LlmModelCopyWith<$Res> {
  _$LlmModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LlmModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? modelId = null,
    Object? name = null,
    Object? contextLength = freezed,
    Object? maxOutput = freezed,
    Object? supportsStreaming = null,
    Object? temperature = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      modelId: null == modelId
          ? _value.modelId
          : modelId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      contextLength: freezed == contextLength
          ? _value.contextLength
          : contextLength // ignore: cast_nullable_to_non_nullable
              as int?,
      maxOutput: freezed == maxOutput
          ? _value.maxOutput
          : maxOutput // ignore: cast_nullable_to_non_nullable
              as int?,
      supportsStreaming: null == supportsStreaming
          ? _value.supportsStreaming
          : supportsStreaming // ignore: cast_nullable_to_non_nullable
              as bool,
      temperature: freezed == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$LlmModelImplCopyWith<$Res>
    implements $LlmModelCopyWith<$Res> {
  factory _$$LlmModelImplCopyWith(
          _$LlmModelImpl value, $Res Function(_$LlmModelImpl) then) =
      __$$LlmModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String modelId,
      String name,
      int? contextLength,
      int? maxOutput,
      bool supportsStreaming,
      double? temperature});
}

/// @nodoc
class __$$LlmModelImplCopyWithImpl<$Res>
    extends _$LlmModelCopyWithImpl<$Res, _$LlmModelImpl>
    implements _$$LlmModelImplCopyWith<$Res> {
  __$$LlmModelImplCopyWithImpl(
      _$LlmModelImpl _value, $Res Function(_$LlmModelImpl) _then)
      : super(_value, _then);

  /// Create a copy of LlmModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? modelId = null,
    Object? name = null,
    Object? contextLength = freezed,
    Object? maxOutput = freezed,
    Object? supportsStreaming = null,
    Object? temperature = freezed,
  }) {
    return _then(_$LlmModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      modelId: null == modelId
          ? _value.modelId
          : modelId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      contextLength: freezed == contextLength
          ? _value.contextLength
          : contextLength // ignore: cast_nullable_to_non_nullable
              as int?,
      maxOutput: freezed == maxOutput
          ? _value.maxOutput
          : maxOutput // ignore: cast_nullable_to_non_nullable
              as int?,
      supportsStreaming: null == supportsStreaming
          ? _value.supportsStreaming
          : supportsStreaming // ignore: cast_nullable_to_non_nullable
              as bool,
      temperature: freezed == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LlmModelImpl implements _LlmModel {
  const _$LlmModelImpl(
      {required this.id,
      required this.modelId,
      required this.name,
      this.contextLength,
      this.maxOutput,
      this.supportsStreaming = true,
      this.temperature});

  factory _$LlmModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$LlmModelImplFromJson(json);

  @override
  final String id;
  @override
  final String modelId;
  @override
  final String name;
  @override
  final int? contextLength;
  @override
  final int? maxOutput;
  @override
  @JsonKey()
  final bool supportsStreaming;
  @override
  final double? temperature;

  @override
  String toString() {
    return 'LlmModel(id: $id, modelId: $modelId, name: $name, contextLength: $contextLength, maxOutput: $maxOutput, supportsStreaming: $supportsStreaming, temperature: $temperature)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LlmModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.modelId, modelId) || other.modelId == modelId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.contextLength, contextLength) ||
                other.contextLength == contextLength) &&
            (identical(other.maxOutput, maxOutput) ||
                other.maxOutput == maxOutput) &&
            (identical(other.supportsStreaming, supportsStreaming) ||
                other.supportsStreaming == supportsStreaming) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, modelId, name, contextLength,
      maxOutput, supportsStreaming, temperature);

  /// Create a copy of LlmModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LlmModelImplCopyWith<_$LlmModelImpl> get copyWith =>
      __$$LlmModelImplCopyWithImpl<_$LlmModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LlmModelImplToJson(
      this,
    );
  }
}

abstract class _LlmModel implements LlmModel {
  const factory _LlmModel(
      {required final String id,
      required final String modelId,
      required final String name,
      final int? contextLength,
      final int? maxOutput,
      final bool supportsStreaming,
      final double? temperature}) = _$LlmModelImpl;

  factory _LlmModel.fromJson(Map<String, dynamic> json) =
      _$LlmModelImpl.fromJson;

  @override
  String get id;
  @override
  String get modelId;
  @override
  String get name;
  @override
  int? get contextLength;
  @override
  int? get maxOutput;
  @override
  bool get supportsStreaming;
  @override
  double? get temperature;

  /// Create a copy of LlmModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LlmModelImplCopyWith<_$LlmModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
