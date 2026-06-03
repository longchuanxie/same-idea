import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/results/app_error.dart';

part 'app_result.freezed.dart';

@Freezed(toJson: false, fromJson: false)
sealed class AppResult<T> with _$AppResult<T> {
  const factory AppResult.success(T data) = Success<T>;
  const factory AppResult.failure(AppError error) = Failure<T>;

  const AppResult._();

  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  T? get maybeSuccess => when(success: (d) => d, failure: (_) => null);
  AppError? get maybeFailure => when(success: (_) => null, failure: (e) => e);
}
