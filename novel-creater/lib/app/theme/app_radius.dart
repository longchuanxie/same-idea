/// 圆角设计 Token，对齐原型 styles.css 中的 border-radius 值。
abstract final class AppRadius {
  /// --radius-lg: 14px — 大圆角（面板、卡片）
  static const double lg = 14;

  /// --radius-md: 10px — 中圆角（输入框、小卡片）
  static const double md = 10;

  /// 小圆角（按钮、标签）
  static const double sm = 8;

  /// 极小圆角（药丸内元素）
  static const double xs = 4;

  /// 标签页顶部圆角
  static const double tabTop = 12;

  /// 药丸/状态标签圆角
  static const double pill = 999;

  /// Modal 圆角
  static const double modal = 16;

  /// 头像圆角
  static const double avatar = 999;

  /// 迷你封面圆角
  static const double miniCover = 8;

  /// 大封面圆角
  static const double largeCover = 10;
}
