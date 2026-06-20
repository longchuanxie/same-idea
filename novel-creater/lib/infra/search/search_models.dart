import 'package:equatable/equatable.dart';

class SearchPlan extends Equatable {
  const SearchPlan({
    required this.projectId,
    required this.query,
    this.intent = 'manual_research',
    this.maxResults = 5,
    this.language = 'zh-CN',
  });

  final String projectId;
  final String query;
  final String intent;
  final int maxResults;
  final String language;

  @override
  List<Object?> get props => [
        projectId,
        query,
        intent,
        maxResults,
        language,
      ];
}

class SourceCard extends Equatable {
  const SourceCard({
    required this.id,
    required this.projectId,
    required this.query,
    required this.title,
    required this.url,
    required this.domain,
    required this.retrievedAt,
    required this.snippet,
    required this.summary,
    required this.language,
    required this.cacheKey,
    this.publishedAt,
    this.extractedText,
    this.credibilityHint,
    this.tags = const [],
    this.wasCacheHit = false,
    this.extractionFailed = false,
  });

  final String id;
  final String projectId;
  final String query;
  final String title;
  final String url;
  final String domain;
  final DateTime? publishedAt;
  final DateTime retrievedAt;
  final String snippet;
  final String? extractedText;
  final String summary;
  final String? credibilityHint;
  final String language;
  final String cacheKey;
  final List<String> tags;
  final bool wasCacheHit;
  final bool extractionFailed;

  @override
  List<Object?> get props => [
        id,
        projectId,
        query,
        title,
        url,
        domain,
        publishedAt,
        retrievedAt,
        snippet,
        extractedText,
        summary,
        credibilityHint,
        language,
        cacheKey,
        tags,
        wasCacheHit,
        extractionFailed,
      ];
}

class ResearchCitation extends Equatable {
  const ResearchCitation({
    required this.title,
    required this.url,
    required this.domain,
    required this.retrievedAt,
  });

  final String title;
  final String url;
  final String domain;
  final DateTime retrievedAt;

  @override
  List<Object?> get props => [title, url, domain, retrievedAt];
}

class ResearchNoteDraft extends Equatable {
  const ResearchNoteDraft({
    required this.projectId,
    required this.title,
    required this.summary,
    required this.citations,
    this.tags = const [],
  });

  final String projectId;
  final String title;
  final String summary;
  final List<ResearchCitation> citations;
  final List<String> tags;

  @override
  List<Object?> get props => [projectId, title, summary, citations, tags];
}
