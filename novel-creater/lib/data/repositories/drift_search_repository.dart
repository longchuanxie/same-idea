import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/enums/note_category.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/repositories/search_repository.dart';

final class DriftSearchRepository implements SearchRepository {
  DriftSearchRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
  }) : _errorMapper = errorMapper ?? const DriftErrorMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;

  @override
  Future<AppResult<List<SearchResult>>> search({
    required String projectId,
    required String query,
    SearchEntityType? typeFilter,
  }) =>
      _errorMapper.wrapAsync(() async {
        final results = <SearchResult>[];

        if (typeFilter == null || typeFilter == SearchEntityType.character) {
          final rows = await _db.customSelect(
            "SELECT * FROM characters WHERE project_id = ? AND "
            "(name LIKE ? OR description LIKE ? OR background LIKE ?)",
            variables: [
              Variable<String>(projectId),
              Variable<String>('%$query%'),
              Variable<String>('%$query%'),
              Variable<String>('%$query%'),
            ],
          ).get();

          for (final row in rows) {
            results.add(CharacterSearchResult(
              character: _mapCharacter(row.data),
            ));
          }
        }

        if (typeFilter == null ||
            typeFilter == SearchEntityType.settingEntry) {
          final rows = await _db.customSelect(
            "SELECT * FROM setting_entries WHERE project_id = ? AND "
            "(title LIKE ? OR content LIKE ?)",
            variables: [
              Variable<String>(projectId),
              Variable<String>('%$query%'),
              Variable<String>('%$query%'),
            ],
          ).get();

          for (final row in rows) {
            results.add(SettingEntrySearchResult(
              entry: _mapSettingEntry(row.data),
            ));
          }
        }

        if (typeFilter == null || typeFilter == SearchEntityType.note) {
          final rows = await _db.customSelect(
            "SELECT * FROM notes WHERE project_id = ? AND "
            "(title LIKE ? OR content LIKE ?)",
            variables: [
              Variable<String>(projectId),
              Variable<String>('%$query%'),
              Variable<String>('%$query%'),
            ],
          ).get();

          for (final row in rows) {
            results.add(NoteSearchResult(note: _mapNote(row.data)));
          }
        }

        return AppResult<List<SearchResult>>.success(results);
      });

  Character _mapCharacter(Map<String, dynamic> data) => Character(
        id: data['id'] as String,
        projectId: data['project_id'] as String,
        name: data['name'] as String,
        description: data['description'] as String? ?? '',
        role: CharacterRole.values.byName(data['role'] as String? ?? 'supporting'),
        avatarUrl: data['avatar_url'] as String? ?? '',
        traits: (jsonDecode(data['traits_json'] as String? ?? '{}') as Map)
            .map((k, v) => MapEntry(k.toString(), v.toString())),
        background: data['background'] as String? ?? '',
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(data['created_at'] as int, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(data['updated_at'] as int, isUtc: true),
        schemaVersion: data['schema_version'] as int? ?? 1,
      );

  SettingEntry _mapSettingEntry(Map<String, dynamic> data) => SettingEntry(
        id: data['id'] as String,
        projectId: data['project_id'] as String,
        title: data['title'] as String,
        content: data['content'] as String,
        category: SettingCategory.values
            .byName(data['category'] as String? ?? 'other'),
        tags: (jsonDecode(data['tags_json'] as String? ?? '[]') as List)
            .map((e) => e.toString())
            .toList(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(data['created_at'] as int, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(data['updated_at'] as int, isUtc: true),
        schemaVersion: data['schema_version'] as int? ?? 1,
      );

  Note _mapNote(Map<String, dynamic> data) => Note(
        id: data['id'] as String,
        projectId: data['project_id'] as String,
        title: data['title'] as String,
        content: data['content'] as String,
        category:
            NoteCategory.values.byName(data['category'] as String? ?? 'misc'),
        tags: (jsonDecode(data['tags_json'] as String? ?? '[]') as List)
            .map((e) => e.toString())
            .toList(),
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(data['created_at'] as int, isUtc: true),
        updatedAt:
            DateTime.fromMillisecondsSinceEpoch(data['updated_at'] as int, isUtc: true),
        schemaVersion: data['schema_version'] as int? ?? 1,
      );
}
