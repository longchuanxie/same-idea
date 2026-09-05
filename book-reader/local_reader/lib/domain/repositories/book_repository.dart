import '../entities/entities.dart';

/// 书籍仓储接口
abstract class BookRepository {
  Future<List<Book>> getAllBooks();
  Future<Book?> getBookById(int id);
  Future<List<Book>> getBooksBySeriesId(int seriesId);
  Future<Book> addBook(Book book);
  Future<void> updateBook(Book book);
  Future<void> deleteBook(int id);
  Future<void> updateLastOpened(int id);
  Future<int> getBookCount();
  Future<List<Book>> searchBooks(String query);
}
