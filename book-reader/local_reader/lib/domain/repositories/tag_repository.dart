import '../entities/tag.dart';

/// 标签仓储接口
abstract class TagRepository {
  Future<List<Tag>> getAllTags();
  Future<Tag> addTag(Tag tag);
  Future<void> updateTag(Tag tag);
  Future<void> deleteTag(int id);
  Future<List<Tag>> getTagsForBook(int bookId);
  Future<void> addTagToBook(int bookId, int tagId);
  Future<void> removeTagFromBook(int bookId, int tagId);
}
