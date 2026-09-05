import 'package:flutter/material.dart';

import 'dark_theme.dart';
import 'light_theme.dart';

/// 应用主题入口
/// 统一管理亮色/暗色/紧凑密度的主题构建
class AppTheme {
  AppTheme._();

  /// 构建主题数据
  /// [isDark] 是否暗色主题
  /// [isCompact] 是否紧凑密度
  static ThemeData build({
    required bool isDark,
    required bool isCompact,
  }) {
    return isDark
        ? buildDarkTheme(compact: isCompact)
        : buildLightTheme(compact: isCompact);
  }
}
