import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/app_error_source.dart';

part 'app_error.freezed.dart';
part 'app_error.g.dart';

@Freezed(toJson: true, fromJson: true)
class AppError with _$AppError {
  const factory AppError({
    required String code,
    required String message,
    required String userMessage,
    String? technicalDetail,
    @Default(true) bool recoverable,
    String? suggestedAction,
    @Default(AppErrorSource.unknown) AppErrorSource source,
  }) = _AppError;

  factory AppError.fromJson(Map<String, dynamic> json) =>
      _$AppErrorFromJson(json);
}
