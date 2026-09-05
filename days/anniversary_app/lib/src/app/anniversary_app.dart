import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

import '../app/app_theme.dart';
import '../data/app_paths.dart';
import '../data/backup_importer.dart';
import '../data/windows_anniversary_repository.dart';
import '../data/windows_settings_store.dart';
import '../domain/anniversary_repository.dart';
import '../features/detail/event_detail_screen.dart';
import '../features/edit/event_edit_screen.dart';
import '../features/home/home_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/windows/windows_home_screen.dart';
import '../reminders/android_reminder_scheduler.dart';
import '../reminders/windows_reminder_scheduler.dart';
import 'product_brand.dart';

class AnniversaryApp extends StatefulWidget {
  const AnniversaryApp({
    required this.repository,
    this.notificationsPlugin,
    super.key,
  });

  final AnniversaryRepository repository;
  final FlutterLocalNotificationsPlugin? notificationsPlugin;

  @override
  State<AnniversaryApp> createState() => _AnniversaryAppState();
}

class _AnniversaryAppState extends State<AnniversaryApp> {
  static const _windowsTrayChannel =
      MethodChannel('same_idea_days/windows_tray');

  final _navigatorKey = GlobalKey<NavigatorState>();
  late final WindowsSettingsStore _windowsSettingsStore;
  late WindowsWidgetSettings _windowsSettings;
  WindowsReminderScheduler? _windowsReminderScheduler;
  AndroidReminderScheduler? _androidReminderScheduler;
  bool _isCloseDialogOpen = false;
  int _loadKey = 0;

  void _invalidateData() {
    setState(() => _loadKey++);
  }

