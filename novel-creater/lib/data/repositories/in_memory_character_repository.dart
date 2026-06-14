import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/repositories/character_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryCharacterRepository implements CharacterRepository {
  final Map<String, Character> _characters = <String, Character>{};

  @override
  Future<AppResult<Character>> create(Character character) async {
    _characters[character.id] = character;
    return AppResult<Character>.success(character);
  }

  @override
  Future<AppResult<List<Character>>> list(String projectId) async {
    final characters = _characters.values
        .where((character) => character.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<Character>>.success(
      List<Character>.unmodifiable(characters),
    );
  }

  @override
  Future<AppResult<Character?>> get(String id) async =>
      AppResult<Character?>.success(_characters[id]);

  @override
  Future<AppResult<Character>> update(Character character) async {
    if (!_characters.containsKey(character.id)) {
      return const AppResult<Character>.failure(
        AppError(
          code: 'character.not_found',
          message: 'Character was not found.',
          userMessage: '未找到角色，无法更新。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新角色列表后重试。',
        ),
      );
    }

    final updated = character.copyWith(
      updatedAt: DateTime.now().toUtc(),
    );
    _characters[character.id] = updated;
    return AppResult<Character>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _characters.remove(id);
    return AppResult<void>.success(null);
  }
}
