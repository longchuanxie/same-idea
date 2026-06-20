/// Review modes for examining pending revisions.
enum ReviewMode {
  /// Review revisions one at a time.
  single,

  /// Review revisions grouped by paragraph/section.
  paragraph,

  /// Review all revisions at once with bulk actions.
  bulk,

  /// Preview the content with all revisions applied.
  preview,
}
