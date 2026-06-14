enum AppErrorSource {
  storage,
  llm,
  search,
  editor,
  export,
  unknown,
}

final class AppError {
  const AppError({
    required this.code,
    required this.message,
    required this.userMessage,
    required this.source,
    this.technicalDetail,
    this.recoverable = false,
    this.suggestedAction,
  });

  final String code;
  final String message;
  final String userMessage;
  final String? technicalDetail;
  final bool recoverable;
  final String? suggestedAction;
  final AppErrorSource source;
}
