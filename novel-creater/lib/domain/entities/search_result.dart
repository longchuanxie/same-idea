import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';

enum SearchEntityType { character, settingEntry, note, chapter }

sealed class SearchResult {
  const SearchResult();

  String get id;
  String get title;
  String get snippet;
  SearchEntityType get type;
}

final class CharacterSearchResult extends SearchResult {
  const CharacterSearchResult({
    required this.character,
  });

  final Character character;

  @override
  String get id => character.id;

  @override
  String get title => character.name;

  @override
  String get snippet => character.description;

  @override
  SearchEntityType get type => SearchEntityType.character;
}

final class SettingEntrySearchResult extends SearchResult {
  const SettingEntrySearchResult({
    required this.entry,
  });

  final SettingEntry entry;

  @override
  String get id => entry.id;

  @override
  String get title => entry.title;

  @override
  String get snippet => entry.content.length > 120
      ? '${entry.content.substring(0, 120)}...'
      : entry.content;

  @override
  SearchEntityType get type => SearchEntityType.settingEntry;
}

final class NoteSearchResult extends SearchResult {
  const NoteSearchResult({
    required this.note,
  });

  final Note note;

  @override
  String get id => note.id;

  @override
  String get title => note.title;

  @override
  String get snippet =>
      note.content.length > 120 ? '${note.content.substring(0, 120)}...' : note.content;

  @override
  SearchEntityType get type => SearchEntityType.note;
}

final class ChapterSearchResult extends SearchResult {
  const ChapterSearchResult({
    required this.chapterId,
    required this.chapterTitle,
    required this.contentSnippet,
  });

  final String chapterId;
  final String chapterTitle;
  final String contentSnippet;

  @override
  String get id => chapterId;

  @override
  String get title => chapterTitle;

  @override
  String get snippet => contentSnippet;

  @override
  SearchEntityType get type => SearchEntityType.chapter;
}
