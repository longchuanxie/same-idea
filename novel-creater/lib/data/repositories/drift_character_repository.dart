import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/character_mapper.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftCharacterRepository implements CharacterRepository {
  DriftCharacterRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    CharacterMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const CharacterMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final CharacterMapper _mapper;

  @override
  Future<AppResult<Character>> create(Character character) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.characters).insert(_mapper.toRow(character));
        return AppResult<Character>.success(character);
      });

  @override
  Future<AppResult<List<Character>>> list(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.characters)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.asc(t.name)]))
            .get();
        return AppResult<List<Character>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Character?>> get(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.characters)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<Character?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<Character>> update(Character character) =>
      _errorMapper.wrapAsync(() async {
        final updated = character.copyWith(
          updatedAt: DateTime.now().toUtc(),
        );
        final count = await (_db.update(_db.characters)
              ..where((t) => t.id.equals(character.id)))
            .write(
          CharactersCompanion(
            name: Value(updated.name),
            description: Value(updated.description),
            role: Value(updated.role.name),
            avatarUrl: Value(updated.avatarUrl),
            traitsJson: Value(jsonEncode(updated.traits)),
            background: Value(updated.background),
            updatedAt: Value(updated.updatedAt.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<Character>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Character not found.',
              userMessage: '未找到角色。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return AppResult<Character>.success(updated);
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        final count = await (_db.delete(_db.characters)
              ..where((t) => t.id.equals(id)))
            .go();
        if (count == 0) {
          return const AppResult<void>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Character not found.',
              userMessage: '未找到角色。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return const AppResult<void>.success(null);
      });
}
