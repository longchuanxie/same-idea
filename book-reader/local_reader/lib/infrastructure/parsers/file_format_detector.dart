import '../../domain/entities/book.dart';

/// 文件格式检测器
/// 根据文件扩展名和内容特征识别文件格式
class FileFormatDetector {
  FileFormatDetector._();

  /// 支持的文件扩展名到格式的映射
  static const Map<String, BookFormat> _extensionMap = {
    '.txt': BookFormat.txt,
    '.epub': BookFormat.epub,
    '.md': BookFormat.markdown,
    '.markdown': BookFormat.markdown,
    '.html': BookFormat.html,
    '.htm': BookFormat.html,
    '.xhtml': BookFormat.html,
    '.pdf': BookFormat.pdf,
    '.cbz': BookFormat.cbz,
    '.cbr': BookFormat.cbr,
    '.rar': BookFormat.cbr,
    '.zip': BookFormat.zipImages,
  };

  /// 根据文件路径检测格式
  static BookFormat? detectFromPath(String filePath) {
    final lowerPath = filePath.toLowerCase();
    for (final entry in _extensionMap.entries) {
      if (lowerPath.endsWith(entry.key)) {
        return entry.value;
      }
    }
    return null;
  }

  /// 判断文件扩展名是否受支持
  static bool isSupportedExtension(String filePath) {
    return detectFromPath(filePath) != null;
  }

  /// 获取所有支持的扩展名列表
  static List<String> get supportedExtensions =>
      _extensionMap.keys.toList();

  /// 根据格式推断书籍类型分类
  static BookTypeCategory categorize(BookFormat format) {
    switch (format) {
      case BookFormat.txt:
      case BookFormat.epub:
      case BookFormat.markdown:
      case BookFormat.html:
        return BookTypeCategory.text;
      case BookFormat.pdf:
        return BookTypeCategory.pdf;
      case BookFormat.cbz:
      case BookFormat.cbr:
      case BookFormat.zipImages:
      case BookFormat.dirImages:
        return BookTypeCategory.comic;
    }
  }
}

/// 书籍类型分类
enum BookTypeCategory {
  text,
  comic,
  pdf,
}
