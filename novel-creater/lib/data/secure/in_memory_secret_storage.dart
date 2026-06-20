import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';

final class InMemorySecretStorage implements SecretStorage {
  final Map<String, String> _store = <String, String>{};

  @override
  Future<AppResult<void>> write({
    required String ref,
    required String value,
  }) async {
    _store[ref] = value;
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<String?>> read({required String ref}) async =>
      AppResult<String?>.success(_store[ref]);

  @override
  Future<AppResult<void>> delete({required String ref}) async {
    _store.remove(ref);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<List<String>>> listRefs() async =>
      AppResult<List<String>>.success(
        List<String>.unmodifiable(_store.keys),
      );
}
