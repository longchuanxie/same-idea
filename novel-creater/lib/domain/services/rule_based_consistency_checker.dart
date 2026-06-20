import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/consistency_check_type.dart';
import 'package:novel_creator/domain/services/consistency_check_result.dart';
import 'package:novel_creator/domain/services/consistency_check_service.dart';

final class RuleBasedConsistencyChecker implements ConsistencyCheckService {
  const RuleBasedConsistencyChecker();

  @override
  Future<ConsistencyCheckResult> check({
    required String projectId,
    required List<Chapter> chapters,
    required List<Character> characters,
    required List<SettingEntry> settingEntries,
    required List<Note> notes,
    List<ConsistencyCheckType>? types,
  }) async {
    final typesToCheck = types ?? ConsistencyCheckType.values;
    final issues = <ConsistencyIssue>[];

    for (final type in typesToCheck) {
      switch (type) {
        case ConsistencyCheckType.characterBehavior:
          issues.addAll(_checkCharacterBehavior(characters, chapters));
        case ConsistencyCheckType.appearanceConflict:
          issues.addAll(_checkAppearanceConflict(characters, chapters));
        case ConsistencyCheckType.timelineConflict:
          issues.addAll(_checkTimelineConflict(characters, chapters));
        case ConsistencyCheckType.settingViolation:
          issues.addAll(_checkSettingViolation(settingEntries, chapters));
        case ConsistencyCheckType.relationshipLogic:
          issues.addAll(_checkRelationshipLogic(characters));
        case ConsistencyCheckType.namingInconsistency:
          issues.addAll(_checkNamingInconsistency(characters));
      }
    }

    return ConsistencyCheckResult(
      projectId: projectId,
      issues: List.unmodifiable(issues),
      checkedAt: DateTime.now().toUtc(),
      typesChecked: typesToCheck,
    );
  }

  /// Check 1: Character behavior contradictions.
  /// Detects when a character's consistencyFacts contradict each other
  /// or when a character's traits conflict with their described behavior.
  List<ConsistencyIssue> _checkCharacterBehavior(
    List<Character> characters,
    List<Chapter> chapters,
  ) {
    final issues = <ConsistencyIssue>[];
    for (final char in characters) {
      if (char.consistencyFacts.length < 2) continue;
      // Check for negation patterns in consistency facts
      for (var i = 0; i < char.consistencyFacts.length; i++) {
        for (var j = i + 1; j < char.consistencyFacts.length; j++) {
          final factA = char.consistencyFacts[i];
          final factB = char.consistencyFacts[j];
          if (_areContradictory(factA, factB)) {
            issues.add(ConsistencyIssue(
              type: ConsistencyCheckType.characterBehavior,
              severity: ConsistencyIssueSeverity.warning,
              description: '${char.name} 的行为特征存在矛盾',
              evidence: '事实A: "$factA" vs 事实B: "$factB"',
              characterIds: [char.id],
              suggestedFix: '请检查并统一角色的行为描述',
            ),);
          }
        }
      }
    }
    return issues;
  }

  /// Check 2: Appearance description conflicts.
  /// Detects when a character's appearance field contradicts consistencyFacts.
  List<ConsistencyIssue> _checkAppearanceConflict(
    List<Character> characters,
    List<Chapter> chapters,
  ) {
    final issues = <ConsistencyIssue>[];
    for (final char in characters) {
      if (char.appearance.isEmpty) continue;
      for (final fact in char.consistencyFacts) {
        if (_mentionsAppearance(fact) &&
            _areContradictory(char.appearance, fact)) {
          issues.add(ConsistencyIssue(
            type: ConsistencyCheckType.appearanceConflict,
            severity: ConsistencyIssueSeverity.error,
            description: '${char.name} 的外貌描述存在冲突',
            evidence: '外貌: "${char.appearance}" vs 事实: "$fact"',
            characterIds: [char.id],
            suggestedFix: '请统一角色的外貌描述',
          ),);
        }
      }
    }
    return issues;
  }

