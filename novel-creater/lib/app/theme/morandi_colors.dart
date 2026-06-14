import 'package:flutter/material.dart';

/// 莫兰迪色系设计 Token，对齐原型 styles.css :root 变量。
///
/// 浅色主题色值取自原型 `:root`，暗色主题色值取自 `[data-theme="dark"]`。
/// 旧名称（ink/paper/sage/clay/mist）保留为兼容别名。
abstract final class MorandiColors {
  // ── 浅色主题 ──────────────────────────────────────────────

  /// --bg: #f6f3ee — 页面背景
  static const Color background = Color(0xFFF6F3EE);

  /// --surface: #fbfaf8 — 卡片/面板背景
  static const Color surface = Color(0xFFFBFAF8);

  /// --surface-2: #f3f1ec — 二级表面
  static const Color surface2 = Color(0xFFF3F1EC);

  /// --surface-3: #ece9e2 — 三级表面
  static const Color surface3 = Color(0xFFECE9E2);

  /// --line: #e1ddd4 — 边框线
  static const Color line = Color(0xFFE1DDD4);

  /// --line-2: #d5d0c5 — 二级边框线
  static const Color line2 = Color(0xFFD5D0C5);

  /// --text: #37342f — 主文本
  static const Color text = Color(0xFF37342F);

  /// --muted: #777169 — 次要文本
  static const Color muted = Color(0xFF777169);

  /// --faint: #a29b90 — 极淡文本
  static const Color faint = Color(0xFFA29B90);

  /// --green: #5f8066 — 主强调色（品牌绿）
  static const Color green = Color(0xFF5F8066);

  /// --green-2: #d9e4d8 — 绿色淡底
  static const Color green2 = Color(0xFFD9E4D8);

  /// --green-3: #edf3eb — 绿色极淡底
  static const Color green3 = Color(0xFFEDF3EB);

  /// --orange: #cf7a3a — 橙色强调
  static const Color orange = Color(0xFFCF7A3A);

  /// --danger: #bd6a55 — 危险/警告色
  static const Color danger = Color(0xFFBD6A55);

  // ── 暗色主题 ──────────────────────────────────────────────

  /// 暗色 --bg: #1d1f1d
  static const Color darkBackground = Color(0xFF1D1F1D);

  /// 暗色 --surface: #262723
  static const Color darkSurface = Color(0xFF262723);

  /// 暗色 --surface-2: #30312d
  static const Color darkSurface2 = Color(0xFF30312D);

  /// 暗色 --surface-3: #383a35
  static const Color darkSurface3 = Color(0xFF383A35);

  /// 暗色 --line: #3d3e39
  static const Color darkLine = Color(0xFF3D3E39);

  /// 暗色 --line-2: #484a43
  static const Color darkLine2 = Color(0xFF484A43);

  /// 暗色 --text: #ece8dc
  static const Color darkText = Color(0xFFECE8DC);

  /// 暗色 --muted: #b1a99b
  static const Color darkMuted = Color(0xFFB1A99B);

  /// 暗色 --faint: #8b8478
  static const Color darkFaint = Color(0xFF8B8478);

  /// 暗色 --green: #8daa84
  static const Color darkGreen = Color(0xFF8DAA84);

  /// 暗色 --green-2: #40513d
  static const Color darkGreen2 = Color(0xFF40513D);

  /// 暗色 --green-3: #323c30
  static const Color darkGreen3 = Color(0xFF323C30);

  /// 暗色 --orange（原型未定义，基于浅色值降低亮度）
  static const Color darkOrange = Color(0xFFB8894F);

  /// 暗色 --danger（原型未定义，基于浅色值降低亮度）
  static const Color darkDanger = Color(0xFFC47E6A);

  // ── 兼容别名（旧名称 → 新 Token）──────────────────────────

  /// 旧名 → [text]
  static const Color ink = text;

  /// 旧名 → [background]
  static const Color paper = background;

  /// 旧名 → [green]
  static const Color sage = green;

  /// 旧名 → [orange]
  static const Color clay = orange;

  /// 旧名 → [surface2]
  static const Color mist = surface2;
}
