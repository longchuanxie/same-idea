/// 笔记类型
enum NoteType {
  highlight,
  annotation,
  bookmark,
}

/// 笔记实体
class Note {
  const Note({
    required this.id,
    required this.bookId,
    required this.type,
    this.content,
    this.highlightText,
    this.position,
    this.chapterIndex,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final int bookId;
  final NoteType type;
  final String? content;
  final String? highlightText;
  final String? position;
  final int? chapterIndex;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Note copyWith({
    String? content,
    String? highlightText,
    String? position,
    DateTime? updatedAt,
  }) {
    return Note(
      id: id,
      bookId: bookId,
      type: type,
      content: content ?? this.content,
      highlightText: highlightText ?? this.highlightText,
      position: position ?? this.position,
      chapterIndex: chapterIndex,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
