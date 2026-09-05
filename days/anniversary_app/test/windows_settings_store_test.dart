import 'dart:io';

import 'package:anniversary_app/src/data/windows_settings_store.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('saves and reloads Windows widget settings', () {
    final directory = Directory.systemTemp.createTempSync('days_settings_');
    addTearDown(() => directory.deleteSync(recursive: true));
    final file =
        File('${directory.path}${Platform.pathSeparator}settings.json');
    final store = WindowsSettingsStore(file: file);

    store.save(
      const WindowsWidgetSettings(
        alwaysOnTop: false,
        launchAtStartup: true,
        opacity: 0.72,
        fontScale: 1.18,
        closeBehavior: WindowsCloseBehavior.hideToTray,
      ),
    );

    final loaded = store.load();

    expect(loaded.alwaysOnTop, isFalse);
    expect(loaded.launchAtStartup, isTrue);
    expect(loaded.opacity, 0.72);
    expect(loaded.fontScale, 1.18);
    expect(loaded.closeBehavior, WindowsCloseBehavior.hideToTray);
  });

  test('clamps opacity and font scale from settings file', () {
    final settings = WindowsWidgetSettings.fromJson({
      'alwaysOnTop': true,
      'launchAtStartup': false,
      'opacity': 0.2,
      'fontScale': 2.0,
      'closeBehavior': 'EXIT_APP',
    });

    expect(settings.opacity, 0.62);
    expect(settings.fontScale, 1.28);
    expect(settings.closeBehavior, WindowsCloseBehavior.exitApp);
  });

  test('falls back to asking before close for unknown close behavior', () {
    final settings = WindowsWidgetSettings.fromJson({
      'closeBehavior': 'LEGACY_UNKNOWN',
    });

    expect(settings.closeBehavior, WindowsCloseBehavior.askEveryTime);
  });
}
