/// Simple Chinese text tokenizer using bigram segmentation.
/// For production, consider integrating a proper Chinese NLP library.
final class ChineseTokenizer {
  const ChineseTokenizer();

  /// Tokenize text into searchable terms.
  /// Uses bigram (2-character) segmentation for Chinese,
  /// and whitespace splitting for non-CJK text.
  List<String> tokenize(String text) {
    if (text.isEmpty) return [];

    final tokens = <String>[];
    final buffer = StringBuffer();

    for (var i = 0; i < text.length; i++) {
      final char = text[i];
      if (_isCJK(char)) {
        // Flush any accumulated non-CJK text
        if (buffer.isNotEmpty) {
          tokens.addAll(_splitNonCJK(buffer.toString()));
          buffer.clear();
        }
        // Add bigrams
        if (i + 1 < text.length && _isCJK(text[i + 1])) {
          tokens.add('$char${text[i + 1]}');
        }
        // Also add single character for single-char matching
        tokens.add(char);
      } else {
        buffer.write(char);
      }
    }

    if (buffer.isNotEmpty) {
      tokens.addAll(_splitNonCJK(buffer.toString()));
    }

    return tokens.toSet().toList(); // Deduplicate
  }

  /// Create a search pattern from a query for LIKE matching.
  /// Returns a list of terms that should all be present.
  List<String> extractSearchTerms(String query) =>
      tokenize(query).where((t) => t.length >= 2).toList();

  bool _isCJK(String char) {
    final code = char.codeUnitAt(0);
    return (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
        (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
        (code >= 0x3000 && code <= 0x303F) || // CJK Symbols
        (code >= 0xFF00 && code <= 0xFFEF); // Halfwidth and Fullwidth
  }

  List<String> _splitNonCJK(String text) => text
      .split(RegExp(r'\s+'))
      .where((s) => s.isNotEmpty)
      .map((s) => s.toLowerCase())
      .toList();
}
