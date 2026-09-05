/// 响应式断点定义
/// 三断点：compact（手机）、medium（平板）、expanded（桌面）
class Breakpoints {
  Breakpoints._();

  /// 手机断点上限
  static const double compact = 600;

  /// 平板断点上限
  static const double medium = 1024;

  /// 桌面断点起始
  /// width >= medium 视为 expanded
}

/// 布局密度枚举
enum LayoutDensity {
  /// 默认密度
  normal,

  /// 紧凑密度
  compact,
}

/// 响应式布局类型
enum LayoutType {
  /// 手机布局
  compact,

  /// 平板布局
  medium,

  /// 桌面布局
  expanded,
}
