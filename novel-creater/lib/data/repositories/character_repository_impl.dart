import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/domain/domain.dart';

class CharacterRepositoryImpl implements CharacterRepository {
  CharacterRepositoryImpl(this._db);

  final AppDatabase _db;

  @override
  Future<AppResult<Character>> getById(String id) async {
    try {
      final row = await (_db.select(_db.charactersTable)
            ..where((t) => t.id.equals(id)))
          .getSingleOrNull();
      if (row == null) {
        return AppResult.failure(AppError(
          code: 'NOT_FOUND',
          message: 'Character not found',
          userMessage: 'Character not found',
          recoverable: false,
          source: AppErrorSource.storage,
        ));
      }
      return AppResult.success(_toEntity(row));
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load character',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<List<Character>>> getByProjectId(String projectId) async {
    try {
      final rows = await (_db.select(_db.charactersTable)
            ..where((t) => t.projectId.equals(projectId)))
          .get();
      return AppResult.success(rows.map(_toEntity).toList());
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to load characters',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Character>> create(Character character) async {
    try {
      await _db.into(_db.charactersTable).insert(_toCompanion(character));
      return AppResult.success(character);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to create character',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<Character>> update(Character character) async {
    try {
      await (_db.update(_db.charactersTable)
            ..where((t) => t.id.equals(character.id)))
          .write(_toUpdateCompanion(character));
      return AppResult.success(character);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to update character',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    try {
      await (_db.delete(_db.charactersTable)..where((t) => t.id.equals(id)))
          .go();
      return const AppResult.success(null);
    } catch (e) {
      return AppResult.failure(AppError(
        code: 'STORAGE_ERROR',
        message: e.toString(),
        userMessage: 'Failed to delete character',
        recoverable: true,
        source: AppErrorSource.storage,
      ));
    }
  }

  Character _toEntity(CharactersTableData row) {
    return Character(
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      aliases: List<String>.from(
        row.aliases.startsWith('[')
            ? jsonDecode(row.aliases) as List
            : <String>[],
      ),
      role: CharacterRole.values.byName(row.role),
      description: row.description,
      appearance: row.appearance,
      personality: row.personality,
      goals: row.goals,
      conflicts: row.conflicts,
      secrets: row.secrets,
      relationships: List<CharacterRelationship>.from(
        row.relationships.startsWith('[')
            ? (jsonDecode(row.relationships) as List)
                .map((e) => CharacterRelationship.fromJson(e as Map<String, dynamic>))
            : <CharacterRelationship>[],
      ),
      firstAppearanceChapterId: row.firstAppearanceChapterId,
      tags: List<String>.from(
        row.tags.startsWith('[')
            ? jsonDecode(row.tags) as List
            : <String>[],
      ),
      consistencyFacts: List<ConsistencyFact>.from(
        row.consistencyFacts.startsWith('[')
            ? (jsonDecode(row.consistencyFacts) as List)
                .map((e) => ConsistencyFact.fromJson(e as Map<String, dynamic>))
            : <ConsistencyFact>[],
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      schemaVersion: row.schemaVersion,
    );
  }

  CharactersTableCompanion _toCompanion(Character c) {
    return CharactersTableCompanion.insert(
      id: c.id,
      projectId: c.projectId,
      name: c.name,
      aliases: Value(jsonEncode(c.aliases)),
      role: Value(c.role.name),
      description: Value(c.description),
      appearance: Value(c.appearance),
      personality: Value(c.personality),
      goals: Value(c.goals),
      conflicts: Value(c.conflicts),
      secrets: Value(c.secrets),
      relationships: Value(jsonEncode(c.relationships.map((r) => r.toJson()).toList())),
      firstAppearanceChapterId: Value(c.firstAppearanceChapterId),
      tags: Value(jsonEncode(c.tags)),
      consistencyFacts: Value(jsonEncode(c.consistencyFacts.map((f) => f.toJson()).toList())),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      schemaVersion: Value(c.schemaVersion),
    );
  }

  CharactersTableCompanion _toUpdateCompanion(Character c) {
    return CharactersTableCompanion(
      name: Value(c.name),
      aliases: Value(jsonEncode(c.aliases)),
      role: Value(c.role.name),
      description: Value(c.description),
      appearance: Value(c.appearance),
      personality: Value(c.personality),
      goals: Value(c.goals),
      conflicts: Value(c.conflicts),
      secrets: Value(c.secrets),
      relationships: Value(jsonEncode(c.relationships.map((r) => r.toJson()).toList())),
      firstAppearanceChapterId: Value(c.firstAppearanceChapterId),
      tags: Value(jsonEncode(c.tags)),
      consistencyFacts: Value(jsonEncode(c.consistencyFacts.map((f) => f.toJson()).toList())),
      updatedAt: Value(c.updatedAt),
      schemaVersion: Value(c.schemaVersion),
    );
  }
}
