import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';

part 'chapter.freezed.dart';
part 'chapter.g.dart';

// --- Chapter state machine ---
// draft → reviewing → revised → published
// any state → locked

const Map<ChapterStatus, Set<ChapterStatus>> _validChapterTransitions =
    <ChapterStatus, Set<ChapterStatus>>{
  ChapterStatus.draft: <ChapterStatus>{
    ChapterStatus.reviewing,
    ChapterStatus.locked,
  },
  ChapterStatus.reviewing: <ChapterStatus>{
    ChapterStatus.revised,
    ChapterStatus.locked,
  },
  ChapterStatus.revised: <ChapterStatus>{
    ChapterStatus.published,
    ChapterStatus.locked,
  },
  ChapterStatus.published: <ChapterStatus>{
    ChapterStatus.locked,
  },
  ChapterStatus.locked: <ChapterStatus>{},
};

bool isValidChapterTransition(ChapterStatus from, ChapterStatus to) {
  return _validChapterTransitions[from]?.contains(to) ?? false;
}

@freezed
class Chapter with _$Chapter {
  const factory Chapter({
    required String id,
    required String projectId,
    required String title,
    required String markdownContent,
    required String plainTextCache,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(ChapterStatus.draft) ChapterStatus status,
    @Default(0) int wordCount,
    @Default(1) int schemaVersion,
  }) = _Chapter;

  const Chapter._();

  factory Chapter.fromJson(Map<String, dynamic> json) =>
      _$ChapterFromJson(json);

  int get effectiveWordCount => plainTextCache.isNotEmpty
      ? TextMetrics.countCharacters(plainTextCache)
      : wordCount;

  bool get isTerminal =>
      status == ChapterStatus.locked || status == ChapterStatus.published;

  String? validateTransition(ChapterStatus newStatus) {
    if (status == newStatus) return null;
    if (isValidChapterTransition(status, newStatus)) return null;
    return '不能从 ${status.name} 转换到 ${newStatus.name}';
  }
}
