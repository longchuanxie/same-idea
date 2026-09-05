import 'package:drift/drift.dart';

import '../../domain/entities/tag.dart' as domain;
import '../../domain/repositories/tag_repository.dart';
import '../database/app_database.dart' as db;

/// 标签仓储的 drift 实现
class TagRepositoryImpl implements TagRepository {
  const TagRepositoryImpl(this._db);

  final db.AppDatabase _db;

  @override
  Future<List<domain.Tag>> getAllTags() async {
    final rows = await _db.select(_db.tags).get();
    return rows.map(_toEntity).toList();
  }

  @override
  Future<domain.Tag> addTag(domain.Tag tag) async {
    await _db.into(_db.tags).insert(_toCompanion(tag));
    return tag;
  }

  @override
  Future<void> updateTag(domain.Tag tag) async {
    await _db.update(_db.tags).replace(_toCompanion(tag));
  }

  @override
  Future<void> deleteTag(int id) async {
    await (_db.delete(_db.tags)..where((t) => t.id.equals(id))).go();
  }

  @override
  Future<List<domain.Tag>> getTagsForBook(int bookId) async {
    final query = _db.select(_db.tags).join([
      innerJoin(_db.bookTags, _db.bookTags.tagId.equalsExp(_db.tags.id)),
    ])
      ..where(_db.bookTags.bookId.equals(bookId));
    final rows = await query.get();
    return rows.map((row) => _toEntity(row.readTable(_db.tags))).toList();
  }

  @override
  Future<void> addTagToBook(int bookId, int tagId) async {
    await _db.into(_db.bookTags).insert(
          db.BookTagsCompanion(
            bookId: Value(bookId),
            tagId: Value(tagId),
          ),
        );
  }

  @override
  Future<void> removeTagFromBook(int bookId, int tagId) async {
    await (_db.delete(_db.bookTags)
          ..where((t) => t.bookId.equals(bookId) & t.tagId.equals(tagId)))
        .go();
  }

  domain.Tag _toEntity(db.Tag row) {
    return domain.Tag(
      id: row.id,
      name: row.name,
      color: row.color,
    );
  }

  db.TagsCompanion _toCompanion(domain.Tag tag) {
    return db.TagsCompanion(
      id: Value(tag.id),
      name: Value(tag.name),
      color: Value(tag.color),
    );
  }
}
