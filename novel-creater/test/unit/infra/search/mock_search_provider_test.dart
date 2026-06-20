import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/infra/search/search.dart';

void main() {
  late MockSearchProvider provider;

  setUp(() {
    provider = MockSearchProvider(
      idGenerator: const _FixedIdGenerator(),
      clock: FixedClock(DateTime(2026, 6, 4, 12)),
    );
  });

  group('MockSearchProvider', () {
    test('returns source cards with citation metadata', () async {
      final result = await provider.search(
        const SearchPlan(
          projectId: 'project-1',
          query: '档案馆制度',
          maxResults: 3,
        ),
      );

      expect(result.isSuccess, isTrue);
      final sources = result.maybeSuccess!;
      expect(sources, hasLength(3));
      expect(sources.first.url, startsWith('https://'));
      expect(sources.first.domain, isNotEmpty);
      expect(sources.first.retrievedAt, DateTime(2026, 6, 4, 12));
      expect(sources.last.extractionFailed, isTrue);
    });

    test('returns failure for empty query', () async {
      final result = await provider.search(
        const SearchPlan(projectId: 'project-1', query: '   '),
      );

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'SEARCH_EMPTY_QUERY');
    });

    test('marks repeated search result as cache hit', () async {
      await provider.search(
        const SearchPlan(projectId: 'project-1', query: '档案馆制度'),
      );

      final result = await provider.search(
        const SearchPlan(projectId: 'project-1', query: '档案馆制度'),
      );

      expect(result.maybeSuccess!.first.wasCacheHit, isTrue);
    });
  });
}

class _FixedIdGenerator extends IdGenerator {
  const _FixedIdGenerator();

  @override
  String generate() => 'source-id';
}
