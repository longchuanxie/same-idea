import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/services/timeline_service.dart';

/// Builds timelines by scanning chapter content for character name mentions.
final class RuleBasedTimelineBuilder implements TimelineService {
  const RuleBasedTimelineBuilder();

  @override
  ProjectTimeline buildTimeline({
    required String projectId,
    required List<Chapter> chapters,
    required List<Character> characters,
  }) {
    final points = <CharacterTimelinePoint>[];
    final charIds = <String>{};

    // Build name -> character lookup (including aliases)
    final nameToCharacter = <String, Character>{};
    for (final char in characters) {
      nameToCharacter[char.name] = char;
      for (final alias in char.aliases) {
        nameToCharacter[alias] = char;
      }
    }

    // Scan each chapter for character mentions
    for (var chapterIdx = 0; chapterIdx < chapters.length; chapterIdx++) {
      final chapter = chapters[chapterIdx];
      final content = chapter.plainTextCache;
      if (content.isEmpty) continue;

      final foundInChapter = <String, Character>{};

      for (final entry in nameToCharacter.entries) {
        if (content.contains(entry.key)) {
          foundInChapter[entry.key] = entry.value;
        }
      }

      // Group by character to avoid duplicates from aliases
      final charAppearances = <String, List<String>>{};
      for (final entry in foundInChapter.entries) {
        charAppearances.putIfAbsent(entry.value.id, () => []).add(entry.key);
      }

      for (final appearance in charAppearances.entries) {
        final char = characters.firstWhere((c) => c.id == appearance.key);
        charIds.add(char.id);

        // Find other characters mentioned in the same chapter
        final relatedIds = charAppearances.keys
            .where((id) => id != char.id)
            .toList();

        points.add(CharacterTimelinePoint(
          characterId: char.id,
          characterName: char.name,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterOrder: chapterIdx,
          description: '${char.name}出现在"${chapter.title}"',
          eventType: 'appearance',
          relatedCharacterIds: relatedIds,
        ));
      }
    }

    // Sort by chapter order
    points.sort((a, b) => a.chapterOrder.compareTo(b.chapterOrder));

    return ProjectTimeline(
      projectId: projectId,
      points: List.unmodifiable(points),
      characterIds: Set.unmodifiable(charIds),
    );
  }
}