  @override
  void initState() {
    super.initState();
    _windowsSettingsStore = WindowsSettingsStore();
    _windowsSettings = Platform.isWindows
        ? _windowsSettingsStore.load()
        : const WindowsWidgetSettings();
    if (Platform.isWindows) {
      _windowsTrayChannel.setMethodCallHandler(_handleWindowsTrayCall);
      _windowsReminderScheduler = WindowsReminderScheduler(
        repository: widget.repository,
        sender: const WindowsTrayReminderNotificationSender(
          _windowsTrayChannel,
        ),
      );
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _applyWindowsSettings(_windowsSettings);
        unawaited(_rescheduleWindowsReminders());
      });
    }
    if (Platform.isAndroid && widget.notificationsPlugin != null) {
      _androidReminderScheduler = AndroidReminderScheduler(
        repository: widget.repository,
        sender: AndroidReminderNotificationSender(
          widget.notificationsPlugin!,
        ),
      );
      WidgetsBinding.instance.addPostFrameCallback((_) {
        unawaited(_initAndroidReminders());
      });
    }
  }

  @override
  void dispose() {
    if (Platform.isWindows) {
      _windowsTrayChannel.setMethodCallHandler(null);
      _windowsReminderScheduler?.dispose();
    }
    _androidReminderScheduler?.dispose();
    super.dispose();
  }

  Future<Object?> _handleWindowsTrayCall(MethodCall call) async {
    switch (call.method) {
      case 'openSettings':
        _navigatorKey.currentState?.pushNamed(SettingsScreen.routeName);
        return true;
      case 'refresh':
        final repository = widget.repository;
        if (repository is WindowsAnniversaryRepository) {
          repository.refreshCache();
          _invalidateData();
          await _rescheduleWindowsReminders();
        }
        return true;
      case 'requestClose':
        await _handleWindowsCloseRequest();
        return true;
      case 'importBackup':
        final path = call.arguments;
        if (path is! String || path.isEmpty) {
          throw PlatformException(
            code: 'invalid_path',
            message: '未选择有效的备份文件。',
          );
        }
        final repository = widget.repository;
        if (repository is! WindowsAnniversaryRepository) {
          throw PlatformException(
            code: 'unsupported_repository',
            message: '当前数据源不支持导入备份。',
          );
        }
        try {
          final report = repository.importBackupFile(File(path));
          _invalidateData();
          await _rescheduleWindowsReminders();
          _showMessage(
            '导入完成：成功 ${report.imported}，跳过 ${report.skipped}，失败 ${report.failed}',
          );
          return {
            'total': report.total,
            'imported': report.imported,
            'skipped': report.skipped,
            'failed': report.failed,
          };
        } on BackupImportException catch (error) {
          _showMessage('导入失败：${error.message}');
          throw PlatformException(
            code: 'import_failed',
            message: error.message,
          );
        }
      default:
        throw PlatformException(
          code: 'unknown_method',
          message: 'Unsupported tray method: ${call.method}',
        );
    }
  }

  Future<void> _updateWindowsSettings(WindowsWidgetSettings settings) async {
    setState(() {
      _windowsSettings = settings;
    });
    _windowsSettingsStore.save(settings);
    await _applyWindowsSettings(settings);
  }

  Future<void> _handleWindowsCloseRequest() async {
    final behavior = _windowsSettings.closeBehavior;
    if (behavior != WindowsCloseBehavior.askEveryTime) {
      await _applyWindowsCloseBehavior(behavior);
      return;
    }

    final context = _navigatorKey.currentContext;
    if (context == null || !context.mounted) {
      await _applyWindowsCloseBehavior(WindowsCloseBehavior.hideToTray);
      return;
    }
    if (_isCloseDialogOpen) {
      return;
    }

    _isCloseDialogOpen = true;
    final decision = await showDialog<_WindowsCloseDecision>(
      context: context,
      barrierDismissible: true,
      builder: (_) => const _WindowsCloseDialog(),
    ).whenComplete(() {
      _isCloseDialogOpen = false;
    });
    if (decision == null) {
      return;
    }
    if (decision.remember) {
      final updated = _windowsSettings.copyWith(
        closeBehavior: decision.behavior,
      );
      setState(() {
        _windowsSettings = updated;
      });
      _windowsSettingsStore.save(updated);
    }
    await _applyWindowsCloseBehavior(decision.behavior);
  }

  Future<void> _applyWindowsCloseBehavior(
    WindowsCloseBehavior behavior,
  ) async {
    if (!Platform.isWindows) {
      return;
    }
    final method = switch (behavior) {
      WindowsCloseBehavior.exitApp => 'exitApp',
      WindowsCloseBehavior.hideToTray ||
      WindowsCloseBehavior.askEveryTime =>
        'hideWindow',
    };
    try {
      await _windowsTrayChannel.invokeMethod<void>(method);
    } on MissingPluginException {
      return;
    }
  }

  Future<String?> _refreshWindowsData() async {
    final repository = widget.repository;
    if (repository is WindowsAnniversaryRepository) {
      repository.refreshCache();
      _invalidateData();
      await _rescheduleWindowsReminders();
      return '已刷新本地数据';
    }
    return '当前数据源不支持刷新';
  }

  Future<String?> _openWindowsDataFolder() async {
    final folder = AppPaths.defaultWindowsBackupCacheFile().parent;
    folder.createSync(recursive: true);
    await Process.run('explorer.exe', [folder.path]);
    return '已打开本地数据目录';
  }

  Future<String?> _pickWindowsBackupFile() async {
    if (!Platform.isWindows) {
      return '当前平台不支持 Windows 文件选择器';
    }
    try {
      final selected =
          await _windowsTrayChannel.invokeMethod<bool>('pickBackupFile');
      return selected == true ? '正在导入备份...' : null;
    } on MissingPluginException {
      return '当前运行环境缺少 Windows 原生文件选择器';
    }
  }

  Future<void> _applyWindowsSettings(WindowsWidgetSettings settings) async {
    if (!Platform.isWindows) {
      return;
    }
    try {
      await _windowsTrayChannel.invokeMethod<void>('applySettings', {
        'alwaysOnTop': settings.alwaysOnTop,
        'launchAtStartup': settings.launchAtStartup,
        'opacity': settings.opacity,
      });
    } on MissingPluginException {
      return;
    }
  }

  Future<void> _rescheduleWindowsReminders() async {
    if (!Platform.isWindows) {
      return;
    }
    try {
      await _windowsReminderScheduler?.reschedule();
    } on MissingPluginException {
      return;
    }
  }

  /// Requests POST_NOTIFICATIONS permission on Android 13+ and starts the
  /// reminder scheduler once permission is granted (or if it was already
  /// granted on a previous launch).
  Future<void> _initAndroidReminders() async {
    final status = await Permission.notification.status;
    if (!status.isGranted) {
      final result = await Permission.notification.request();
      if (!result.isGranted) {
        return; // Permission denied; skip scheduling.
      }
    }
    await _rescheduleAndroidReminders();
  }

  Future<void> _rescheduleAndroidReminders() async {
    try {
      await _androidReminderScheduler?.reschedule();
    } catch (_) {
      // Silently ignore notification errors on Android.
    }
  }

  void _showMessage(String message) {
    final context = _navigatorKey.currentContext;
    if (context == null) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: productChineseName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      routes: {
        HomeScreen.routeName: (_) => Platform.isWindows
            ? WindowsHomeScreen(
                repository: widget.repository,
                settings: _windowsSettings,
                loadKey: _loadKey,
              )
            : HomeScreen(
                repository: widget.repository,
                loadKey: _loadKey,
              ),
        EventEditScreen.routeName: (_) => EventEditScreen(
              repository: widget.repository,
              onSaved: () {
                _invalidateData();
                unawaited(_rescheduleWindowsReminders());
                unawaited(_rescheduleAndroidReminders());
              },
            ),
        EventDetailScreen.routeName: (_) => EventDetailScreen(
              repository: widget.repository,
              onChanged: () {
                _invalidateData();
                unawaited(_rescheduleWindowsReminders());
                unawaited(_rescheduleAndroidReminders());
              },
            ),
        SettingsScreen.routeName: (_) => SettingsScreen(
              windowsSettings: Platform.isWindows ? _windowsSettings : null,
              onWindowsSettingsChanged:
                  Platform.isWindows ? _updateWindowsSettings : null,
              onOpenWindowsDataFolder:
                  Platform.isWindows ? _openWindowsDataFolder : null,
              onImportWindowsBackup:
                  Platform.isWindows ? _pickWindowsBackupFile : null,
              onRefreshWindowsData:
                  Platform.isWindows ? _refreshWindowsData : null,
            ),
      },
    );
  }
}

