# Same Idea Days

This workspace is not a Flutter package root. The Windows Flutter app lives in
`anniversary_app/`.

Run the Windows app:

```powershell
.\tools\windows\run_windows.ps1
```

Or run Flutter directly from the app package:

```powershell
cd anniversary_app
flutter run -d windows
```

Useful checks:

```powershell
python tools\calendar\run_calendar_checks.py
python tools\backup\validate_backup_schema.py
cd anniversary_app
flutter analyze
flutter test
flutter build windows --debug
```

Default development does not require Android SDK or Gradle.
