import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/enums/note_category.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';

/// Result of extracting knowledge from chapter text.
/// The tool returns structured suggestions; the application layer
/// decides whether to write them to the knowledge base.
final class KnowledgeExtractionResult {
  const KnowledgeExtractionResult({
    required this.extractedCharacters,
    required this.extractedSettingEntries,
    required this.extractedNotes,
    required this.sourceChapterId,
    required this.summary,
  });

  /// Newly discovered character info (name + description hints).
  final List<ExtractedCharacter> extractedCharacters;

  /// Newly discovered setting info.
  final List<ExtractedSettingEntry> extractedSettingEntries;

  /// Newly discovered notes.
  final List<ExtractedNote> extractedNotes;

  /// The chapter this was extracted from.
  final String sourceChapterId;

  /// Summary of what was found.
  final String summary;

  bool get isEmpty =>
      extractedCharacters.isEmpty &&
      extractedSettingEntries.isEmpty &&
      extractedNotes.isEmpty;
}

/// A character extracted from text.
final class ExtractedCharacter {
  const ExtractedCharacter({
    required this.name,
    this.description = '',
    this.role = CharacterRole.supporting,
    this.appearance = '',
    this.personality = '',
    this.aliases = const [],
    this.consistencyFacts = const [],
    this.confidence = 0.0,
  });

  final String name;
  final String description;
  final CharacterRole role;
  final String appearance;
  final String personality;
  final List<String> aliases;
  final List<String> consistencyFacts;

  /// Confidence score 0.0-1.0 for how likely this is a real character.
  final double confidence;
}

/// A setting entry extracted from text.
final class ExtractedSettingEntry {
  const ExtractedSettingEntry({
    required this.title,
    this.content = '',
    this.category = SettingCategory.other,
    this.tags = const [],
    this.confidence = 0.0,
  });

  final String title;
  final String content;
  final SettingCategory category;
  final List<String> tags;
  final double confidence;
}

/// A note extracted from text.
final class ExtractedNote {
  const ExtractedNote({
    required this.title,
    this.content = '',
    this.category = NoteCategory.misc,
    this.tags = const [],
    this.confidence = 0.0,
  });

  final String title;
  final String content;
  final NoteCategory category;
  final List<String> tags;
  final double confidence;
}
