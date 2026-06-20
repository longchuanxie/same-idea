import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class SearchRepository {
  Future<AppResult<List<SearchResult>>> search({
    required String projectId,
    required String query,
    SearchEntityType? typeFilter,
  });
}
