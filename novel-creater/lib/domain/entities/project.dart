import 'package:freezed_annotation/freezed_annotation.dart';

part 'project.freezed.dart';
part 'project.g.dart';

@Freezed(toJson: true, fromJson: true)
class Project with _$Project {
  const factory Project({
    required String id,
    required String title,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default('') String author,
    @Default('') String description,
    @Default('zh') String language,
    @Default('') String genre,
    @Default([]) List<String> tags,
    String? defaultStyleProfileId,
    String? activeChapterId,
    @Default(false) bool localEncryptionEnabled,
    @Default(1) int schemaVersion,
  }) = _Project;

  const Project._();

  factory Project.fromJson(Map<String, dynamic> json) =>
      _$ProjectFromJson(json);
}
