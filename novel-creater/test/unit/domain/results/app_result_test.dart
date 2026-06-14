import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

void main() {
  group('AppResult', () {
    test('success exposes value and isSuccess true', () {
      const result = AppResult<int>.success(42);

      expect(result.isSuccess, isTrue);
      expect(result.isFailure, isFalse);
      expect(result.valueOrNull, equals(42));
      expect(result.errorOrNull, isNull);
    });

    test('failure exposes AppError and isFailure true with storage source', () {
      const error = AppError(
        code: 'storage_failed',
        message: 'Storage failed',
        userMessage: 'Unable to save your work.',
        technicalDetail: 'Disk write failed',
        recoverable: true,
        suggestedAction: 'Try again',
        source: AppErrorSource.storage,
      );

      const result = AppResult<int>.failure(error);

      expect(result.isFailure, isTrue);
      expect(result.isSuccess, isFalse);
      expect(result.errorOrNull, equals(error));
      expect(result.valueOrNull, isNull);
      expect(result.errorOrNull?.source, equals(AppErrorSource.storage));
    });
  });
}