  /// Check 3: Timeline conflicts.
  /// Detects when characters appear in chapters with
  /// conflicting temporal references.
  /// Uses chapter ordering as a proxy for timeline.
  List<ConsistencyIssue> _checkTimelineConflict(
    List<Character> characters,
    List<Chapter> chapters,
  ) {
    final issues = <ConsistencyIssue>[];
    // Check if a character mentioned in an earlier chapter has a background
    // that references events that happen in later chapters
    final characterByName = <String, Character>{};
    for (final char in characters) {
      characterByName[char.name] = char;
      for (final alias in char.aliases) {
        characterByName[alias] = char;
      }
    }
    // Simple check: if a character's background mentions another character
    // that hasn't been introduced yet (not mentioned in earlier chapters)
    for (final char in characters) {
      if (char.background.isEmpty) continue;
      for (final otherChar in characters) {
        if (char.id == otherChar.id) continue;
        if (char.background.contains(otherChar.name) ||
            otherChar.aliases.any((a) => char.background.contains(a))) {
          // Check if otherChar appears in any chapter before this character
          final charFirstAppearance = _findFirstMention(char.name, chapters);
          final otherFirstAppearance =
              _findFirstMention(otherChar.name, chapters);
          if (charFirstAppearance != null &&
              otherFirstAppearance != null &&
              otherFirstAppearance > charFirstAppearance) {
            issues.add(ConsistencyIssue(
              type: ConsistencyCheckType.timelineConflict,
              severity: ConsistencyIssueSeverity.info,
              description: '${char.name} 的背景提及'
                  ' ${otherChar.name}，但后者出场较晚',
              evidence:
                  '${char.name} 首次出场: 第${charFirstAppearance + 1}章, '
                  '${otherChar.name} 首次出场: '
                  '第${otherFirstAppearance + 1}章',
              characterIds: [char.id, otherChar.id],
              suggestedFix: '请确认时间线逻辑是否合理',
            ),);
          }
        }
      }
    }
    return issues;
  }

  /// Check 4: Setting rule violations.
  /// Detects when chapter content contradicts established setting rules.
  List<ConsistencyIssue> _checkSettingViolation(
    List<SettingEntry> settingEntries,
    List<Chapter> chapters,
  ) {
    final issues = <ConsistencyIssue>[];
    for (final entry in settingEntries) {
      if (entry.content.isEmpty) continue;
      // Extract key terms from setting entries
      final keyTerms = _extractKeyTerms(entry.content);
      for (final chapter in chapters) {
        if (chapter.plainTextCache.isEmpty) continue;
        for (final term in keyTerms) {
          if (chapter.plainTextCache.contains(term)) {
            // Chapter mentions a setting term - check if context contradicts
            // This is a simple heuristic; LLM can do deeper analysis
            final contradictions = _findSettingContradictions(
              entry.content,
              chapter.plainTextCache,
              term,
            );
            for (final contradiction in contradictions) {
              issues.add(ConsistencyIssue(
                type: ConsistencyCheckType.settingViolation,
                severity: ConsistencyIssueSeverity.warning,
                description:
                    '章节"${chapter.title}"可能违反设定"${entry.title}"',
                evidence: contradiction,
                characterIds: [],
                chapterId: chapter.id,
                suggestedFix: '请检查章节内容是否与设定规则一致',
              ),);
            }
          }
        }
      }
    }
    return issues;
  }

  /// Check 5: Relationship logic conflicts.
  /// Detects asymmetric or contradictory relationships.
  List<ConsistencyIssue> _checkRelationshipLogic(List<Character> characters) {
    final issues = <ConsistencyIssue>[];
    final charById = <String, Character>{};
    for (final char in characters) {
      charById[char.id] = char;
    }

    for (final char in characters) {
      for (final rel in char.relationships) {
        final target = charById[rel.targetCharacterId];
        if (target == null) {
          issues.add(ConsistencyIssue(
            type: ConsistencyCheckType.relationshipLogic,
            severity: ConsistencyIssueSeverity.error,
            description: '${char.name} 的关系指向了不存在的角色',
            evidence: '关系: ${rel.relationType} -> ID ${rel.targetCharacterId}',
            characterIds: [char.id],
            suggestedFix: '请检查角色关系中的目标角色是否存在',
          ),);
          continue;
        }
        // Check for asymmetric relationships that should be symmetric
        // e.g., if A is parent of B, B should have child relationship to A
        final reciprocalTypes = _getReciprocalRelationType(rel.relationType);
        if (reciprocalTypes != null) {
          final hasReciprocal = target.relationships.any(
            (r) =>
                r.targetCharacterId == char.id &&
                reciprocalTypes.contains(r.relationType),
          );
          if (!hasReciprocal) {
            issues.add(ConsistencyIssue(
              type: ConsistencyCheckType.relationshipLogic,
              severity: ConsistencyIssueSeverity.info,
              description:
                  '${char.name} 与 ${target.name} 的关系可能缺少反向关系',
              evidence: '${char.name} -> ${target.name}: ${rel.relationType}, '
                  '但 ${target.name} 没有对应的反向关系',
              characterIds: [char.id, target.id],
              suggestedFix: '请添加对应的反向关系',
            ),);
          }
        }
      }
    }
    return issues;
  }

