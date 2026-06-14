// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'agent_writing_tool.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AgentContinueWriteResult _$AgentContinueWriteResultFromJson(
    Map<String, dynamic> json) {
  return _AgentContinueWriteResult.fromJson(json);
}

/// @nodoc
mixin _$AgentContinueWriteResult {
  String get continuedText => throw _privateConstructorUsedError;
  String get stopReason => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentContinueWriteResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentContinueWriteResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentContinueWriteResultCopyWith<AgentContinueWriteResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentContinueWriteResultCopyWith<$Res> {
  factory $AgentContinueWriteResultCopyWith(AgentContinueWriteResult value,
          $Res Function(AgentContinueWriteResult) then) =
      _$AgentContinueWriteResultCopyWithImpl<$Res, AgentContinueWriteResult>;
  @useResult
  $Res call(
      {String continuedText,
      String stopReason,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentContinueWriteResultCopyWithImpl<$Res,
        $Val extends AgentContinueWriteResult>
    implements $AgentContinueWriteResultCopyWith<$Res> {
  _$AgentContinueWriteResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentContinueWriteResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? continuedText = null,
    Object? stopReason = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      continuedText: null == continuedText
          ? _value.continuedText
          : continuedText // ignore: cast_nullable_to_non_nullable
              as String,
      stopReason: null == stopReason
          ? _value.stopReason
          : stopReason // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentContinueWriteResultImplCopyWith<$Res>
    implements $AgentContinueWriteResultCopyWith<$Res> {
  factory _$$AgentContinueWriteResultImplCopyWith(
          _$AgentContinueWriteResultImpl value,
          $Res Function(_$AgentContinueWriteResultImpl) then) =
      __$$AgentContinueWriteResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String continuedText,
      String stopReason,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentContinueWriteResultImplCopyWithImpl<$Res>
    extends _$AgentContinueWriteResultCopyWithImpl<$Res,
        _$AgentContinueWriteResultImpl>
    implements _$$AgentContinueWriteResultImplCopyWith<$Res> {
  __$$AgentContinueWriteResultImplCopyWithImpl(
      _$AgentContinueWriteResultImpl _value,
      $Res Function(_$AgentContinueWriteResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentContinueWriteResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? continuedText = null,
    Object? stopReason = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentContinueWriteResultImpl(
      continuedText: null == continuedText
          ? _value.continuedText
          : continuedText // ignore: cast_nullable_to_non_nullable
              as String,
      stopReason: null == stopReason
          ? _value.stopReason
          : stopReason // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentContinueWriteResultImpl implements _AgentContinueWriteResult {
  const _$AgentContinueWriteResultImpl(
      {required this.continuedText,
      required this.stopReason,
      required this.temperature,
      this.usedProvider,
      this.usedModel});

  factory _$AgentContinueWriteResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentContinueWriteResultImplFromJson(json);

  @override
  final String continuedText;
  @override
  final String stopReason;
  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentContinueWriteResult(continuedText: $continuedText, stopReason: $stopReason, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentContinueWriteResultImpl &&
            (identical(other.continuedText, continuedText) ||
                other.continuedText == continuedText) &&
            (identical(other.stopReason, stopReason) ||
                other.stopReason == stopReason) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, continuedText, stopReason,
      temperature, usedProvider, usedModel);

  /// Create a copy of AgentContinueWriteResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentContinueWriteResultImplCopyWith<_$AgentContinueWriteResultImpl>
      get copyWith => __$$AgentContinueWriteResultImplCopyWithImpl<
          _$AgentContinueWriteResultImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentContinueWriteResultImplToJson(
      this,
    );
  }
}

abstract class _AgentContinueWriteResult implements AgentContinueWriteResult {
  const factory _AgentContinueWriteResult(
      {required final String continuedText,
      required final String stopReason,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentContinueWriteResultImpl;

  factory _AgentContinueWriteResult.fromJson(Map<String, dynamic> json) =
      _$AgentContinueWriteResultImpl.fromJson;

  @override
  String get continuedText;
  @override
  String get stopReason;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentContinueWriteResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentContinueWriteResultImplCopyWith<_$AgentContinueWriteResultImpl>
      get copyWith => throw _privateConstructorUsedError;
}

AgentGenerateResult _$AgentGenerateResultFromJson(Map<String, dynamic> json) {
  return _AgentGenerateResult.fromJson(json);
}

/// @nodoc
mixin _$AgentGenerateResult {
  String get generatedText => throw _privateConstructorUsedError;
  String get summary => throw _privateConstructorUsedError;
  List<String> get warnings => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentGenerateResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentGenerateResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentGenerateResultCopyWith<AgentGenerateResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentGenerateResultCopyWith<$Res> {
  factory $AgentGenerateResultCopyWith(
          AgentGenerateResult value, $Res Function(AgentGenerateResult) then) =
      _$AgentGenerateResultCopyWithImpl<$Res, AgentGenerateResult>;
  @useResult
  $Res call(
      {String generatedText,
      String summary,
      List<String> warnings,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentGenerateResultCopyWithImpl<$Res, $Val extends AgentGenerateResult>
    implements $AgentGenerateResultCopyWith<$Res> {
  _$AgentGenerateResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentGenerateResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? generatedText = null,
    Object? summary = null,
    Object? warnings = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      generatedText: null == generatedText
          ? _value.generatedText
          : generatedText // ignore: cast_nullable_to_non_nullable
              as String,
      summary: null == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String,
      warnings: null == warnings
          ? _value.warnings
          : warnings // ignore: cast_nullable_to_non_nullable
              as List<String>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentGenerateResultImplCopyWith<$Res>
    implements $AgentGenerateResultCopyWith<$Res> {
  factory _$$AgentGenerateResultImplCopyWith(_$AgentGenerateResultImpl value,
          $Res Function(_$AgentGenerateResultImpl) then) =
      __$$AgentGenerateResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String generatedText,
      String summary,
      List<String> warnings,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentGenerateResultImplCopyWithImpl<$Res>
    extends _$AgentGenerateResultCopyWithImpl<$Res, _$AgentGenerateResultImpl>
    implements _$$AgentGenerateResultImplCopyWith<$Res> {
  __$$AgentGenerateResultImplCopyWithImpl(_$AgentGenerateResultImpl _value,
      $Res Function(_$AgentGenerateResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentGenerateResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? generatedText = null,
    Object? summary = null,
    Object? warnings = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentGenerateResultImpl(
      generatedText: null == generatedText
          ? _value.generatedText
          : generatedText // ignore: cast_nullable_to_non_nullable
              as String,
      summary: null == summary
          ? _value.summary
          : summary // ignore: cast_nullable_to_non_nullable
              as String,
      warnings: null == warnings
          ? _value._warnings
          : warnings // ignore: cast_nullable_to_non_nullable
              as List<String>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentGenerateResultImpl implements _AgentGenerateResult {
  const _$AgentGenerateResultImpl(
      {required this.generatedText,
      required this.summary,
      final List<String> warnings = const <String>[],
      required this.temperature,
      this.usedProvider,
      this.usedModel})
      : _warnings = warnings;

  factory _$AgentGenerateResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentGenerateResultImplFromJson(json);

  @override
  final String generatedText;
  @override
  final String summary;
  final List<String> _warnings;
  @override
  @JsonKey()
  List<String> get warnings {
    if (_warnings is EqualUnmodifiableListView) return _warnings;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_warnings);
  }

  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentGenerateResult(generatedText: $generatedText, summary: $summary, warnings: $warnings, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentGenerateResultImpl &&
            (identical(other.generatedText, generatedText) ||
                other.generatedText == generatedText) &&
            (identical(other.summary, summary) || other.summary == summary) &&
            const DeepCollectionEquality().equals(other._warnings, _warnings) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      generatedText,
      summary,
      const DeepCollectionEquality().hash(_warnings),
      temperature,
      usedProvider,
      usedModel);

  /// Create a copy of AgentGenerateResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentGenerateResultImplCopyWith<_$AgentGenerateResultImpl> get copyWith =>
      __$$AgentGenerateResultImplCopyWithImpl<_$AgentGenerateResultImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentGenerateResultImplToJson(
      this,
    );
  }
}

abstract class _AgentGenerateResult implements AgentGenerateResult {
  const factory _AgentGenerateResult(
      {required final String generatedText,
      required final String summary,
      final List<String> warnings,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentGenerateResultImpl;

  factory _AgentGenerateResult.fromJson(Map<String, dynamic> json) =
      _$AgentGenerateResultImpl.fromJson;

  @override
  String get generatedText;
  @override
  String get summary;
  @override
  List<String> get warnings;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentGenerateResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentGenerateResultImplCopyWith<_$AgentGenerateResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgentRewriteResult _$AgentRewriteResultFromJson(Map<String, dynamic> json) {
  return _AgentRewriteResult.fromJson(json);
}

/// @nodoc
mixin _$AgentRewriteResult {
  String get revisedText => throw _privateConstructorUsedError;
  String get changeSummary => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentRewriteResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentRewriteResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentRewriteResultCopyWith<AgentRewriteResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentRewriteResultCopyWith<$Res> {
  factory $AgentRewriteResultCopyWith(
          AgentRewriteResult value, $Res Function(AgentRewriteResult) then) =
      _$AgentRewriteResultCopyWithImpl<$Res, AgentRewriteResult>;
  @useResult
  $Res call(
      {String revisedText,
      String changeSummary,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentRewriteResultCopyWithImpl<$Res, $Val extends AgentRewriteResult>
    implements $AgentRewriteResultCopyWith<$Res> {
  _$AgentRewriteResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentRewriteResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? revisedText = null,
    Object? changeSummary = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      revisedText: null == revisedText
          ? _value.revisedText
          : revisedText // ignore: cast_nullable_to_non_nullable
              as String,
      changeSummary: null == changeSummary
          ? _value.changeSummary
          : changeSummary // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentRewriteResultImplCopyWith<$Res>
    implements $AgentRewriteResultCopyWith<$Res> {
  factory _$$AgentRewriteResultImplCopyWith(_$AgentRewriteResultImpl value,
          $Res Function(_$AgentRewriteResultImpl) then) =
      __$$AgentRewriteResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String revisedText,
      String changeSummary,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentRewriteResultImplCopyWithImpl<$Res>
    extends _$AgentRewriteResultCopyWithImpl<$Res, _$AgentRewriteResultImpl>
    implements _$$AgentRewriteResultImplCopyWith<$Res> {
  __$$AgentRewriteResultImplCopyWithImpl(_$AgentRewriteResultImpl _value,
      $Res Function(_$AgentRewriteResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentRewriteResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? revisedText = null,
    Object? changeSummary = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentRewriteResultImpl(
      revisedText: null == revisedText
          ? _value.revisedText
          : revisedText // ignore: cast_nullable_to_non_nullable
              as String,
      changeSummary: null == changeSummary
          ? _value.changeSummary
          : changeSummary // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentRewriteResultImpl implements _AgentRewriteResult {
  const _$AgentRewriteResultImpl(
      {required this.revisedText,
      required this.changeSummary,
      required this.temperature,
      this.usedProvider,
      this.usedModel});

  factory _$AgentRewriteResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentRewriteResultImplFromJson(json);

  @override
  final String revisedText;
  @override
  final String changeSummary;
  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentRewriteResult(revisedText: $revisedText, changeSummary: $changeSummary, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentRewriteResultImpl &&
            (identical(other.revisedText, revisedText) ||
                other.revisedText == revisedText) &&
            (identical(other.changeSummary, changeSummary) ||
                other.changeSummary == changeSummary) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, revisedText, changeSummary,
      temperature, usedProvider, usedModel);

  /// Create a copy of AgentRewriteResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentRewriteResultImplCopyWith<_$AgentRewriteResultImpl> get copyWith =>
      __$$AgentRewriteResultImplCopyWithImpl<_$AgentRewriteResultImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentRewriteResultImplToJson(
      this,
    );
  }
}

abstract class _AgentRewriteResult implements AgentRewriteResult {
  const factory _AgentRewriteResult(
      {required final String revisedText,
      required final String changeSummary,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentRewriteResultImpl;

  factory _AgentRewriteResult.fromJson(Map<String, dynamic> json) =
      _$AgentRewriteResultImpl.fromJson;

  @override
  String get revisedText;
  @override
  String get changeSummary;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentRewriteResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentRewriteResultImplCopyWith<_$AgentRewriteResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgentExpandResult _$AgentExpandResultFromJson(Map<String, dynamic> json) {
  return _AgentExpandResult.fromJson(json);
}

/// @nodoc
mixin _$AgentExpandResult {
  String get expandedText => throw _privateConstructorUsedError;
  String get additionsSummary => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentExpandResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentExpandResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentExpandResultCopyWith<AgentExpandResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentExpandResultCopyWith<$Res> {
  factory $AgentExpandResultCopyWith(
          AgentExpandResult value, $Res Function(AgentExpandResult) then) =
      _$AgentExpandResultCopyWithImpl<$Res, AgentExpandResult>;
  @useResult
  $Res call(
      {String expandedText,
      String additionsSummary,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentExpandResultCopyWithImpl<$Res, $Val extends AgentExpandResult>
    implements $AgentExpandResultCopyWith<$Res> {
  _$AgentExpandResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentExpandResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? expandedText = null,
    Object? additionsSummary = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      expandedText: null == expandedText
          ? _value.expandedText
          : expandedText // ignore: cast_nullable_to_non_nullable
              as String,
      additionsSummary: null == additionsSummary
          ? _value.additionsSummary
          : additionsSummary // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentExpandResultImplCopyWith<$Res>
    implements $AgentExpandResultCopyWith<$Res> {
  factory _$$AgentExpandResultImplCopyWith(_$AgentExpandResultImpl value,
          $Res Function(_$AgentExpandResultImpl) then) =
      __$$AgentExpandResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String expandedText,
      String additionsSummary,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentExpandResultImplCopyWithImpl<$Res>
    extends _$AgentExpandResultCopyWithImpl<$Res, _$AgentExpandResultImpl>
    implements _$$AgentExpandResultImplCopyWith<$Res> {
  __$$AgentExpandResultImplCopyWithImpl(_$AgentExpandResultImpl _value,
      $Res Function(_$AgentExpandResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentExpandResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? expandedText = null,
    Object? additionsSummary = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentExpandResultImpl(
      expandedText: null == expandedText
          ? _value.expandedText
          : expandedText // ignore: cast_nullable_to_non_nullable
              as String,
      additionsSummary: null == additionsSummary
          ? _value.additionsSummary
          : additionsSummary // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentExpandResultImpl implements _AgentExpandResult {
  const _$AgentExpandResultImpl(
      {required this.expandedText,
      required this.additionsSummary,
      required this.temperature,
      this.usedProvider,
      this.usedModel});

  factory _$AgentExpandResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentExpandResultImplFromJson(json);

  @override
  final String expandedText;
  @override
  final String additionsSummary;
  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentExpandResult(expandedText: $expandedText, additionsSummary: $additionsSummary, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentExpandResultImpl &&
            (identical(other.expandedText, expandedText) ||
                other.expandedText == expandedText) &&
            (identical(other.additionsSummary, additionsSummary) ||
                other.additionsSummary == additionsSummary) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, expandedText, additionsSummary,
      temperature, usedProvider, usedModel);

  /// Create a copy of AgentExpandResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentExpandResultImplCopyWith<_$AgentExpandResultImpl> get copyWith =>
      __$$AgentExpandResultImplCopyWithImpl<_$AgentExpandResultImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentExpandResultImplToJson(
      this,
    );
  }
}

abstract class _AgentExpandResult implements AgentExpandResult {
  const factory _AgentExpandResult(
      {required final String expandedText,
      required final String additionsSummary,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentExpandResultImpl;

  factory _AgentExpandResult.fromJson(Map<String, dynamic> json) =
      _$AgentExpandResultImpl.fromJson;

  @override
  String get expandedText;
  @override
  String get additionsSummary;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentExpandResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentExpandResultImplCopyWith<_$AgentExpandResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgentCondenseResult _$AgentCondenseResultFromJson(Map<String, dynamic> json) {
  return _AgentCondenseResult.fromJson(json);
}

/// @nodoc
mixin _$AgentCondenseResult {
  String get condensedText => throw _privateConstructorUsedError;
  List<String> get removedPoints => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentCondenseResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentCondenseResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentCondenseResultCopyWith<AgentCondenseResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentCondenseResultCopyWith<$Res> {
  factory $AgentCondenseResultCopyWith(
          AgentCondenseResult value, $Res Function(AgentCondenseResult) then) =
      _$AgentCondenseResultCopyWithImpl<$Res, AgentCondenseResult>;
  @useResult
  $Res call(
      {String condensedText,
      List<String> removedPoints,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentCondenseResultCopyWithImpl<$Res, $Val extends AgentCondenseResult>
    implements $AgentCondenseResultCopyWith<$Res> {
  _$AgentCondenseResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentCondenseResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? condensedText = null,
    Object? removedPoints = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      condensedText: null == condensedText
          ? _value.condensedText
          : condensedText // ignore: cast_nullable_to_non_nullable
              as String,
      removedPoints: null == removedPoints
          ? _value.removedPoints
          : removedPoints // ignore: cast_nullable_to_non_nullable
              as List<String>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentCondenseResultImplCopyWith<$Res>
    implements $AgentCondenseResultCopyWith<$Res> {
  factory _$$AgentCondenseResultImplCopyWith(_$AgentCondenseResultImpl value,
          $Res Function(_$AgentCondenseResultImpl) then) =
      __$$AgentCondenseResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String condensedText,
      List<String> removedPoints,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentCondenseResultImplCopyWithImpl<$Res>
    extends _$AgentCondenseResultCopyWithImpl<$Res, _$AgentCondenseResultImpl>
    implements _$$AgentCondenseResultImplCopyWith<$Res> {
  __$$AgentCondenseResultImplCopyWithImpl(_$AgentCondenseResultImpl _value,
      $Res Function(_$AgentCondenseResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentCondenseResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? condensedText = null,
    Object? removedPoints = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentCondenseResultImpl(
      condensedText: null == condensedText
          ? _value.condensedText
          : condensedText // ignore: cast_nullable_to_non_nullable
              as String,
      removedPoints: null == removedPoints
          ? _value._removedPoints
          : removedPoints // ignore: cast_nullable_to_non_nullable
              as List<String>,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentCondenseResultImpl implements _AgentCondenseResult {
  const _$AgentCondenseResultImpl(
      {required this.condensedText,
      final List<String> removedPoints = const <String>[],
      required this.temperature,
      this.usedProvider,
      this.usedModel})
      : _removedPoints = removedPoints;

  factory _$AgentCondenseResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentCondenseResultImplFromJson(json);

  @override
  final String condensedText;
  final List<String> _removedPoints;
  @override
  @JsonKey()
  List<String> get removedPoints {
    if (_removedPoints is EqualUnmodifiableListView) return _removedPoints;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_removedPoints);
  }

  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentCondenseResult(condensedText: $condensedText, removedPoints: $removedPoints, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentCondenseResultImpl &&
            (identical(other.condensedText, condensedText) ||
                other.condensedText == condensedText) &&
            const DeepCollectionEquality()
                .equals(other._removedPoints, _removedPoints) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      condensedText,
      const DeepCollectionEquality().hash(_removedPoints),
      temperature,
      usedProvider,
      usedModel);

  /// Create a copy of AgentCondenseResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentCondenseResultImplCopyWith<_$AgentCondenseResultImpl> get copyWith =>
      __$$AgentCondenseResultImplCopyWithImpl<_$AgentCondenseResultImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentCondenseResultImplToJson(
      this,
    );
  }
}

abstract class _AgentCondenseResult implements AgentCondenseResult {
  const factory _AgentCondenseResult(
      {required final String condensedText,
      final List<String> removedPoints,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentCondenseResultImpl;

  factory _AgentCondenseResult.fromJson(Map<String, dynamic> json) =
      _$AgentCondenseResultImpl.fromJson;

  @override
  String get condensedText;
  @override
  List<String> get removedPoints;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentCondenseResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentCondenseResultImplCopyWith<_$AgentCondenseResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgentPolishResult _$AgentPolishResultFromJson(Map<String, dynamic> json) {
  return _AgentPolishResult.fromJson(json);
}

/// @nodoc
mixin _$AgentPolishResult {
  String get polishedText => throw _privateConstructorUsedError;
  String get styleNotes => throw _privateConstructorUsedError;
  double get temperature => throw _privateConstructorUsedError;
  String? get usedProvider => throw _privateConstructorUsedError;
  String? get usedModel => throw _privateConstructorUsedError;

  /// Serializes this AgentPolishResult to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AgentPolishResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AgentPolishResultCopyWith<AgentPolishResult> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgentPolishResultCopyWith<$Res> {
  factory $AgentPolishResultCopyWith(
          AgentPolishResult value, $Res Function(AgentPolishResult) then) =
      _$AgentPolishResultCopyWithImpl<$Res, AgentPolishResult>;
  @useResult
  $Res call(
      {String polishedText,
      String styleNotes,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class _$AgentPolishResultCopyWithImpl<$Res, $Val extends AgentPolishResult>
    implements $AgentPolishResultCopyWith<$Res> {
  _$AgentPolishResultCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AgentPolishResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? polishedText = null,
    Object? styleNotes = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_value.copyWith(
      polishedText: null == polishedText
          ? _value.polishedText
          : polishedText // ignore: cast_nullable_to_non_nullable
              as String,
      styleNotes: null == styleNotes
          ? _value.styleNotes
          : styleNotes // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgentPolishResultImplCopyWith<$Res>
    implements $AgentPolishResultCopyWith<$Res> {
  factory _$$AgentPolishResultImplCopyWith(_$AgentPolishResultImpl value,
          $Res Function(_$AgentPolishResultImpl) then) =
      __$$AgentPolishResultImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String polishedText,
      String styleNotes,
      double temperature,
      String? usedProvider,
      String? usedModel});
}

/// @nodoc
class __$$AgentPolishResultImplCopyWithImpl<$Res>
    extends _$AgentPolishResultCopyWithImpl<$Res, _$AgentPolishResultImpl>
    implements _$$AgentPolishResultImplCopyWith<$Res> {
  __$$AgentPolishResultImplCopyWithImpl(_$AgentPolishResultImpl _value,
      $Res Function(_$AgentPolishResultImpl) _then)
      : super(_value, _then);

  /// Create a copy of AgentPolishResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? polishedText = null,
    Object? styleNotes = null,
    Object? temperature = null,
    Object? usedProvider = freezed,
    Object? usedModel = freezed,
  }) {
    return _then(_$AgentPolishResultImpl(
      polishedText: null == polishedText
          ? _value.polishedText
          : polishedText // ignore: cast_nullable_to_non_nullable
              as String,
      styleNotes: null == styleNotes
          ? _value.styleNotes
          : styleNotes // ignore: cast_nullable_to_non_nullable
              as String,
      temperature: null == temperature
          ? _value.temperature
          : temperature // ignore: cast_nullable_to_non_nullable
              as double,
      usedProvider: freezed == usedProvider
          ? _value.usedProvider
          : usedProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      usedModel: freezed == usedModel
          ? _value.usedModel
          : usedModel // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgentPolishResultImpl implements _AgentPolishResult {
  const _$AgentPolishResultImpl(
      {required this.polishedText,
      required this.styleNotes,
      required this.temperature,
      this.usedProvider,
      this.usedModel});

  factory _$AgentPolishResultImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgentPolishResultImplFromJson(json);

  @override
  final String polishedText;
  @override
  final String styleNotes;
  @override
  final double temperature;
  @override
  final String? usedProvider;
  @override
  final String? usedModel;

  @override
  String toString() {
    return 'AgentPolishResult(polishedText: $polishedText, styleNotes: $styleNotes, temperature: $temperature, usedProvider: $usedProvider, usedModel: $usedModel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgentPolishResultImpl &&
            (identical(other.polishedText, polishedText) ||
                other.polishedText == polishedText) &&
            (identical(other.styleNotes, styleNotes) ||
                other.styleNotes == styleNotes) &&
            (identical(other.temperature, temperature) ||
                other.temperature == temperature) &&
            (identical(other.usedProvider, usedProvider) ||
                other.usedProvider == usedProvider) &&
            (identical(other.usedModel, usedModel) ||
                other.usedModel == usedModel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, polishedText, styleNotes,
      temperature, usedProvider, usedModel);

  /// Create a copy of AgentPolishResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AgentPolishResultImplCopyWith<_$AgentPolishResultImpl> get copyWith =>
      __$$AgentPolishResultImplCopyWithImpl<_$AgentPolishResultImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgentPolishResultImplToJson(
      this,
    );
  }
}

abstract class _AgentPolishResult implements AgentPolishResult {
  const factory _AgentPolishResult(
      {required final String polishedText,
      required final String styleNotes,
      required final double temperature,
      final String? usedProvider,
      final String? usedModel}) = _$AgentPolishResultImpl;

  factory _AgentPolishResult.fromJson(Map<String, dynamic> json) =
      _$AgentPolishResultImpl.fromJson;

  @override
  String get polishedText;
  @override
  String get styleNotes;
  @override
  double get temperature;
  @override
  String? get usedProvider;
  @override
  String? get usedModel;

  /// Create a copy of AgentPolishResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AgentPolishResultImplCopyWith<_$AgentPolishResultImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
