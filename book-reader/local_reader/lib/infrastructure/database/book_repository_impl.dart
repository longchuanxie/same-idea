import 'package:drift/drift.dart';

import '../../domain/entities/entities.dart' as domain;
import '../../domain/repositories/book_repository.dart';
import '../database/app_database.dart' as db;

/// 书籍仓储的 drift 实现
class BookRepositoryImpl implements BookRepository {
  const BookRepositoryImpl(this._db);

  final db.AppDatabase _db;

  @override
  Future<List<domain.Book>> getAllBooks() async {
    final rows = await _db.select(_db.books).get();
    return rows.map(_toEntity).toList();
  }

  @override
  Future<domain.Book?> getBookById(int id) async {
    final row = await (_db.select(_db.books)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    return row != null ? _toEntity(row) : null;
  }

  @override
  Future<List<domain.Book>> getBooksBySeriesId(int seriesId) async {
    final rows = await (_db.select(_db.books)
          ..where((t) => t.seriesId.equals(seriesId))
          ..orderBy([(t) => OrderingTerm.asc(t.volumeIndex)]))
        .get();
    return rows.map(_toEntity).toList();
  }

  @override
  Future<domain.Book> addBook(domain.Book book) async {
    final id = await _db.into(_db.books).insert(_toCompanion(book));
    return book.copyWith(id: id);
  }

  @override
  Future<void> updateBook(domain.Book book) async {
    await _db.update(_db.books).replace(_toCompanion(book));
  }

  @override
  Future<void> deleteBook(int id) async {
    await (_db.delete(_db.books)..where((t) => t.id.equals(id))).go();
  }

  @override
  Future<void> updateLastOpened(int id) async {
    await (_db.update(_db.books)..where((t) => t.id.equals(id))).write(
      db.BooksCompanion(lastOpenedAt: Value(DateTime.now())),
    );
  }

  @override
  Future<int> getBookCount() async {
    final count = await _db.select(_db.books).get();
    return count.length;
  }

  @override
  Future<List<domain.Book>> searchBooks(String query) async {
    final pattern = '%$query%';
    final rows = await (_db.select(_db.books)
          ..where((t) => t.title.like(pattern) | t.author.like(pattern)))
        .get();
    return rows.map(_toEntity).toList();
  }

  domain.Book _toEntity(db.Book row) {
    return domain.Book(
      id: row.id,
      title: row.title,
      author: row.author,
      filePath: row.filePath,
      format: domain.BookFormat.values.firstWhere(
        (f) => f.name == row.format,
        orElse: () => domain.BookFormat.txt,
      ),
      coverPath: row.coverPath,
      seriesId: row.seriesId,
      volumeIndex: row.volumeIndex,
      fileSizeBytes: row.fileSizeBytes,
      lastOpenedAt: row.lastOpenedAt,
      addedAt: row.addedAt,
    );
  }

  db.BooksCompanion _toCompanion(domain.Book book) {
    return db.BooksCompanion(
      id: book.id == 0 ? const Value.absent() : Value(book.id),
      title: Value(book.title),
      author: Value(book.author ?? ''),
      filePath: Value(book.filePath),
      format: Value(book.format.name),
      coverPath: Value(book.coverPath),
      seriesId: Value(book.seriesId),
      volumeIndex: Value(book.volumeIndex),
      fileSizeBytes: Value(book.fileSizeBytes),
      lastOpenedAt: Value(book.lastOpenedAt),
      addedAt: Value(book.addedAt ?? DateTime.now()),
    );
  }
}
