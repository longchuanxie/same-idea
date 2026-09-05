import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData light() {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: Color(0xFF517A72),
      onPrimary: Color(0xFFFFFFFF),
      secondary: Color(0xFFB76E79),
      onSecondary: Color(0xFFFFFFFF),
      tertiary: Color(0xFFD2A15F),
      onTertiary: Color(0xFF2B2116),
      error: Color(0xFFB3261E),
      onError: Color(0xFFFFFFFF),
      surface: Color(0xFFFFFBF5),
      onSurface: Color(0xFF26211C),
    );
    return _base(scheme).copyWith(
      scaffoldBackgroundColor: const Color(0xFFF7F2EA),
    );
  }

  static ThemeData dark() {
    const scheme = ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xFF98D2C8),
      onPrimary: Color(0xFF113731),
      secondary: Color(0xFFE7A7AF),
      onSecondary: Color(0xFF4A1D26),
      tertiary: Color(0xFFE7C58B),
      onTertiary: Color(0xFF402D0B),
      error: Color(0xFFF2B8B5),
      onError: Color(0xFF601410),
      surface: Color(0xFF211D19),
      onSurface: Color(0xFFF3EEE7),
    );
    return _base(scheme).copyWith(
      scaffoldBackgroundColor: const Color(0xFF181512),
    );
  }

  static ThemeData _base(ColorScheme scheme) {
    return ThemeData(
      colorScheme: scheme,
      useMaterial3: true,
      fontFamilyFallback: const [
        'Microsoft YaHei',
        'PingFang SC',
        'Noto Sans CJK SC',
      ],
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardTheme(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: scheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: scheme.outlineVariant.withOpacity(0.55)),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorShape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
