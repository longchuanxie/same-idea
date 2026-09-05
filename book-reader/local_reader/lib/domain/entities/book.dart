/// 书籍文件格式
enum BookFormat {
  txt,
  epub,
  markdown,
  html,
  pdf,
  cbz,
  cbr,
  zipImages,
  dirImages,
}

/// 书籍实体
class Book {
  const Book({
    required this.id,
    required this.title,
    required this.filePath,
    required this.format,
    this.author,
    this.coverPath,
    this.seriesId,
    this.volumeIndex,
    this.fileSizeBytes,
    this.lastOpenedAt,
    this.addedAt,
  });

  final int id;
  final String title;
  final String? author;
  final String filePath;
  final BookFormat format;
  final String? coverPath;
  final int? seriesId;
  final int? volumeIndex;
  final int? fileSizeBytes;
  final DateTime? lastOpenedAt;
  final DateTime? addedAt;

  Book copyWith({
    int? id,
    String? title,
    String? author,
    String? coverPath,
    int? seriesId,
    int? volumeIndex,
    DateTime? lastOpenedAt,
  }) {
    return Book(
      id: id ?? this.id,
      title: title ?? this.title,
      filePath: filePath,
      format: format,
      author: author ?? this.author,
      coverPath: coverPath ?? this.coverPath,
      seriesId: seriesId ?? this.seriesId,
      volumeIndex: volumeIndex ?? this.volumeIndex,
      fileSizeBytes: fileSizeBytes,
      lastOpenedAt: lastOpenedAt ?? this.lastOpenedAt,
      addedAt: addedAt,
    );
  }
}
