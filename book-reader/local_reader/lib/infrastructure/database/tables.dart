import 'package:drift/drift.dart';

/// 书籍表
class Books extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get title => text()();
  TextColumn get author => text().withDefault(const Constant(''))();
  TextColumn get filePath => text()();
  TextColumn get format => text()(); // BookFormat 枚举名
  TextColumn get coverPath => text().nullable()();
  IntColumn get seriesId => integer().nullable().references(Series, #id)();
  IntColumn get volumeIndex => integer().nullable()();
  IntColumn get fileSizeBytes => integer().nullable()();
  DateTimeColumn get lastOpenedAt => dateTime().nullable()();
  DateTimeColumn get addedAt => dateTime().withDefault(currentDateAndTime)();
}

/// 系列表
class Series extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get title => text()();
  TextColumn get description => text().nullable()();
  TextColumn get coverPath => text().nullable()();
}

/// 标签表
class Tags extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().unique()();
  TextColumn get color => text().nullable()();
}

/// 书籍-标签关联表
class BookTags extends Table {
  IntColumn get bookId => integer().references(Books, #id)();
  IntColumn get tagId => integer().references(Tags, #id)();

  @override
  Set<Column> get primaryKey => {bookId, tagId};
}

/// 阅读进度表
class ReadingProgressTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get bookId => integer().references(Books, #id)();
  TextColumn get position => text().nullable()();
  RealColumn get percentage => real().nullable()();
  IntColumn get chapterIndex => integer().nullable()();
  TextColumn get chapterTitle => text().nullable()();
  RealColumn get scrollOffset => real().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
}

/// 笔记表
class Notes extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get bookId => integer().references(Books, #id)();
  TextColumn get type => text()(); // NoteType 枚举名
  TextColumn get content => text().nullable()();
  TextColumn get highlightText => text().nullable()();
  TextColumn get position => text().nullable()();
  IntColumn get chapterIndex => integer().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().nullable()();
}

/// 书架偏好表
class ShelfPreferencesTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get sortBy => text().nullable()();
  BoolColumn get sortAscending => boolean().withDefault(const Constant(true))();
  TextColumn get filterFormat => text().nullable()();
  IntColumn get filterSeriesId => integer().nullable()();
  IntColumn get filterTagId => integer().nullable()();
  TextColumn get viewMode => text().withDefault(const Constant('grid'))();
}
