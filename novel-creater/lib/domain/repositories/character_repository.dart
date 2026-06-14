import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class CharacterRepository {
  Future<AppResult<Character>> create(Character character);

  Future<AppResult<List<Character>>> list(String projectId);

  Future<AppResult<Character?>> get(String id);

  Future<AppResult<Character>> update(Character character);

  Future<AppResult<void>> delete(String id);
}
