import 'dart:convert';
import 'dart:io';

import 'app_paths.dart';

enum WindowsCloseBehavior {
  askEveryTime,
  hideToTray,
  exitApp;

  String get storageValue {
    return switch (this) {
      WindowsCloseBehavior.askEveryTime => 'ASK_EVERY_TIME',
      WindowsCloseBehavior.hideToTray => 'HIDE_TO_TRAY',
      WindowsCloseBehavior.exitApp => 'EXIT_APP',
    };
  }

  String get label {
    return switch (this) {
      WindowsCloseBehavior.askEveryTime => '每次询问',
      WindowsCloseBehavior.hideToTray => '隐藏到托盘',
      WindowsCloseBehavior.exitApp => '直接退出',
    };
  }

  static WindowsCloseBehavior fromStorageValue(Object? value) {
    if (value is! String) {
      return WindowsCloseBehavior.askEveryTime;
    }
    return switch (value) {
      'HIDE_TO_TRAY' => WindowsCloseBehavior.hideToTray,
      'EXIT_APP' => WindowsCloseBehavior.exitApp,
      _ => WindowsCloseBehavior.askEveryTime,
    };
  }
}

class WindowsWidgetSettings {
  const WindowsWidgetSettings({
    this.alwaysOnTop = true,
    this.launchAtStartup = false,
    this.opacity = 0.94,
    this.fontScale = 1.0,
    this.closeBehavior = WindowsCloseBehavior.askEveryTime,
  });

  final bool alwaysOnTop;
  final bool launchAtStartup;
  final double opacity;
  final double fontScale;
  final WindowsCloseBehavior closeBehavior;

  WindowsWidgetSettings copyWith({
    bool? alwaysOnTop,
    bool? launchAtStartup,
    double? opacity,
    double? fontScale,
    WindowsCloseBehavior? closeBehavior,
  }) {
    return WindowsWidgetSettings(
      alwaysOnTop: alwaysOnTop ?? this.alwaysOnTop,
      launchAtStartup: launchAtStartup ?? this.launchAtStartup,
      opacity: _clamp(opacity ?? this.opacity, 0.62, 1.0),
      fontScale: _clamp(fontScale ?? this.fontScale, 0.88, 1.28),
      closeBehavior: closeBehavior ?? this.closeBehavior,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'schemaVersion': '1.0.0',
      'alwaysOnTop': alwaysOnTop,
      'launchAtStartup': launchAtStartup,
      'opacity': opacity,
      'fontScale': fontScale,
      'closeBehavior': closeBehavior.storageValue,
    };
  }

  factory WindowsWidgetSettings.fromJson(Map<String, Object?> json) {
    return WindowsWidgetSettings(
      alwaysOnTop: json['alwaysOnTop'] as bool? ?? true,
      launchAtStartup: json['launchAtStartup'] as bool? ?? false,
      opacity: _number(json['opacity']) ?? 0.94,
      fontScale: _number(json['fontScale']) ?? 1.0,
      closeBehavior:
          WindowsCloseBehavior.fromStorageValue(json['closeBehavior']),
    ).copyWith();
  }

  static double? _number(Object? value) {
    if (value is int) {
      return value.toDouble();
    }
    if (value is double) {
      return value;
    }
    return null;
  }

  static double _clamp(double value, double min, double max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
}

class WindowsSettingsStore {
  WindowsSettingsStore({
    File? file,
  }) : file = file ?? AppPaths.defaultWindowsSettingsFile();

  final File file;

  WindowsWidgetSettings load() {
    if (!file.existsSync()) {
      return const WindowsWidgetSettings();
    }
    try {
      final decoded = json.decode(file.readAsStringSync());
      if (decoded is Map<String, Object?>) {
        return WindowsWidgetSettings.fromJson(decoded);
      }
    } on Object {
      return const WindowsWidgetSettings();
    }
    return const WindowsWidgetSettings();
  }

  void save(WindowsWidgetSettings settings) {
    file.parent.createSync(recursive: true);
    const encoder = JsonEncoder.withIndent('  ');
    file.writeAsStringSync('${encoder.convert(settings.toJson())}\n');
  }
}
