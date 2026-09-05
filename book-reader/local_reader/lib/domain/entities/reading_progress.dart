/// 阅读进度实体
class ReadingProgress {
  const ReadingProgress({
    required this.id,
    required this.bookId,
    this.position,
    this.percentage,
    this.chapterIndex,
    this.chapterTitle,
    this.scrollOffset,
    this.updatedAt,
  });

  final int id;
  final int bookId;
  final String? position;
  final double? percentage;
  final int? chapterIndex;
  final String? chapterTitle;
  final double? scrollOffset;
  final DateTime? updatedAt;

  ReadingProgress copyWith({
    String? position,
    double? percentage,
    int? chapterIndex,
    String? chapterTitle,
    double? scrollOffset,
    DateTime? updatedAt,
  }) {
    return ReadingProgress(
      id: id,
      bookId: bookId,
      position: position ?? this.position,
      percentage: percentage ?? this.percentage,
      chapterIndex: chapterIndex ?? this.chapterIndex,
      chapterTitle: chapterTitle ?? this.chapterTitle,
      scrollOffset: scrollOffset ?? this.scrollOffset,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
