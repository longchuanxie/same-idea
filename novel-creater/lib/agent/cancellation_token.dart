/// 简单的取消令牌，用于协作式取消异步操作。
///
/// 使用方式：
/// ```dart
/// final token = CancellationToken();
/// // 在需要取消时调用
/// token.cancel();
/// // 在异步操作中检查
/// if (token.isCancelled) return;
/// ```
class CancellationToken {
  bool _isCancelled = false;

  /// 是否已被取消。
  bool get isCancelled => _isCancelled;

  /// 请求取消。
  void cancel() => _isCancelled = true;
}
