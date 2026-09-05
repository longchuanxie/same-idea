import 'package:drift/drift.dart';

import '../../domain/entities/series.dart' as domain;
import '../../domain/repositories/series_repository.dart';
import '../database/app_database.dart' as db;

/// 系列仓储的 drift 实现
class SeriesRepositoryImpl implements SeriesRepository {
  const SeriesRepositoryImpl(this._db);

  final db.AppDatabase _db;

  @override
  Future<List<domain.Series>> getAllSeries() async {
    final rows = await _db.select(_db.series).get();
    return rows.map(_toEntity).toList();
  }

  @override
  Future<domain.Series?> getSeriesById(int id) async {
    final row = await (_db.select(_db.series)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    return row != null ? _toEntity(row) : null;
  }

  @override
  Future<domain.Series> addSeries(domain.Series series) async {
    await _db.into(_db.series).insert(_toCompanion(series));
    return series;
  }

  @override
  Future<void> updateSeries(domain.Series series) async {
    await _db.update(_db.series).replace(_toCompanion(series));
  }

  @override
  Future<void> deleteSeries(int id) async {
    await (_db.delete(_db.series)..where((t) => t.id.equals(id))).go();
  }

  domain.Series _toEntity(db.Sery row) {
    return domain.Series(
      id: row.id,
      title: row.title,
      description: row.description,
      coverPath: row.coverPath,
    );
  }

  db.SeriesCompanion _toCompanion(domain.Series series) {
    return db.SeriesCompanion(
      id: Value(series.id),
      title: Value(series.title),
      description: Value(series.description),
      coverPath: Value(series.coverPath),
    );
  }
}
