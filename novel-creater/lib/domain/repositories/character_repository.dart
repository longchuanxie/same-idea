import 'package:novel_creator/domain/domain.dart';

abstract class CharacterRepository {
  Future<AppResult<Character>> getById(String id);
  Future<AppResult<List<Character>>> getByProjectId(String projectId);
  Future<AppResult<Character>> create(Character character);
  Future<AppResult<Character>> update(Character character);
  Future<AppResult<void>> delete(String id);
}
