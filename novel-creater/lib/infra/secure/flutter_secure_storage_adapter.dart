import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';

final class FlutterSecureStorageAdapter implements SecretStorage {
  FlutterSecureStorageAdapter({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  @override
  Future<AppResult<void>> write({
    required String ref,
    required String value,
  }) async {
    try {
      await _storage.write(key: ref, value: value);
      return const AppResult<void>.success(null);
    } on Exception catch (e) {
      return AppResult<void>.failure(_buildError(e, 'write'));
    }
  }

  @override
  Future<AppResult<String?>> read({required String ref}) async {
    try {
      final value = await _storage.read(key: ref);
      return AppResult<String?>.success(value);
    } on Exception catch (e) {
      return AppResult<String?>.failure(_buildError(e, 'read'));
    }
  }

  @override
  Future<AppResult<void>> delete({required String ref}) async {
    try {
      await _storage.delete(key: ref);
      return const AppResult<void>.success(null);
    } on Exception catch (e) {
      return AppResult<void>.failure(_buildError(e, 'delete'));
    }
  }

  @override
  Future<AppResult<List<String>>> listRefs() async {
    try {
      final entries = await _storage.readAll();
      return AppResult<List<String>>.success(
        List<String>.unmodifiable(entries.keys),
      );
    } on Exception catch (e) {
      return AppResult<List<String>>.failure(_buildError(e, 'list_refs'));
    }
  }

  AppError _buildError(Exception e, String op) => AppError(
        code: 'secret_storage.$op.failed',
        message: 'Secret storage $op failed.',
        userMessage: '安全存储操作失败，请检查设备权限后重试。',
        source: AppErrorSource.storage,
        technicalDetail: e.toString(),
        recoverable: true,
        suggestedAction: '请确认应用拥有安全存储访问权限，并稍后重试。',
      );
}
