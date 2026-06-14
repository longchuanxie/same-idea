import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';

/// A point on the timeline representing a character's appearance in a chapter.
final class CharacterTimelinePoint {
  const CharacterTimelinePoint({
    required this.characterId,
    required this.characterName,
    required this.chapterId,
    required this.chapterTitle,
    required this.chapterOrder,
    required this.description,
    this.eventType = '',
    this.relatedCharacterIds = const [],
  });

  final String characterId;
  final String characterName;
  final String chapterId;
  final String chapterTitle;
  final int chapterOrder;
  final String description;
  final String eventType;
  final List<String> relatedCharacterIds;
}

/// The complete timeline for a project, organized by chapter order.
final class ProjectTimeline {
  const ProjectTimeline({
    required this.projectId,
    required this.points,
    required this.characterIds,
  });

  final String projectId;
  final List<CharacterTimelinePoint> points;
  final Set<String> characterIds;

  /// Get timeline points for a specific character.
  List<CharacterTimelinePoint> forCharacter(String characterId) =>
      points.where((p) => p.characterId == characterId).toList();

  /// Get timeline points for a specific chapter.
  List<CharacterTimelinePoint> forChapter(String chapterId) =>
      points.where((p) => p.chapterId == chapterId).toList();

  /// Get all unique chapter IDs in order.
  List<String> get chapterIds =>
      points.map((p) => p.chapterId).toSet().toList();
}

/// Service for building character timelines from project data.
abstract interface class TimelineService {
  /// Build a project timeline from chapters and characters.
  /// Scans chapter content for character name mentions.
  ProjectTimeline buildTimeline({
    required String projectId,
    required List<Chapter> chapters,
    required List<Character> characters,
  });
}