class _WindowsCloseDecision {
  const _WindowsCloseDecision({
    required this.behavior,
    required this.remember,
  });

  final WindowsCloseBehavior behavior;
  final bool remember;
}

class _WindowsCloseDialog extends StatefulWidget {
  const _WindowsCloseDialog();

  @override
  State<_WindowsCloseDialog> createState() => _WindowsCloseDialogState();
}

class _WindowsCloseDialogState extends State<_WindowsCloseDialog> {
  var _remember = true;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('关闭今念'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('关闭窗口时，你希望怎么处理？'),
          const SizedBox(height: 12),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: _remember,
            onChanged: (value) => setState(() {
              _remember = value ?? false;
            }),
            title: const Text('记住我的选择'),
            controlAffinity: ListTileControlAffinity.leading,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('取消'),
        ),
        OutlinedButton.icon(
          onPressed: () => Navigator.of(context).pop(
            _WindowsCloseDecision(
              behavior: WindowsCloseBehavior.exitApp,
              remember: _remember,
            ),
          ),
          icon: const Icon(Icons.power_settings_new_outlined),
          label: const Text('直接退出'),
        ),
        FilledButton.icon(
          onPressed: () => Navigator.of(context).pop(
            _WindowsCloseDecision(
              behavior: WindowsCloseBehavior.hideToTray,
              remember: _remember,
            ),
          ),
          icon: const Icon(Icons.keyboard_arrow_down_outlined),
          label: const Text('隐藏到托盘'),
        ),
      ],
    );
  }
}
