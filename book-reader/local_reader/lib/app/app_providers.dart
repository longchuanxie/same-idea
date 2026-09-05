import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 主题模式状态
enum AppThemeMode {
  light,
  dark,
}

/// 主题模式 Provider
final themeModeProvider = StateProvider<AppThemeMode>((ref) => AppThemeMode.light);

/// 紧凑密度 Provider
final compactDensityProvider = StateProvider<bool>((ref) => false);

/// 当前主题是否为暗色
final isDarkProvider = Provider<bool>((ref) {
  return ref.watch(themeModeProvider) == AppThemeMode.dark;
});
