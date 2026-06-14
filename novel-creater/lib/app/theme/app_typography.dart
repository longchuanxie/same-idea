import 'package:flutter/material.dart';

/// 字体排版设计 Token，对齐原型 styles.css 中的字体设置。
///
/// 原型字体栈：-apple-system, BlinkMacSystemFont, "SF Pro Display",
/// "PingFang SC", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
abstract final class AppTypography {
  AppTypography._();

  /// 原型基础字号 14px
  static const double baseFontSize = 14;

  /// 原型行高 1.45
  static const double baseLineHeight = 1.45;

  // ── 字号 ─────────────────────────────────────────────────

  static const double fontSize11 = 11;
  static const double fontSize12 = 12;
  static const double fontSize13 = 13;
  static const double fontSize14 = 14;
  static const double fontSize15 = 15;
  static const double fontSize16 = 16;
  static const double fontSize17 = 17;
  static const double fontSize20 = 20;
  static const double fontSize22 = 22;
  static const double fontSize25 = 25;
  static const double fontSize28 = 28;

  // ── 字重 ─────────────────────────────────────────────────

  static const FontWeight weightRegular = FontWeight.w400;
  static const FontWeight weightMedium = FontWeight.w500;
  static const FontWeight weightSemibold = FontWeight.w600;
  static const FontWeight weightBold = FontWeight.w700;
  static const FontWeight weightExtrabold = FontWeight.w800;
  static const FontWeight weightBlack = FontWeight.w900;

  // ── 行高倍数 ─────────────────────────────────────────────

  static const double lineHeightTight = 1.25;
  static const double lineHeightNormal = 1.45;
  static const double lineHeightRelaxed = 1.65;
  static const double lineHeightLoose = 1.78;
  static const double lineHeightExtraLoose = 1.95;

  // ── 便捷 TextStyle 工厂 ──────────────────────────────────

  /// 大标题（项目名 h2，28px/750）
  static TextStyle headline({
    required Color color,
    FontWeight weight = FontWeight.w700,
  }) =>
      TextStyle(
        fontSize: fontSize28,
        fontWeight: weight,
        height: lineHeightTight,
        color: color,
        letterSpacing: 0.02,
      );

  /// 页面标题（h1，16px/700）
  static TextStyle title({
    required Color color,
    FontWeight weight = weightBold,
  }) =>
      TextStyle(
        fontSize: fontSize16,
        fontWeight: weight,
        height: lineHeightNormal,
        color: color,
      );

  /// 卡片标题（h3，15px/400）
  static TextStyle cardTitle({
    required Color color,
    FontWeight weight = weightRegular,
  }) =>
      TextStyle(
        fontSize: fontSize15,
        fontWeight: weight,
        height: lineHeightNormal,
        color: color,
      );

  /// 正文（14px/400）
  static TextStyle body({
    required Color color,
    FontWeight weight = weightRegular,
  }) =>
      TextStyle(
        fontSize: baseFontSize,
        fontWeight: weight,
        height: lineHeightNormal,
        color: color,
      );

  /// 小字（13px/400）
  static TextStyle small({
    required Color color,
    FontWeight weight = weightRegular,
  }) =>
      TextStyle(
        fontSize: fontSize13,
        fontWeight: weight,
        height: lineHeightRelaxed,
        color: color,
      );

  /// 极小字（12px/400）
  static TextStyle caption({
    required Color color,
    FontWeight weight = weightRegular,
  }) =>
      TextStyle(
        fontSize: fontSize12,
        fontWeight: weight,
        height: lineHeightNormal,
        color: color,
      );

  /// 药丸标签（12px/700）
  static TextStyle pill({
    required Color color,
    FontWeight weight = weightBold,
  }) =>
      TextStyle(
        fontSize: fontSize12,
        fontWeight: weight,
        height: lineHeightNormal,
        color: color,
      );
}
