/// 系列实体
class Series {
  const Series({
    required this.id,
    required this.title,
    this.description,
    this.coverPath,
  });

  final int id;
  final String title;
  final String? description;
  final String? coverPath;

  Series copyWith({
    String? title,
    String? description,
    String? coverPath,
  }) {
    return Series(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      coverPath: coverPath ?? this.coverPath,
    );
  }
}
