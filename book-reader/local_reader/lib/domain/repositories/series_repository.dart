import '../entities/series.dart';

/// 系列仓储接口
abstract class SeriesRepository {
  Future<List<Series>> getAllSeries();
  Future<Series?> getSeriesById(int id);
  Future<Series> addSeries(Series series);
  Future<void> updateSeries(Series series);
  Future<void> deleteSeries(int id);
}
