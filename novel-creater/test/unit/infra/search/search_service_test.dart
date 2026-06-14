import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/infra/search/chinese_tokenizer.dart';
import 'package:novel_creator/infra/search/in_memory_search_service.dart';

void main() {
  group('ChineseTokenizer', () {
    const tokenizer = ChineseTokenizer();

    test('tokenizes Chinese text into bigrams', () {
      final tokens = tokenizer.tokenize('你好世界');
      expect(tokens, contains('你好'));
      expect(tokens, contains('好世'));
      expect(tokens, contains('世界'));
    });

    test('tokenizes mixed Chinese and English', () {
      final tokens = tokenizer.tokenize('Hello 你好 World');
      expect(tokens, contains('hello'));
      expect(tokens, contains('world'));
      expect(tokens, contains('你好'));
    });

    test('extracts search terms of length >= 2', () {
      final terms = tokenizer.extractSearchTerms('你好世界');
      expect(terms, isNotEmpty);
      expect(terms.every((t) => t.length >= 2), isTrue);
    });

    test('handles empty text', () {
      expect(tokenizer.tokenize(''), isEmpty);
    });
  });

  group('InMemorySearchService', () {
    late InMemorySearchService service;

    setUp(() {
      service = InMemorySearchService();
    });

    test('finds indexed chapter by content', () async {
      await service.indexChapter(
        projectId: 'p1',
        chapterId: 'ch1',
        title: '第一章',
        content: '林风走进了青云城，这里是一片繁华的景象。',
      );

      final result = await service.search(
        projectId: 'p1',
        query: '青云城',
      );

      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull, isNotEmpty);
      expect(result.valueOrNull!.first.type, SearchEntityType.chapter);
    });

    test('finds indexed knowledge item', () async {
      await service.indexKnowledgeItem(
        projectId: 'p1',
        entityType: 'character',
        entityId: 'char1',
        title: '林风',
        content: '主角，修炼九阳真经',
        searchType: SearchEntityType.character,
      );

      final result = await service.search(
        projectId: 'p1',
        query: '九阳真经',
      );

      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull, isNotEmpty);
    });

    test('filters by type', () async {
      await service.indexChapter(
        projectId: 'p1',
        chapterId: 'ch1',
        title: '第一章',
        content: '青云城的故事',
      );
      await service.indexKnowledgeItem(
        projectId: 'p1',
        entityType: 'character',
        entityId: 'char1',
        title: '青云',
        content: '一个角色',
        searchType: SearchEntityType.character,
      );

      final result = await service.search(
        projectId: 'p1',
        query: '青云',
        typeFilter: [SearchEntityType.chapter],
      );

      expect(result.isSuccess, isTrue);
      expect(
          result.valueOrNull?.every((r) => r.type == SearchEntityType.chapter),
          isTrue);
    });

    test('ranks title matches higher than content matches', () async {
      await service.indexKnowledgeItem(
        projectId: 'p1',
        entityType: 'character',
        entityId: 'char1',
        title: '青云城',
        content: '普通内容',
        searchType: SearchEntityType.character,
      );
      await service.indexKnowledgeItem(
        projectId: 'p1',
        entityType: 'character',
        entityId: 'char2',
        title: '普通标题',
        content: '他来到了青云城，这里很繁华',
        searchType: SearchEntityType.character,
      );

      final result = await service.search(
        projectId: 'p1',
        query: '青云城',
      );

      expect(result.isSuccess, isTrue);
      final results = result.valueOrNull!;
      expect(results, isNotEmpty);
      // Title match should rank higher
      expect(results.first.id, 'char1');
    });

    test('removes document from index', () async {
      await service.indexChapter(
        projectId: 'p1',
        chapterId: 'ch1',
        title: '测试',
        content: '内容',
      );
      await service.removeChapterIndex('ch1');

      final result = await service.search(
        projectId: 'p1',
        query: '测试',
      );

      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull, isEmpty);
    });

    test('returns empty for no matches', () async {
      final result = await service.search(
        projectId: 'p1',
        query: '不存在的内容',
      );

      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull, isEmpty);
    });

    test('search results have score and matched fields', () async {
      await service.indexChapter(
        projectId: 'p1',
        chapterId: 'ch1',
        title: '青云城之旅',
        content: '他来到了青云城',
      );

      final result = await service.search(
        projectId: 'p1',
        query: '青云城',
      );

      expect(result.isSuccess, isTrue);
      final scored = result.valueOrNull!;
      expect(scored, isNotEmpty);
      expect(scored.first.score, greaterThan(0));
      expect(scored.first.matchedFields, isNotEmpty);
    });
  });
}
