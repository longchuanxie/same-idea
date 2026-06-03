import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/enums/content_format.dart';

part 'chapter.freezed.dart';
part 'chapter.g.dart';

@Freezed(toJson: true, fromJson: true)
class Chapter with _$Chapter {
  const factory Chapter({
    required String id,
    required String projectId,
    required String title,
    required int order,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? outlineNodeId,
    @Default(ContentFormat.markdown) ContentFormat contentFormat,
    @Default('') String content,
    @Default('') String plainTextCache,
    @Default(0) int wordCount,
    @Default(ChapterStatus.draft) ChapterStatus status,
    @Default(1) int schemaVersion,
  }) = _Chapter;

  const Chapter._();

  factory Chapter.fromJson(Map<String, dynamic> json) =>
      _$ChapterFromJson(json);

  int get effectiveWordCount =>
      plainTextCache.isNotEmpty ? plainTextCache.length : wordCount;
}
