import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/enums/app_error_source.dart';
import 'package:novel_creator/domain/results/app_error.dart';

void main() {
  group('AppError', () {
    test('creates with required fields', () {
      const error = AppError(
        code: 'SAVE_001',
        message: 'Failed to save chapter',
        userMessage: 'Could not save your work',
        source: AppErrorSource.storage,
      );
      expect(error.code, 'SAVE_001');
      expect(error.recoverable, isTrue);
      expect(error.source, AppErrorSource.storage);
      expect(error.technicalDetail, isNull);
      expect(error.suggestedAction, isNull);
    });

    test('creates with optional fields', () {
      const error = AppError(
        code: 'LLM_001',
        message: 'Auth failed',
        userMessage: 'API Key may be invalid',
        source: AppErrorSource.llm,
        technicalDetail: 'HTTP 401 Unauthorized',
        suggestedAction: 'Check your API Key in Settings',
      );
      expect(error.technicalDetail, 'HTTP 401 Unauthorized');
      expect(error.suggestedAction, 'Check your API Key in Settings');
    });

    test('supports copyWith', () {
      const error = AppError(
        code: 'SAVE_001',
        message: 'Failed',
        userMessage: 'Could not save',
        recoverable: false,
        source: AppErrorSource.storage,
      );
      final updated = error.copyWith(recoverable: true);
      expect(updated.recoverable, isTrue);
      expect(updated.code, 'SAVE_001');
    });

    test('serializes to and from JSON', () {
      const error = AppError(
        code: 'SAVE_001',
        message: 'Failed',
        userMessage: 'Could not save',
        source: AppErrorSource.storage,
        technicalDetail: 'disk full',
      );
      final json = error.toJson();
      final restored = AppError.fromJson(json);
      expect(restored.code, error.code);
      expect(restored.source, error.source);
      expect(restored.technicalDetail, error.technicalDetail);
    });
  });
}
