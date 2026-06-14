/// Supported export formats.
///
/// Ordered by implementation priority per AGENTS.md:
/// TXT → Markdown → EPUB → PDF → DOCX → Project Package
enum ExportFormat {
  txt,
  markdown,
  epub,
  pdf,
  docx,
  projectPackage;

  /// File extension including the dot.
  String get extension => switch (this) {
        ExportFormat.txt => '.txt',
        ExportFormat.markdown => '.md',
        ExportFormat.epub => '.epub',
        ExportFormat.pdf => '.pdf',
        ExportFormat.docx => '.docx',
        ExportFormat.projectPackage => '.ncp',
      };

  /// Whether this format is currently implemented.
  bool get isImplemented =>
      this == ExportFormat.txt || this == ExportFormat.markdown;
}
