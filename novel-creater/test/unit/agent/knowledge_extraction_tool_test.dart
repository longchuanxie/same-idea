import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/rule_based_knowledge_extractor.dart';

void main() {
  group('RuleBasedKnowledgeExtractor', () {
    const extractor = RuleBasedKnowledgeExtractor();

    test('extracts characters from dialogue patterns', () async {
      const content = '林风说道："我们走吧。"苏晴笑道："好。"';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.extractedCharacters, isNotEmpty);
    });

    test('does not extract already known characters', () async {
      const content = '林风说道："走吧。"';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: ['林风'],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.extractedCharacters.where((c) => c.name == '林风'), isEmpty);
    });

    test('extracts location settings', () async {
      const content = '他们来到了青云城，这里是一片繁华的景象。';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.extractedSettingEntries, isNotEmpty);
    });

    test('extracts power system settings', () async {
      const content = '他修炼了九阳真经心法，修为突破到了新的境界。';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.extractedSettingEntries, isNotEmpty);
    });

    test('extracts plot events', () async {
      const content = '突然，一道闪电劈下，整个天空都亮了起来，众人惊恐万分。';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.extractedNotes, isNotEmpty);
    });

    test('returns empty result for text with no patterns', () async {
      const content = '这是一段普通的文字，没有特殊模式。';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.isEmpty, isTrue);
    });

    test('result contains correct source chapter id', () async {
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'ch_42',
        chapterContent: '普通内容',
        existingCharacterNames: [],
      );
      expect(result.valueOrNull?.sourceChapterId, 'ch_42');
    });

    test('summary describes what was found', () async {
      const content = '林风说道："走。"他们来到了天机城。突然，天空裂开。';
      final result = await extractor.extract(
        projectId: 'p1',
        chapterId: 'c1',
        chapterContent: content,
        existingCharacterNames: [],
      );
      expect(result.isSuccess, isTrue);
      final data = result.valueOrNull!;
      expect(data.summary, isNotEmpty);
    });
  });
}
