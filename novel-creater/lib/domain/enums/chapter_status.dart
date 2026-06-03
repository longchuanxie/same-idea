enum ChapterStatus {
  draft,
  reviewing,
  revised,
  locked,
  published;

  bool canTransitionTo(ChapterStatus target) => switch (this) {
    ChapterStatus.draft =>
      target == ChapterStatus.reviewing || target == ChapterStatus.locked,
    ChapterStatus.reviewing =>
      target == ChapterStatus.revised || target == ChapterStatus.locked,
    ChapterStatus.revised =>
      target == ChapterStatus.published || target == ChapterStatus.locked,
    ChapterStatus.published => target == ChapterStatus.draft,
    ChapterStatus.locked => target == ChapterStatus.draft,
  };
}
