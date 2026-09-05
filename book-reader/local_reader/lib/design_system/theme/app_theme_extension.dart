import 'package:flutter/material.dart';

/// 应用主题扩展
/// 提供原型中定义的语义化颜色 Token，通过 ThemeExtension 机制注入 ThemeData
@immutable
class AppThemeExtension extends ThemeExtension<AppThemeExtension> {
  const AppThemeExtension({
    required this.bg,
    required this.bgSecondary,
    required this.surface,
    required this.surfaceSolid,
    required this.surfaceSecondary,
    required this.ink,
    required this.muted,
    required this.subtle,
    required this.line,
    required this.lineStrong,
    required this.accent,
    required this.accentSecondary,
    required this.accentSoft,
    required this.warm,
    required this.success,
    required this.danger,
    required this.radiusXl,
    required this.radiusLg,
    required this.radiusMd,
    required this.radiusSm,
    required this.compact,
  });

  final Color bg;
  final Color bgSecondary;
  final Color surface;
  final Color surfaceSolid;
  final Color surfaceSecondary;
  final Color ink;
  final Color muted;
  final Color subtle;
  final Color line;
  final Color lineStrong;
  final Color accent;
  final Color accentSecondary;
  final Color accentSoft;
  final Color warm;
  final Color success;
  final Color danger;
  final double radiusXl;
  final double radiusLg;
  final double radiusMd;
  final double radiusSm;
  final bool compact;

  /// 从 BuildContext 获取 AppThemeExtension
  static AppThemeExtension of(BuildContext context) {
    return Theme.of(context).extension<AppThemeExtension>()!;
  }

  @override
  AppThemeExtension copyWith({
    Color? bg,
    Color? bgSecondary,
    Color? surface,
    Color? surfaceSolid,
    Color? surfaceSecondary,
    Color? ink,
    Color? muted,
    Color? subtle,
    Color? line,
    Color? lineStrong,
    Color? accent,
    Color? accentSecondary,
    Color? accentSoft,
    Color? warm,
    Color? success,
    Color? danger,
    double? radiusXl,
    double? radiusLg,
    double? radiusMd,
    double? radiusSm,
    bool? compact,
  }) {
    return AppThemeExtension(
      bg: bg ?? this.bg,
      bgSecondary: bgSecondary ?? this.bgSecondary,
      surface: surface ?? this.surface,
      surfaceSolid: surfaceSolid ?? this.surfaceSolid,
      surfaceSecondary: surfaceSecondary ?? this.surfaceSecondary,
      ink: ink ?? this.ink,
      muted: muted ?? this.muted,
      subtle: subtle ?? this.subtle,
      line: line ?? this.line,
      lineStrong: lineStrong ?? this.lineStrong,
      accent: accent ?? this.accent,
      accentSecondary: accentSecondary ?? this.accentSecondary,
      accentSoft: accentSoft ?? this.accentSoft,
      warm: warm ?? this.warm,
      success: success ?? this.success,
      danger: danger ?? this.danger,
      radiusXl: radiusXl ?? this.radiusXl,
      radiusLg: radiusLg ?? this.radiusLg,
      radiusMd: radiusMd ?? this.radiusMd,
      radiusSm: radiusSm ?? this.radiusSm,
      compact: compact ?? this.compact,
    );
  }

  @override
  AppThemeExtension lerp(covariant AppThemeExtension? other, double t) {
    if (other == null) return this;
    return AppThemeExtension(
      bg: Color.lerp(bg, other.bg, t)!,
      bgSecondary: Color.lerp(bgSecondary, other.bgSecondary, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceSolid: Color.lerp(surfaceSolid, other.surfaceSolid, t)!,
      surfaceSecondary:
          Color.lerp(surfaceSecondary, other.surfaceSecondary, t)!,
      ink: Color.lerp(ink, other.ink, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      subtle: Color.lerp(subtle, other.subtle, t)!,
      line: Color.lerp(line, other.line, t)!,
      lineStrong: Color.lerp(lineStrong, other.lineStrong, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentSecondary: Color.lerp(accentSecondary, other.accentSecondary, t)!,
      accentSoft: Color.lerp(accentSoft, other.accentSoft, t)!,
      warm: Color.lerp(warm, other.warm, t)!,
      success: Color.lerp(success, other.success, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      radiusXl: lerpDouble(radiusXl, other.radiusXl, t),
      radiusLg: lerpDouble(radiusLg, other.radiusLg, t),
      radiusMd: lerpDouble(radiusMd, other.radiusMd, t),
      radiusSm: lerpDouble(radiusSm, other.radiusSm, t),
      compact: t < 0.5 ? compact : other.compact,
    );
  }

  static double lerpDouble(double a, double b, double t) {
    return a + (b - a) * t;
  }
}
