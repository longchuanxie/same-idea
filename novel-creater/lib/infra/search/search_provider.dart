import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/search/search_models.dart';

// ignore: one_member_abstracts
abstract class SearchProvider {
  Future<AppResult<List<SourceCard>>> search(SearchPlan plan);
}
