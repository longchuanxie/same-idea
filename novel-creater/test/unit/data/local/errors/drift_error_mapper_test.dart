import 'package:drift/drift.dart';
import 'package:drift/native.dart' show SqliteException;
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/domain/results/app_result.dart';

void main() {
  group('DriftErrorMapper', () {
    const mapper = DriftErrorMapper();

    Future<AppResult<int>> wrapThrow(Object error) =>
        // ignore: only_throw_errors
        mapper.wrapAsync<int>(() async => throw error);

    test('maps UNIQUE constraint failed to unique_violation', () async {
      final result = await wrapThrow(
        SqliteException(2067, 'UNIQUE constraint failed: projects.id'),
      );
      expect(result, isA<AppFailure<int>>());
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.unique_violation');
      expect(error.recoverable, isFalse);
    });

    test('maps FOREIGN KEY failure to constraint_violation', () async {
      final result = await wrapThrow(
        SqliteException(787, 'FOREIGN KEY constraint failed'),
      );
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.constraint_violation');
      expect(error.recoverable, isFalse);
    });

    test('maps NOT NULL failure to constraint_violation', () async {
      final result = await wrapThrow(
        SqliteException(1299, 'NOT NULL constraint failed: chapters.title'),
      );
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.constraint_violation');
    });

    test('maps CHECK failure to constraint_violation', () async {
      final result = await wrapThrow(
        SqliteException(275, 'CHECK constraint failed: id'),
      );
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.constraint_violation');
    });

    test('maps generic SqliteException to write_failed', () async {
      final result = await wrapThrow(SqliteException(1, 'disk I/O error'));
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.write_failed');
      expect(error.recoverable, isTrue);
    });

    test('maps DriftWrappedException to unexpected', () async {
      final result = await wrapThrow(
        DriftWrappedException(
          message: 'wrapped',
          cause: Exception('oops'),
          trace: StackTrace.current,
        ),
      );
      final error = (result as AppFailure<int>).error;
      expect(error.code, 'database.unexpected');
      expect(error.recoverable, isTrue);
    });

    test('passes through successful results unchanged', () async {
      final result = await mapper.wrapAsync<int>(
        () async => const AppResult<int>.success(42),
      );
      expect(result, isA<AppSuccess<int>>());
      expect((result as AppSuccess<int>).value, 42);
    });
  });
}
