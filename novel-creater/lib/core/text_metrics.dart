String plainTextFromMarkdown(String content) {
  return content
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll(RegExp(r'!\[[^\]]*\]\([^)]+\)'), '')
      .replaceAll(RegExp(r'\[[^\]]+\]\([^)]+\)'), '')
      .replaceAll(RegExp(r'[#>*_`~\[\]()]'), '')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

int countWritingUnits(String content) {
  final plainText = plainTextFromMarkdown(content);
  if (plainText.isEmpty) return 0;

  final cjkCount = RegExp(r'[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]')
      .allMatches(plainText)
      .length;
  final latinWordCount =
      RegExp(r"[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?").allMatches(plainText).length;

  return cjkCount + latinWordCount;
}
