/// 书架偏好实体
class ShelfPreferences {
  const ShelfPreferences({
    required this.id,
    this.sortBy,
    this.sortAscending,
    this.filterFormat,
    this.filterSeriesId,
    this.filterTagId,
    this.viewMode,
  });

  final int id;
  final String? sortBy;
  final bool? sortAscending;
  final String? filterFormat;
  final int? filterSeriesId;
  final int? filterTagId;
  final String? viewMode;

  ShelfPreferences copyWith({
    String? sortBy,
    bool? sortAscending,
    String? filterFormat,
    int? filterSeriesId,
    int? filterTagId,
    String? viewMode,
  }) {
    return ShelfPreferences(
      id: id,
      sortBy: sortBy ?? this.sortBy,
      sortAscending: sortAscending ?? this.sortAscending,
      filterFormat: filterFormat ?? this.filterFormat,
      filterSeriesId: filterSeriesId ?? this.filterSeriesId,
      filterTagId: filterTagId ?? this.filterTagId,
      viewMode: viewMode ?? this.viewMode,
    );
  }
}
