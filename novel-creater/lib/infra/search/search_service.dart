import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/results/app_result.dart';

/// Full-text search service with relevance scoring.
/// Replaces simple LIKE queries with tokenized search.
abstract interface class SearchService {
  /// Search across all entity types for a project.
  Future<AppResult<List<ScoredSearchResult>>> search({
    required String projectId,
    required String query,
    List<SearchEntityType>? typeFilter,
  });

  /// Index a chapter's content for searching.
  Future<AppResult<void>> indexChapter({
    required String projectId,
    required String chapterId,
    required String title,
    required String content,
  });

  /// Remove a chapter from the search index.
  Future<AppResult<void>> removeChapterIndex(String chapterId);

  /// Index a knowledge base item.
  Future<AppResult<void>> indexKnowledgeItem({
    required String projectId,
    required String entityType,
    required String entityId,
    required String title,
    required String content,
    required SearchEntityType searchType,
  });

  /// Remove a knowledge item from the search index.
  Future<AppResult<void>> removeKnowledgeItemIndex(String entityId);
}

/// A search result with relevance scoring.
/// Defined here alongside the interface to avoid circular imports.
final class ScoredSearchResult {
  const ScoredSearchResult({
    required this.result,
    required this.score,
    required this.matchedFields,
  });

  final SearchResult result;

  /// Relevance score (0.0 - 1.0), higher is more relevant.
  final double score;

  /// Which fields matched the query.
  final List<String> matchedFields;

  String get id => result.id;
  String get title => result.title;
  SearchEntityType get type => result.type;
}
