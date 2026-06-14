// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'export_config.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ExportConfig _$ExportConfigFromJson(Map<String, dynamic> json) {
  return _ExportConfig.fromJson(json);
}

/// @nodoc
mixin _$ExportConfig {
  String get projectId => throw _privateConstructorUsedError;
  ExportFormat get format => throw _privateConstructorUsedError;

  /// Whether to include only accepted content (default: true).
  /// When false, pending revisions are included as well.
  bool get onlyAcceptedContent => throw _privateConstructorUsedError;

  /// Whether to include a table of contents.
  bool get includeToc => throw _privateConstructorUsedError;

  /// Author name for metadata.
  String? get author => throw _privateConstructorUsedError;

  /// Book title override. Defaults to project name.
  String? get titleOverride => throw _privateConstructorUsedError;

  /// Language code (e.g. 'zh-CN').
  String get language => throw _privateConstructorUsedError;

  /// Serializes this ExportConfig to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ExportConfig
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ExportConfigCopyWith<ExportConfig> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ExportConfigCopyWith<$Res> {
  factory $ExportConfigCopyWith(
          ExportConfig value, $Res Function(ExportConfig) then) =
      _$ExportConfigCopyWithImpl<$Res, ExportConfig>;
  @useResult
  $Res call(
      {String projectId,
      ExportFormat format,
      bool onlyAcceptedContent,
      bool includeToc,
      String? author,
      String? titleOverride,
      String language});
}

/// @nodoc
class _$ExportConfigCopyWithImpl<$Res, $Val extends ExportConfig>
    implements $ExportConfigCopyWith<$Res> {
  _$ExportConfigCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ExportConfig
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? projectId = null,
    Object? format = null,
    Object? onlyAcceptedContent = null,
    Object? includeToc = null,
    Object? author = freezed,
    Object? titleOverride = freezed,
    Object? language = null,
  }) {
    return _then(_value.copyWith(
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      format: null == format
          ? _value.format
          : format // ignore: cast_nullable_to_non_nullable
              as ExportFormat,
      onlyAcceptedContent: null == onlyAcceptedContent
          ? _value.onlyAcceptedContent
          : onlyAcceptedContent // ignore: cast_nullable_to_non_nullable
              as bool,
      includeToc: null == includeToc
          ? _value.includeToc
          : includeToc // ignore: cast_nullable_to_non_nullable
              as bool,
      author: freezed == author
          ? _value.author
          : author // ignore: cast_nullable_to_non_nullable
              as String?,
      titleOverride: freezed == titleOverride
          ? _value.titleOverride
          : titleOverride // ignore: cast_nullable_to_non_nullable
              as String?,
      language: null == language
          ? _value.language
          : language // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ExportConfigImplCopyWith<$Res>
    implements $ExportConfigCopyWith<$Res> {
  factory _$$ExportConfigImplCopyWith(
          _$ExportConfigImpl value, $Res Function(_$ExportConfigImpl) then) =
      __$$ExportConfigImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String projectId,
      ExportFormat format,
      bool onlyAcceptedContent,
      bool includeToc,
      String? author,
      String? titleOverride,
      String language});
}

/// @nodoc
class __$$ExportConfigImplCopyWithImpl<$Res>
    extends _$ExportConfigCopyWithImpl<$Res, _$ExportConfigImpl>
    implements _$$ExportConfigImplCopyWith<$Res> {
  __$$ExportConfigImplCopyWithImpl(
      _$ExportConfigImpl _value, $Res Function(_$ExportConfigImpl) _then)
      : super(_value, _then);

  /// Create a copy of ExportConfig
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? projectId = null,
    Object? format = null,
    Object? onlyAcceptedContent = null,
    Object? includeToc = null,
    Object? author = freezed,
    Object? titleOverride = freezed,
    Object? language = null,
  }) {
    return _then(_$ExportConfigImpl(
      projectId: null == projectId
          ? _value.projectId
          : projectId // ignore: cast_nullable_to_non_nullable
              as String,
      format: null == format
          ? _value.format
          : format // ignore: cast_nullable_to_non_nullable
              as ExportFormat,
      onlyAcceptedContent: null == onlyAcceptedContent
          ? _value.onlyAcceptedContent
          : onlyAcceptedContent // ignore: cast_nullable_to_non_nullable
              as bool,
      includeToc: null == includeToc
          ? _value.includeToc
          : includeToc // ignore: cast_nullable_to_non_nullable
              as bool,
      author: freezed == author
          ? _value.author
          : author // ignore: cast_nullable_to_non_nullable
              as String?,
      titleOverride: freezed == titleOverride
          ? _value.titleOverride
          : titleOverride // ignore: cast_nullable_to_non_nullable
              as String?,
      language: null == language
          ? _value.language
          : language // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ExportConfigImpl extends _ExportConfig {
  const _$ExportConfigImpl(
      {required this.projectId,
      required this.format,
      this.onlyAcceptedContent = true,
      this.includeToc = false,
      this.author,
      this.titleOverride,
      this.language = 'zh-CN'})
      : super._();

  factory _$ExportConfigImpl.fromJson(Map<String, dynamic> json) =>
      _$$ExportConfigImplFromJson(json);

  @override
  final String projectId;
  @override
  final ExportFormat format;

  /// Whether to include only accepted content (default: true).
  /// When false, pending revisions are included as well.
  @override
  @JsonKey()
  final bool onlyAcceptedContent;

  /// Whether to include a table of contents.
  @override
  @JsonKey()
  final bool includeToc;

  /// Author name for metadata.
  @override
  final String? author;

  /// Book title override. Defaults to project name.
  @override
  final String? titleOverride;

  /// Language code (e.g. 'zh-CN').
  @override
  @JsonKey()
  final String language;

  @override
  String toString() {
    return 'ExportConfig(projectId: $projectId, format: $format, onlyAcceptedContent: $onlyAcceptedContent, includeToc: $includeToc, author: $author, titleOverride: $titleOverride, language: $language)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ExportConfigImpl &&
            (identical(other.projectId, projectId) ||
                other.projectId == projectId) &&
            (identical(other.format, format) || other.format == format) &&
            (identical(other.onlyAcceptedContent, onlyAcceptedContent) ||
                other.onlyAcceptedContent == onlyAcceptedContent) &&
            (identical(other.includeToc, includeToc) ||
                other.includeToc == includeToc) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.titleOverride, titleOverride) ||
                other.titleOverride == titleOverride) &&
            (identical(other.language, language) ||
                other.language == language));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, projectId, format,
      onlyAcceptedContent, includeToc, author, titleOverride, language);

  /// Create a copy of ExportConfig
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ExportConfigImplCopyWith<_$ExportConfigImpl> get copyWith =>
      __$$ExportConfigImplCopyWithImpl<_$ExportConfigImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ExportConfigImplToJson(
      this,
    );
  }
}

abstract class _ExportConfig extends ExportConfig {
  const factory _ExportConfig(
      {required final String projectId,
      required final ExportFormat format,
      final bool onlyAcceptedContent,
      final bool includeToc,
      final String? author,
      final String? titleOverride,
      final String language}) = _$ExportConfigImpl;
  const _ExportConfig._() : super._();

  factory _ExportConfig.fromJson(Map<String, dynamic> json) =
      _$ExportConfigImpl.fromJson;

  @override
  String get projectId;
  @override
  ExportFormat get format;

  /// Whether to include only accepted content (default: true).
  /// When false, pending revisions are included as well.
  @override
  bool get onlyAcceptedContent;

  /// Whether to include a table of contents.
  @override
  bool get includeToc;

  /// Author name for metadata.
  @override
  String? get author;

  /// Book title override. Defaults to project name.
  @override
  String? get titleOverride;

  /// Language code (e.g. 'zh-CN').
  @override
  String get language;

  /// Create a copy of ExportConfig
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ExportConfigImplCopyWith<_$ExportConfigImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
