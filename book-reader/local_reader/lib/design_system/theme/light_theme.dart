import 'package:flutter/material.dart';

import '../tokens/app_colors.dart';
import '../tokens/app_radius.dart';
import '../tokens/app_spacing.dart';
import '../tokens/app_typography.dart';
import 'app_theme_extension.dart';

/// 亮色主题
ThemeData buildLightTheme({required bool compact}) {
  final radiusXl = AppRadius.resolveXl(compact);
  final radiusLg = AppRadius.resolveLg(compact);
  final radiusMd = AppRadius.resolveMd(compact);
  final radiusSm = AppRadius.resolveSm(compact);

  return ThemeData(
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.lightBg,
    colorScheme: const ColorScheme.light(
      primary: AppColors.lightAccent,
      secondary: AppColors.lightAccentSecondary,
      onSurface: AppColors.lightInk,
      error: AppColors.lightDanger,
    ),
    cardColor: AppColors.lightSurfaceSolid,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.lightSurface.withOpacity(0.6),
      foregroundColor: AppColors.lightInk,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: AppTypography.headlineMedium.copyWith(
        color: AppColors.lightInk,
      ),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: AppColors.lightSurfaceSolid,
      indicatorColor: AppColors.lightAccentSoft,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
    ),
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: AppColors.lightSurface.withOpacity(0.38),
      indicatorColor: AppColors.lightAccentSoft,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.lightLine,
      thickness: 1,
      space: 1,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.lightSurfaceSecondary,
      selectedColor: AppColors.lightAccentSoft,
      labelStyle: AppTypography.labelMedium.copyWith(
        color: AppColors.lightMuted,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.lightInk,
        foregroundColor: AppColors.lightSurfaceSolid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        textStyle: AppTypography.labelLarge,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.lightMuted,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        textStyle: AppTypography.labelLarge,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.lightSurfaceSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMd),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md - AppSpacing.xs,
      ),
      hintStyle: AppTypography.bodyMedium.copyWith(
        color: AppColors.lightSubtle,
      ),
    ),
    textTheme: const TextTheme(
      displayLarge: AppTypography.displayLarge,
      displayMedium: AppTypography.displayMedium,
      headlineLarge: AppTypography.headlineLarge,
      headlineMedium: AppTypography.headlineMedium,
      titleMedium: AppTypography.titleMedium,
      bodyLarge: AppTypography.bodyLarge,
      bodyMedium: AppTypography.bodyMedium,
      bodySmall: AppTypography.bodySmall,
      labelLarge: AppTypography.labelLarge,
      labelMedium: AppTypography.labelMedium,
      labelSmall: AppTypography.labelSmall,
    ),
    extensions: <ThemeExtension<dynamic>>[
      AppThemeExtension(
        bg: AppColors.lightBg,
        bgSecondary: AppColors.lightBgSecondary,
        surface: AppColors.lightSurface,
        surfaceSolid: AppColors.lightSurfaceSolid,
        surfaceSecondary: AppColors.lightSurfaceSecondary,
        ink: AppColors.lightInk,
        muted: AppColors.lightMuted,
        subtle: AppColors.lightSubtle,
        line: AppColors.lightLine,
        lineStrong: AppColors.lightLineStrong,
        accent: AppColors.lightAccent,
        accentSecondary: AppColors.lightAccentSecondary,
        accentSoft: AppColors.lightAccentSoft,
        warm: AppColors.lightWarm,
        success: AppColors.lightSuccess,
        danger: AppColors.lightDanger,
        radiusXl: radiusXl,
        radiusLg: radiusLg,
        radiusMd: radiusMd,
        radiusSm: radiusSm,
        compact: compact,
      ),
    ],
  );
}
