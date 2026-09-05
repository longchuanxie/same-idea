/// Design Token: 圆角系统
/// 亮色/默认密度与紧凑密度两套值
class AppRadius {
  AppRadius._();

  // ── 默认密度 ──

  static const double xl = 32.0;
  static const double lg = 24.0;
  static const double md = 18.0;
  static const double sm = 12.0;
  static const double full = 999.0;

  // ── 紧凑密度 ──

  static const double compactXl = 26.0;
  static const double compactLg = 20.0;
  static const double compactMd = 15.0;
  static const double compactSm = 10.0;

  /// 根据是否紧凑密度返回对应圆角
  static double resolveXl(bool compact) =>
      compact ? compactXl : xl;

  static double resolveLg(bool compact) =>
      compact ? compactLg : lg;

  static double resolveMd(bool compact) =>
      compact ? compactMd : md;

  static double resolveSm(bool compact) =>
      compact ? compactSm : sm;
}
