import 'package:flutter/material.dart';

import '../tokens/app_colors.dart';
import '../tokens/app_radius.dart';
import '../tokens/app_spacing.dart';
import '../tokens/app_typography.dart';
import 'app_theme_extension.dart';

/// 暗色主题
ThemeData buildDarkTheme({required bool compact}) {
  final radiusXl = AppRadius.resolveXl(compact);
  final radiusLg = AppRadius.resolveLg(compact);
  final radiusMd = AppRadius.resolveMd(compact);
  final radiusSm = AppRadius.resolveSm(compact);

  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.darkBg,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.darkAccent,
      onPrimary: Color(0xFF111317),
      secondary: AppColors.darkAccentSecondary,
      onSecondary: Color(0xFF111317),
      surface: AppColors.darkSurfaceSolid,
      onSurface: AppColors.darkInk,
      error: AppColors.darkDanger,
      onError: AppColors.darkInk,
    ),
    cardColor: AppColors.darkSurfaceSolid,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.darkSurface.withOpacity(0.48),
      foregroundColor: AppColors.darkInk,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: AppTypography.headlineMedium.copyWith(
        color: AppColors.darkInk,
      ),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: AppColors.darkSurfaceSolid,
      indicatorColor: AppColors.darkAccentSoft,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
    ),
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: AppColors.darkSurface.withOpacity(0.48),
      indicatorColor: AppColors.darkAccentSoft,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.darkLine,
      thickness: 1,
      space: 1,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.darkSurfaceSecondary,
      selectedColor: AppColors.darkAccentSoft,
      labelStyle: AppTypography.labelMedium.copyWith(
        color: AppColors.darkMuted,
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
        backgroundColor: AppColors.darkInk,
        foregroundColor: const Color(0xFF111317),
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
        foregroundColor: AppColors.darkMuted,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        textStyle: AppTypography.labelLarge,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkSurfaceSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusMd),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md - AppSpacing.xs,
      ),
      hintStyle: AppTypography.bodyMedium.copyWith(
        color: AppColors.darkSubtle,
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
        bg: AppColors.darkBg,
        bgSecondary: AppColors.darkBgSecondary,
        surface: AppColors.darkSurface,
        surfaceSolid: AppColors.darkSurfaceSolid,
        surfaceSecondary: AppColors.darkSurfaceSecondary,
        ink: AppColors.darkInk,
        muted: AppColors.darkMuted,
        subtle: AppColors.darkSubtle,
        line: AppColors.darkLine,
        lineStrong: AppColors.darkLineStrong,
        accent: AppColors.darkAccent,
        accentSecondary: AppColors.darkAccentSecondary,
        accentSoft: AppColors.darkAccentSoft,
        warm: AppColors.darkWarm,
        success: AppColors.darkSuccess,
        danger: AppColors.darkDanger,
        radiusXl: radiusXl,
        radiusLg: radiusLg,
        radiusMd: radiusMd,
        radiusSm: radiusSm,
        compact: compact,
      ),
    ],
  );
}
