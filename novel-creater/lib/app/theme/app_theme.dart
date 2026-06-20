import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';

abstract final class AppTheme {
  /// 浅色主题
  static ThemeData light() => _buildTheme(isDark: false);

  /// 暗色主题
  static ThemeData dark() => _buildTheme(isDark: true);

  static ThemeData _buildTheme({required bool isDark}) {
    // 浅色/暗色色值选取
    final background = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final surface3 = isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final line2 = isDark ? MorandiColors.darkLine2 : MorandiColors.line2;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final faint = isDark ? MorandiColors.darkFaint : MorandiColors.faint;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final green3 = isDark ? MorandiColors.darkGreen3 : MorandiColors.green3;
    final orange = isDark ? MorandiColors.darkOrange : MorandiColors.orange;
    final danger = isDark ? MorandiColors.darkDanger : MorandiColors.danger;

    return ThemeData(
      brightness: isDark ? Brightness.dark : Brightness.light,
      colorScheme: ColorScheme(
        brightness: isDark ? Brightness.dark : Brightness.light,
        primary: green,
        onPrimary: isDark ? MorandiColors.darkText : Colors.white,
        primaryContainer: green2,
        onPrimaryContainer: text,
        secondary: orange,
        onSecondary: Colors.white,
        secondaryContainer: green3,
        onSecondaryContainer: text,
        surface: surface,
        onSurface: text,
        surfaceContainerHighest: surface2,
        error: danger,
        onError: Colors.white,
        outline: line,
        outlineVariant: line2,
        shadow: Colors.black,
        scrim: Colors.black,
        inverseSurface: isDark ? MorandiColors.surface : MorandiColors.darkSurface,
        onInverseSurface: isDark ? MorandiColors.text : MorandiColors.darkText,
      ),
      scaffoldBackgroundColor: background,
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: line),
        ),
        margin: EdgeInsets.zero,
      ),
      dividerTheme: DividerThemeData(
        color: line,
        thickness: 1,
        space: 1,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: green,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.cardPadding,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          textStyle: AppTypography.body(color: Colors.white, weight: AppTypography.weightBold),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: text,
          side: BorderSide(color: line),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.cardPadding,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          textStyle: AppTypography.body(color: text, weight: AppTypography.weightBold),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: green,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          textStyle: AppTypography.small(color: green, weight: AppTypography.weightBold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: green),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        hintStyle: AppTypography.body(color: faint),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surface2,
        selectedColor: green2,
        labelStyle: AppTypography.small(color: text, weight: AppTypography.weightBold),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
          side: BorderSide(color: line),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: text,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.title(
          color: text,
          weight: AppTypography.weightBold,
        ),
      ),
      iconTheme: IconThemeData(
        size: AppSpacing.iconMedium,
        color: muted,
      ),
      useMaterial3: true,
    );
  }
}
