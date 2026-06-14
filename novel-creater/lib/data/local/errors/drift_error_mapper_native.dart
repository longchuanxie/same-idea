import 'package:drift/drift.dart';
import 'package:drift/native.dart' show SqliteException;
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftErrorMapper {
  const DriftErrorMapper();

  Future<AppResult<T>> wrapAsync<T>(
    Future<AppResult<T>> Function() block,
  ) async {
    try {
      return await block();
    } on SqliteException catch (e) {
      return AppResult<T>.failure(_mapSqliteException(e));
    } on DriftWrappedException catch (e) {
      return AppResult<T>.failure(_mapDriftWrapped(e));
    }
  }

  AppError _mapSqliteException(SqliteException e) {
    final msg = e.message;
    final isConstraint = msg.contains('constraint failed');
    final isUnique = isConstraint && msg.contains('UNIQUE');
    final isFk = isConstraint && msg.contains('FOREIGN KEY');
    final isNotNull = isConstraint && msg.contains('NOT NULL');
    final isCheck = isConstraint && msg.contains('CHECK');

    String code;
    String userMessage;
    bool recoverable;

    if (isUnique) {
      code = 'database.unique_violation';
      userMessage = '记录已存在，无法保存。';
      recoverable = false;
    } else if (isFk || isNotNull || isCheck) {
      code = 'database.constraint_violation';
      userMessage = '数据冲突，无法保存。';
      recoverable = false;
    } else {
      code = 'database.write_failed';
      userMessage = '保存失败，请重试。';
      recoverable = true;
    }

    return AppError(
      code: code,
      message: 'Database error: $msg',
      userMessage: userMessage,
      source: AppErrorSource.storage,
      recoverable: recoverable,
      technicalDetail: e.toString(),
    );
  }

  AppError _mapDriftWrapped(DriftWrappedException e) => AppError(
        code: 'database.unexpected',
        message: 'Unexpected database error.',
        userMessage: '数据库错误',
        source: AppErrorSource.storage,
        recoverable: true,
        technicalDetail: e.toString(),
      );
}
