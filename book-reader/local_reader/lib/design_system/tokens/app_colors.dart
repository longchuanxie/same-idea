import 'package:flutter/material.dart';

/// Design Token: 颜色系统
/// 基于 V4 Modern UI 原型 CSS Variables
class AppColors {
  AppColors._();

  // ── 亮色主题 ──

  static const Color lightBg = Color(0xFFEEF0F3);
  static const Color lightBgSecondary = Color(0xFFE7EAF0);
  static const Color lightSurface = Color(0xC1FFFFFF); // rgba(255,255,255,.76)
  static const Color lightSurfaceSolid = Color(0xFFFFFFFF);
  static const Color lightSurfaceSecondary = Color(0xFFF5F6F8);
  static const Color lightInk = Color(0xFF15171A);
  static const Color lightMuted = Color(0xFF717780);
  static const Color lightSubtle = Color(0xFF9AA1AA);
  static const Color lightLine = Color(0x1A15171A); // rgba(21,23,26,.10)
  static const Color lightLineStrong = Color(0x2915171A); // rgba(21,23,26,.16)
  static const Color lightAccent = Color(0xFF3F5F86);
  static const Color lightAccentSecondary = Color(0xFF7D5A4E);
  static const Color lightAccentSoft = Color(0xFFDFE9F5);
  static const Color lightWarm = Color(0xFFF2EBE2);
  static const Color lightSuccess = Color(0xFF647A62);
  static const Color lightDanger = Color(0xFF9A594F);

  // ── 暗色主题 ──

  static const Color darkBg = Color(0xFF101215);
  static const Color darkBgSecondary = Color(0xFF171A1F);
  static const Color darkSurface = Color(0xC11D2025); // rgba(29,32,37,.76)
  static const Color darkSurfaceSolid = Color(0xFF1D2025);
  static const Color darkSurfaceSecondary = Color(0xFF242830);
  static const Color darkInk = Color(0xFFEEF1F4);
  static const Color darkMuted = Color(0xFFA4ABB5);
  static const Color darkSubtle = Color(0xFF777F8B);
  static const Color darkLine = Color(0x1AFFFFFF); // rgba(255,255,255,.10)
  static const Color darkLineStrong = Color(0x2EFFFFFF); // rgba(255,255,255,.18)
  static const Color darkAccent = Color(0xFF93B8DF);
  static const Color darkAccentSecondary = Color(0xFFD0A092);
  static const Color darkAccentSoft = Color(0xFF233549);
  static const Color darkWarm = Color(0xFF2B2723);
  static const Color darkSuccess = Color(0xFF7DA07B);
  static const Color darkDanger = Color(0xFFCF7B6F);
}
