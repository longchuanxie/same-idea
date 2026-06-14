import 'package:novel_creator/domain/results/app_result.dart';

abstract class SecretStorage {
  Future<AppResult<void>> write({required String ref, required String value});

  Future<AppResult<String?>> read({required String ref});

  Future<AppResult<void>> delete({required String ref});

  Future<AppResult<List<String>>> listRefs();
}
