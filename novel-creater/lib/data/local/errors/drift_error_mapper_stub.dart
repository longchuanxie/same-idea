import 'package:drift/drift.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftErrorMapper {
  const DriftErrorMapper();

  Future<AppResult<T>> wrapAsync<T>(
    Future<AppResult<T>> Function() block,
  ) async {
    try {
      return await block();
    } on DriftWrappedException catch (e) {
      return AppResult<T>.failure(_mapDriftWrapped(e));
    } catch (e, st) {
      return AppResult<T>.failure(AppError(
        code: 'database.unexpected',
        message: 'Unexpected database error: $e',
        userMessage: '数据库错误',
        source: AppErrorSource.storage,
        recoverable: true,
        technicalDetail: '$e\n$st',
      ));
    }
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
