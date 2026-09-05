# 今念 Flutter Shell

This package contains the Flutter Windows application shell and shared Flutter UI for 今念, a local-first anniversary app.

Current scope:

- Home, add, detail, and settings route skeletons.
- Shared light/dark theme.
- Windows repository backed by the shared `calendar_core` Dart package.
- Android backup JSON import, local Windows cache, and import report tests.
- Widget smoke tests for route navigation and Windows import smoke tests.
- No generated Android platform directory in this workspace.

Run local checks from this directory:

```sh
flutter analyze
flutter test
flutter build windows --debug
```

Import an Android backup into the Windows cache from the built app:

```sh
build/windows/x64/runner/Debug/anniversary_app.exe --import=../shared/backup/examples/anniversary-backup-v1.example.json
```

The app stores the latest imported backup in `%APPDATA%/SameIdeaDays/anniversary-backup-v1.cache.json` and recalculates next occurrences from `calendar_core` on each launch. Without an imported cache, it falls back to seed data for development.

Windows widget settings are stored in `%APPDATA%/SameIdeaDays/windows-settings-v1.json`. The settings page can update always-on-top, launch at startup, opacity, and font scale. Native window settings are applied through the Windows runner.

Android platform files are intentionally not generated in this workspace, so default development does not require Android SDK. Regenerate Android with `flutter create --platforms=android .` only when Android SDK and device validation are available.