  /// Check 6: Naming inconsistencies.
  /// Detects duplicate names or aliases across characters.
  List<ConsistencyIssue> _checkNamingInconsistency(List<Character> characters) {
    final issues = <ConsistencyIssue>[];
    final nameToChars = <String, List<String>>{};

    for (final char in characters) {
      nameToChars.putIfAbsent(char.name, () => []).add(char.id);
      for (final alias in char.aliases) {
        nameToChars.putIfAbsent(alias, () => []).add(char.id);
      }
    }

    for (final entry in nameToChars.entries) {
      if (entry.value.length > 1) {
        issues.add(ConsistencyIssue(
          type: ConsistencyCheckType.namingInconsistency,
          severity: ConsistencyIssueSeverity.warning,
          description: '名称"${entry.key}"被多个角色使用',
          evidence: '涉及角色ID: ${entry.value.join(", ")}',
          characterIds: entry.value,
          suggestedFix: '请确认名称是否需要区分',
        ),);
      }
    }
    return issues;
  }

  // --- Helper methods ---

  /// Detects simple negation contradictions between two texts.
  bool _areContradictory(String a, String b) {
    final aLower = a.toLowerCase();
    final bLower = b.toLowerCase();
    // Check for negation patterns
    const negationWords = ['不', '没有', '从未', '不会', '不能', '非', '无', '别'];
    for (final neg in negationWords) {
      if (aLower.contains(neg) && !bLower.contains(neg)) {
        // Remove negation from a and check if similar to b
        final aWithoutNeg = aLower.replaceAll(neg, '');
        if (_textSimilarity(aWithoutNeg, bLower) > 0.5) {
          return true;
        }
      }
      if (bLower.contains(neg) && !aLower.contains(neg)) {
        final bWithoutNeg = bLower.replaceAll(neg, '');
        if (_textSimilarity(aLower, bWithoutNeg) > 0.5) {
          return true;
        }
      }
    }
    return false;
  }

  /// Simple text similarity based on common character ratio.
  double _textSimilarity(String a, String b) {
    if (a.isEmpty || b.isEmpty) return 0;
    final aChars = a.runes.toSet();
    final bChars = b.runes.toSet();
    final intersection = aChars.intersection(bChars).length;
    final union = aChars.union(bChars).length;
    return union == 0 ? 0 : intersection / union;
  }

  bool _mentionsAppearance(String text) {
    const appearanceKeywords = [
      '身高',
      '体型',
      '头发',
      '眼睛',
      '肤色',
      '脸',
      '穿着',
      '外貌',
      '长相',
      '容貌',
    ];
    return appearanceKeywords.any((k) => text.contains(k));
  }

  int? _findFirstMention(String name, List<Chapter> chapters) {
    for (var i = 0; i < chapters.length; i++) {
      if (chapters[i].plainTextCache.contains(name)) {
        return i;
      }
    }
    return null;
  }

  List<String> _extractKeyTerms(String content) =>
      content
          .split(RegExp(r'[，。；！？\n,.;!?]'))
          .map((s) => s.trim())
          .where((s) => s.length >= 2 && s.length <= 20)
          .toList();

  List<String> _findSettingContradictions(
    String settingContent,
    String chapterContent,
    String term,
  ) {
    // Simple heuristic: if setting says "X不能Y" and chapter contains "X Y"
    final contradictions = <String>[];
    final negationPatterns = [
      RegExp('不能$term'),
      RegExp('不可$term'),
      RegExp('禁止$term'),
      RegExp('无法$term'),
    ];
    for (final pattern in negationPatterns) {
      if (settingContent.contains(pattern)) {
        // Check if chapter violates this
        final violationPattern =
            RegExp('$term[^，。；！？\n,.;!?]{0,10}');
        final match = violationPattern.firstMatch(chapterContent);
        if (match != null) {
          contradictions
              .add('设定: "${pattern.pattern}" vs 章节: "${match.group(0)}"');
        }
      }
    }
    return contradictions;
  }

  /// Returns reciprocal relation types for common relationship types.
  List<String>? _getReciprocalRelationType(String relationType) {
    const reciprocalMap = <String, List<String>>{
      '父母': ['子女'],
      '子女': ['父母'],
      '师徒': ['师徒'],
      '夫妻': ['夫妻'],
      '兄弟': ['兄弟'],
      '姐妹': ['姐妹'],
      '兄妹': ['兄妹'],
      '朋友': ['朋友'],
      '敌人': ['敌人'],
      '盟友': ['盟友'],
      '上司': ['下属'],
      '下属': ['上司'],
      'parent': ['child'],
      'child': ['parent'],
      'spouse': ['spouse'],
      'sibling': ['sibling'],
      'friend': ['friend'],
      'enemy': ['enemy'],
      'ally': ['ally'],
      'mentor': ['mentee'],
      'mentee': ['mentor'],
    };
    return reciprocalMap[relationType];
  }
}
