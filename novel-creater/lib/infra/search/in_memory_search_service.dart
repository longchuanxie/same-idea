import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/search/chinese_tokenizer.dart';
import 'package:novel_creator/infra/search/search_service.dart';

/// In-memory full-text search service with tokenized matching
/// and relevance scoring.
final class InMemorySearchService implements SearchService {
  InMemorySearchService({ChineseTokenizer? tokenizer})
      : _tokenizer = tokenizer ?? const ChineseTokenizer();

  final ChineseTokenizer _tokenizer;

  /// Indexed documents: id -> {projectId, type, title, content, searchType}
  final Map<String, _SearchDocument> _documents = {};

  @override
  Future<AppResult<List<ScoredSearchResult>>> search({
    required String projectId,
    required String query,
    List<SearchEntityType>? typeFilter,
  }) async {
    final terms = _tokenizer.extractSearchTerms(query);
    if (terms.isEmpty) {
      return const AppResult<List<ScoredSearchResult>>.success([]);
    }

    final results = <ScoredSearchResult>[];

    for (final doc in _documents.values) {
      if (doc.projectId != projectId) continue;
      if (typeFilter != null && !typeFilter.contains(doc.searchType)) continue;

      final score = _calculateScore(terms, doc);
      if (score > 0) {
        results.add(ScoredSearchResult(
          result: doc.toSearchResult(),
          score: score,
          matchedFields: _findMatchedFields(terms, doc),
        ),);
      }
    }

    results.sort((a, b) => b.score.compareTo(a.score));
    return AppResult<List<ScoredSearchResult>>.success(results);
  }

  @override
  Future<AppResult<void>> indexChapter({
    required String projectId,
    required String chapterId,
    required String title,
    required String content,
  }) async {
    _documents[chapterId] = _SearchDocument(
      id: chapterId,
      projectId: projectId,
      entityType: 'chapter',
      title: title,
      content: content,
      searchType: SearchEntityType.chapter,
    );
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<void>> removeChapterIndex(String chapterId) async {
    _documents.remove(chapterId);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<void>> indexKnowledgeItem({
    required String projectId,
    required String entityType,
    required String entityId,
    required String title,
    required String content,
    required SearchEntityType searchType,
  }) async {
    _documents[entityId] = _SearchDocument(
      id: entityId,
      projectId: projectId,
      entityType: entityType,
      title: title,
      content: content,
      searchType: searchType,
    );
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<void>> removeKnowledgeItemIndex(String entityId) async {
    _documents.remove(entityId);
    return const AppResult<void>.success(null);
  }

  double _calculateScore(List<String> terms, _SearchDocument doc) {
    var score = 0.0;
    final titleTokens = _tokenizer.tokenize(doc.title);
    final contentTokens = _tokenizer.tokenize(doc.content);

    for (final term in terms) {
      final titleMatches =
          titleTokens.where((t) => t.contains(term) || term.contains(t)).length;
      final contentMatches = contentTokens
          .where((t) => t.contains(term) || term.contains(t))
          .length;

      if (titleMatches > 0) {
        score +=
            0.5 * (titleMatches / titleTokens.length.clamp(1, double.infinity));
      }
      if (contentMatches > 0) {
        score += 0.3 *
            (contentMatches / contentTokens.length.clamp(1, double.infinity));
      }
    }

    return score.clamp(0.0, 1.0);
  }

  List<String> _findMatchedFields(List<String> terms, _SearchDocument doc) {
    final fields = <String>[];
    for (final term in terms) {
      if (doc.title.contains(term) ||
          _tokenizer.tokenize(doc.title).any((t) => t.contains(term))) {
        if (!fields.contains('title')) fields.add('title');
      }
      if (doc.content.contains(term) ||
          _tokenizer.tokenize(doc.content).any((t) => t.contains(term))) {
        if (!fields.contains('content')) fields.add('content');
      }
    }
    return fields;
  }
}

class _SearchDocument {
  const _SearchDocument({
    required this.id,
    required this.projectId,
    required this.entityType,
    required this.title,
    required this.content,
    required this.searchType,
  });

  final String id;
  final String projectId;
  final String entityType;
  final String title;
  final String content;
  final SearchEntityType searchType;

  SearchResult toSearchResult() => switch (searchType) {
        SearchEntityType.character => CharacterSearchResult(
            character: Character(
              id: id,
              projectId: projectId,
              name: title,
              description: content.length > 200
                  ? '${content.substring(0, 200)}...'
                  : content,
              createdAt: DateTime.now().toUtc(),
              updatedAt: DateTime.now().toUtc(),
            ),
          ),
        SearchEntityType.settingEntry => SettingEntrySearchResult(
            entry: SettingEntry(
              id: id,
              projectId: projectId,
              title: title,
              content: content,
              createdAt: DateTime.now().toUtc(),
              updatedAt: DateTime.now().toUtc(),
            ),
          ),
        SearchEntityType.note => NoteSearchResult(
            note: Note(
              id: id,
              projectId: projectId,
              title: title,
              content: content,
              createdAt: DateTime.now().toUtc(),
              updatedAt: DateTime.now().toUtc(),
            ),
          ),
        SearchEntityType.chapter => ChapterSearchResult(
            chapterId: id,
            chapterTitle: title,
            contentSnippet: content.length > 200
                ? '${content.substring(0, 200)}...'
                : content,
          ),
      };
}
