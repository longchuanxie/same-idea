import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData lightTheme() {
    const morandi = MorandiColors();
    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: morandi.green,
      brightness: Brightness.light,
      scaffoldBackgroundColor: morandi.bg,
      appBarTheme: AppBarTheme(
        backgroundColor: morandi.bg,
        foregroundColor: morandi.ink,
        elevation: 0,
        scrolledUnderElevation: 0.5,
      ),
      cardTheme: CardTheme(
        color: morandi.canvas,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: morandi.line),
        ),
      ),
      dividerTheme: DividerThemeData(color: morandi.line, thickness: 1),
      textTheme: TextTheme(
        headlineLarge: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          height: 1.3,
          color: morandi.ink,
        ),
        headlineMedium: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          height: 1.3,
          color: morandi.ink,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.4,
          color: morandi.ink,
        ),
        bodyLarge: TextStyle(fontSize: 16, height: 1.7, color: morandi.text),
        bodyMedium: TextStyle(fontSize: 14, height: 1.6, color: morandi.text),
        bodySmall: TextStyle(fontSize: 12, height: 1.5, color: morandi.muted),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: morandi.ink),
        labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: morandi.text),
        labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: morandi.muted),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: morandi.canvas,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: morandi.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: morandi.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: morandi.green, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: morandi.green,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: morandi.green,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: morandi.green,
        foregroundColor: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      iconTheme: IconThemeData(color: morandi.muted, size: 20),
      extensions: const [morandi],
    );
  }
}
