import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/search/search_models.dart';
import 'package:novel_creator/infra/search/search_provider.dart';

class MockSearchProvider implements SearchProvider {
  MockSearchProvider({
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _idGenerator = idGenerator,
        _clock = clock;

  final IdGenerator _idGenerator;
  final AppClock _clock;
  final Set<String> _cacheKeys = {};

  @override
  Future<AppResult<List<SourceCard>>> search(SearchPlan plan) async {
    final query = plan.query.trim();
    if (query.isEmpty) {
      return const AppResult.failure(
        AppError(
          code: 'SEARCH_EMPTY_QUERY',
          message: 'Search query is empty',
          userMessage: '搜索词不能为空',
          source: AppErrorSource.search,
        ),
      );
    }
    if (plan.maxResults <= 0) {
      return const AppResult.failure(
        AppError(
          code: 'SEARCH_INVALID_LIMIT',
          message: 'maxResults must be greater than zero',
          userMessage: '搜索结果数量必须大于 0',
          source: AppErrorSource.search,
        ),
      );
    }

    final count = plan.maxResults.clamp(1, 5);
    final cards = List.generate(count, (index) {
      final ordinal = index + 1;
      final domain = ordinal.isEven ? 'archive.example' : 'library.example';
      final url = 'https://$domain/research/${Uri.encodeComponent(query)}/'
          '$ordinal';
      final cacheKey = url.toLowerCase();
      final wasCacheHit = _cacheKeys.contains(cacheKey);
      _cacheKeys.add(cacheKey);
      final extractionFailed = ordinal == count && count > 2;

      return SourceCard(
        id: _idGenerator.generate(),
        projectId: plan.projectId,
        query: query,
        title: '$query 资料线索 $ordinal',
        url: url,
        domain: domain,
        retrievedAt: _clock.now(),
        snippet: '关于“$query”的可核查背景摘要 $ordinal。',
        extractedText: extractionFailed ? null : '已清洗的模拟网页正文片段 $ordinal。',
        summary: extractionFailed
            ? '仅保留搜索摘要，全文提取失败。'
            : '整理后的调研摘要 $ordinal，适合作为创作参考。',
        credibilityHint: ordinal.isEven ? '机构/档案来源，仍需核验。' : '普通网页来源。',
        language: plan.language,
        cacheKey: cacheKey,
        tags: const ['research'],
        wasCacheHit: wasCacheHit,
        extractionFailed: extractionFailed,
      );
    });

    return AppResult.success(cards);
  }
}
