import 'package:novel_creator/agent/knowledge_extraction_result.dart';
import 'package:novel_creator/agent/knowledge_extraction_tool.dart';
import 'package:novel_creator/domain/enums/note_category.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

/// Rule-based knowledge extractor using pattern matching.
/// Detects character names, setting references, and plot points
/// from chapter text without requiring LLM.
final class RuleBasedKnowledgeExtractor implements KnowledgeExtractionTool {
  const RuleBasedKnowledgeExtractor();

  @override
  Future<AppResult<KnowledgeExtractionResult>> extract({
    required String projectId,
    required String chapterId,
    required String chapterContent,
    required List<String> existingCharacterNames,
    List<String>? focusAreas,
  }) async {
    try {
      final characters =
          _extractCharacters(chapterContent, existingCharacterNames);
      final settings = _extractSettings(chapterContent);
      final notes = _extractNotes(chapterContent);

      return AppResult<KnowledgeExtractionResult>.success(
        KnowledgeExtractionResult(
          extractedCharacters: characters,
          extractedSettingEntries: settings,
          extractedNotes: notes,
          sourceChapterId: chapterId,
          summary: _generateSummary(
            characters.length,
            settings.length,
            notes.length,
          ),
        ),
      );
    } catch (e) {
      return AppResult<KnowledgeExtractionResult>.failure(
        AppError(
          code: 'knowledge_extraction.failed',
          message: e.toString(),
          userMessage: '知识提取失败。',
          source: AppErrorSource.llm,
          recoverable: true,
        ),
      );
    }
  }

  /// Extract character names from text using Chinese name patterns.
  List<ExtractedCharacter> _extractCharacters(
    String content,
    List<String> existingNames,
  ) {
    final characters = <ExtractedCharacter>[];
    final foundNames = <String>{};

    // Pattern 1: Chinese names (2-3 character names preceded by common markers)
    final namePatterns = [
      RegExp(r'(?<=[说道笑喊叫回答问想着看])([\u4e00-\u9fff]{2,3})'),
      RegExp(r'^([\u4e00-\u9fff]{2,3})(?=说道|笑道|喊道|叫道|回答|问道|想着|看着)'),
      RegExp('"([\u4e00-\u9fff]{2,3})[说道笑喊叫]'),
    ];

    for (final pattern in namePatterns) {
      for (final match in pattern.allMatches(content)) {
        final name = match.group(1);
        if (name != null &&
            name.length >= 2 &&
            name.length <= 3 &&
            !_isCommonWord(name) &&
            !existingNames.contains(name) &&
            !foundNames.contains(name)) {
          foundNames.add(name);
          characters.add(ExtractedCharacter(
            name: name,
            description: _extractCharacterDescription(content, name),
            confidence: 0.6,
          ),);
        }
      }
    }

    return characters;
  }

  /// Extract setting-related information from text.
  List<ExtractedSettingEntry> _extractSettings(String content) {
    final settings = <ExtractedSettingEntry>[];
    final foundTitles = <String>{};

    // Pattern: location descriptions
    final locationPattern = RegExp(
      r'(?:在|来到|走进|离开|回到)([\u4e00-\u9fff]{2,8}(?:城|镇|村|山|谷|岛|宫|殿|阁|楼|院|府|营|寨|洞))',
    );
    for (final match in locationPattern.allMatches(content)) {
      final location = match.group(1);
      if (location != null && !foundTitles.contains(location)) {
        foundTitles.add(location);
        settings.add(ExtractedSettingEntry(
          title: location,
          content: _extractContext(content, location, 100),
          category: SettingCategory.geography,
          tags: ['地点', '自动提取'],
          confidence: 0.5,
        ),);
      }
    }

    // Pattern: power/magic system terms
    final powerPattern = RegExp(
      r'([\u4e00-\u9fff]{2,6}(?:功法|心法|秘术|阵法|法术|灵力|真气|内力|修为|境界))',
    );
    for (final match in powerPattern.allMatches(content)) {
      final term = match.group(1);
      if (term != null && !foundTitles.contains(term)) {
        foundTitles.add(term);
        settings.add(ExtractedSettingEntry(
          title: term,
          content: _extractContext(content, term, 100),
          category: SettingCategory.magicSystem,
          tags: ['力量体系', '自动提取'],
          confidence: 0.5,
        ),);
      }
    }

    return settings;
  }

  /// Extract plot-relevant notes from text.
  List<ExtractedNote> _extractNotes(String content) {
    final notes = <ExtractedNote>[];
    final foundTitles = <String>{};

    // Pattern: key events marked by transitional phrases
    final eventPatterns = [
      RegExp(r'(?:突然|忽然|就在这时|此时|就在此刻)([^。！？\n]{10,50})'),
      RegExp(r'(?:终于|最终|最后)([^。！？\n]{10,50})'),
    ];

    for (final pattern in eventPatterns) {
      for (final match in pattern.allMatches(content)) {
        final event = match.group(1);
        if (event != null &&
            event.length >= 10 &&
            !foundTitles.contains(event)) {
          final title = event.length > 20
              ? '事件: ${event.substring(0, 20)}...'
              : '事件: $event';
          foundTitles.add(event);
          notes.add(ExtractedNote(
            title: title,
            content: event,
            category: NoteCategory.plot,
            tags: ['情节', '自动提取'],
            confidence: 0.4,
          ),);
        }
      }
    }

    return notes;
  }

  /// Extract a brief description for a character from surrounding context.
  String _extractCharacterDescription(String content, String name) {
    final idx = content.indexOf(name);
    if (idx < 0) return '';
    final start = idx > 50 ? idx - 50 : 0;
    final end = idx + name.length + 100 < content.length
        ? idx + name.length + 100
        : content.length;
    return content.substring(start, end);
  }

  /// Extract surrounding context for a term.
  String _extractContext(String content, String term, int contextLength) {
    final idx = content.indexOf(term);
    if (idx < 0) return '';
    final start = idx > contextLength ? idx - contextLength : 0;
    final end = idx + term.length + contextLength < content.length
        ? idx + term.length + contextLength
        : content.length;
    return content.substring(start, end);
  }

  /// Check if a name is actually a common Chinese word.
  bool _isCommonWord(String name) {
    const commonWords = {
      '什么', '怎么', '这个', '那个', '自己', '他们', '我们', '她们',
      '这里', '那里', '现在', '已经', '可以', '不是', '没有', '但是',
      '因为', '所以', '如果', '虽然', '而且', '或者', '之后', '之前',
      '一下', '一点', '一些', '一直', '一样', '一般', '一切', '一定',
      '起来', '出来', '过来', '回来', '进去', '上去', '下去',
      '的话', '时候', '地方', '东西', '样子', '办法', '问题', '关系',
      '知道', '看到', '听到', '觉得', '认为', '开始', '继续', '完成',
      '说道', '笑道', '喊道', '叫道', '回答', '问道', '想着', '看着',
    };
    return commonWords.contains(name);
  }

  String _generateSummary(int charCount, int settingCount, int noteCount) {
    final parts = <String>[];
    if (charCount > 0) parts.add('$charCount 个角色');
    if (settingCount > 0) parts.add('$settingCount 条设定');
    if (noteCount > 0) parts.add('$noteCount 条笔记');
    if (parts.isEmpty) return '未发现新的知识条目';
    return '发现 ${parts.join("、")}';
  }
}
