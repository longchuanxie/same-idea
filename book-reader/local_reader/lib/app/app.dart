import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../design_system/theme/app_theme.dart';
import 'app_providers.dart';
import 'router.dart';

/// 应用根 Widget
class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(isDarkProvider);
    final isCompact = ref.watch(compactDensityProvider);

    return MaterialApp.router(
      title: '墨韵',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.build(isDark: false, isCompact: isCompact),
      darkTheme: AppTheme.build(isDark: true, isCompact: isCompact),
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
    );
  }
}
