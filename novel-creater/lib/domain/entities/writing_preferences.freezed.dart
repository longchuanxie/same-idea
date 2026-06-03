// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'writing_preferences.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

WritingPreferences _$WritingPreferencesFromJson(Map<String, dynamic> json) {
  return _WritingPreferences.fromJson(json);
}

/// @nodoc
mixin _$WritingPreferences {
  String get language => throw _privateConstructorUsedError;
  String get defaultStyle => throw _privateConstructorUsedError;
  bool get autoSuggest => throw _privateConstructorUsedError;
  int get defaultGenerateLength => throw _privateConstructorUsedError;

  /// Serializes this WritingPreferences to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WritingPreferences
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WritingPreferencesCopyWith<WritingPreferences> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WritingPreferencesCopyWith<$Res> {
  factory $WritingPreferencesCopyWith(
          WritingPreferences value, $Res Function(WritingPreferences) then) =
      _$WritingPreferencesCopyWithImpl<$Res, WritingPreferences>;
  @useResult
  $Res call(
      {String language,
      String defaultStyle,
      bool autoSuggest,
      int defaultGenerateLength});
}

/// @nodoc
class _$WritingPreferencesCopyWithImpl<$Res, $Val extends WritingPreferences>
    implements $WritingPreferencesCopyWith<$Res> {
  _$WritingPreferencesCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WritingPreferences
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? language = null,
    Object? defaultStyle = null,
    Object? autoSuggest = null,
    Object? defaultGenerateLength = null,
  }) {
    return _then(_value.copyWith(
      language: null == language
          ? _value.language
          : language // ignore: cast_nullable_to_non_nullable
              as String,
      defaultStyle: null == defaultStyle
          ? _value.defaultStyle
          : defaultStyle // ignore: cast_nullable_to_non_nullable
              as String,
      autoSuggest: null == autoSuggest
          ? _value.autoSuggest
          : autoSuggest // ignore: cast_nullable_to_non_nullable
              as bool,
      defaultGenerateLength: null == defaultGenerateLength
          ? _value.defaultGenerateLength
          : defaultGenerateLength // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$WritingPreferencesImplCopyWith<$Res>
    implements $WritingPreferencesCopyWith<$Res> {
  factory _$$WritingPreferencesImplCopyWith(_$WritingPreferencesImpl value,
          $Res Function(_$WritingPreferencesImpl) then) =
      __$$WritingPreferencesImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String language,
      String defaultStyle,
      bool autoSuggest,
      int defaultGenerateLength});
}

/// @nodoc
class __$$WritingPreferencesImplCopyWithImpl<$Res>
    extends _$WritingPreferencesCopyWithImpl<$Res, _$WritingPreferencesImpl>
    implements _$$WritingPreferencesImplCopyWith<$Res> {
  __$$WritingPreferencesImplCopyWithImpl(_$WritingPreferencesImpl _value,
      $Res Function(_$WritingPreferencesImpl) _then)
      : super(_value, _then);

  /// Create a copy of WritingPreferences
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? language = null,
    Object? defaultStyle = null,
    Object? autoSuggest = null,
    Object? defaultGenerateLength = null,
  }) {
    return _then(_$WritingPreferencesImpl(
      language: null == language
          ? _value.language
          : language // ignore: cast_nullable_to_non_nullable
              as String,
      defaultStyle: null == defaultStyle
          ? _value.defaultStyle
          : defaultStyle // ignore: cast_nullable_to_non_nullable
              as String,
      autoSuggest: null == autoSuggest
          ? _value.autoSuggest
          : autoSuggest // ignore: cast_nullable_to_non_nullable
              as bool,
      defaultGenerateLength: null == defaultGenerateLength
          ? _value.defaultGenerateLength
          : defaultGenerateLength // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$WritingPreferencesImpl implements _WritingPreferences {
  const _$WritingPreferencesImpl(
      {this.language = 'zh',
      this.defaultStyle = '',
      this.autoSuggest = false,
      this.defaultGenerateLength = 2000});

  factory _$WritingPreferencesImpl.fromJson(Map<String, dynamic> json) =>
      _$$WritingPreferencesImplFromJson(json);

  @override
  @JsonKey()
  final String language;
  @override
  @JsonKey()
  final String defaultStyle;
  @override
  @JsonKey()
  final bool autoSuggest;
  @override
  @JsonKey()
  final int defaultGenerateLength;

  @override
  String toString() {
    return 'WritingPreferences(language: $language, defaultStyle: $defaultStyle, autoSuggest: $autoSuggest, defaultGenerateLength: $defaultGenerateLength)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WritingPreferencesImpl &&
            (identical(other.language, language) ||
                other.language == language) &&
            (identical(other.defaultStyle, defaultStyle) ||
                other.defaultStyle == defaultStyle) &&
            (identical(other.autoSuggest, autoSuggest) ||
                other.autoSuggest == autoSuggest) &&
            (identical(other.defaultGenerateLength, defaultGenerateLength) ||
                other.defaultGenerateLength == defaultGenerateLength));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, language, defaultStyle, autoSuggest, defaultGenerateLength);

  /// Create a copy of WritingPreferences
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WritingPreferencesImplCopyWith<_$WritingPreferencesImpl> get copyWith =>
      __$$WritingPreferencesImplCopyWithImpl<_$WritingPreferencesImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$WritingPreferencesImplToJson(
      this,
    );
  }
}

abstract class _WritingPreferences implements WritingPreferences {
  const factory _WritingPreferences(
      {final String language,
      final String defaultStyle,
      final bool autoSuggest,
      final int defaultGenerateLength}) = _$WritingPreferencesImpl;

  factory _WritingPreferences.fromJson(Map<String, dynamic> json) =
      _$WritingPreferencesImpl.fromJson;

  @override
  String get language;
  @override
  String get defaultStyle;
  @override
  bool get autoSuggest;
  @override
  int get defaultGenerateLength;

  /// Create a copy of WritingPreferences
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WritingPreferencesImplCopyWith<_$WritingPreferencesImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
