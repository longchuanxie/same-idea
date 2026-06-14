import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// 主题模式状态管理
class ThemeCubit extends Cubit<ThemeMode> {
  ThemeCubit() : super(ThemeMode.light);

  void toggle() => emit(state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light);

  void setLight() => emit(ThemeMode.light);

  void setDark() => emit(ThemeMode.dark);
}
