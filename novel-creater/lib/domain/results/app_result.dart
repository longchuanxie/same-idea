import 'package:novel_creator/domain/results/app_error.dart';

sealed class AppResult<T> {
  const AppResult();

  const factory AppResult.success(T value) = AppSuccess<T>;

  const factory AppResult.failure(AppError error) = AppFailure<T>;

  bool get isSuccess => this is AppSuccess<T>;

  bool get isFailure => this is AppFailure<T>;

  T? get valueOrNull => switch (this) {
        AppSuccess<T>(:final value) => value,
        AppFailure<T>() => null,
      };

  AppError? get errorOrNull => switch (this) {
        AppSuccess<T>() => null,
        AppFailure<T>(:final error) => error,
      };
}

final class AppSuccess<T> extends AppResult<T> {
  const AppSuccess(this.value);

  final T value;
}

final class AppFailure<T> extends AppResult<T> {
  const AppFailure(this.error);

  final AppError error;
}
