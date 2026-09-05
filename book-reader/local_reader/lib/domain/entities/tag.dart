/// 标签实体
class Tag {
  const Tag({
    required this.id,
    required this.name,
    this.color,
  });

  final int id;
  final String name;
  final String? color;

  Tag copyWith({
    String? name,
    String? color,
  }) {
    return Tag(
      id: id,
      name: name ?? this.name,
      color: color ?? this.color,
    );
  }
}

/// 书籍-标签关联
class BookTag {
  const BookTag({
    required this.bookId,
    required this.tagId,
  });

  final int bookId;
  final int tagId;
}
