import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

void main() {
  group('AppResult', () {
    test('success holds data', () {
      const result = AppResult<int>.success(42);
      expect(result.isSuccess, isTrue);
      expect(result.isFailure, isFalse);
    });

    test('failure holds error', () {
      const error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
      );
      final result = AppResult<int>.failure(error);
      expect(result.isSuccess, isFalse);
      expect(result.isFailure, isTrue);
    });

    test('when success calls success callback', () {
      const result = AppResult<int>.success(42);
      var called = false;
      result.when(
        success: (data) {
          called = true;
          expect(data, 42);
        },
        failure: (_) => fail('Should not be called'),
      );
      expect(called, isTrue);
    });

    test('when failure calls failure callback', () {
      const error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
      );
      final result = AppResult<int>.failure(error);
      result.when(
        success: (_) => fail('Should not be called'),
        failure: (e) => expect(e.code, 'TEST_001'),
      );
    });

    test('maybeSuccess returns data on success', () {
      const result = AppResult<int>.success(42);
      expect(result.maybeSuccess, 42);
      expect(result.maybeFailure, isNull);
    });

    test('maybeFailure returns error on failure', () {
      const error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
      );
      final result = AppResult<int>.failure(error);
      expect(result.maybeSuccess, isNull);
      expect(result.maybeFailure, isNotNull);
      expect(result.maybeFailure!.code, 'TEST_001');
    });
  });
}
