import 'package:flutter/material.dart';

import '../../app/product_brand.dart';
import '../../data/windows_settings_store.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    this.windowsSettings,
    this.onWindowsSettingsChanged,
    this.onOpenWindowsDataFolder,
    this.onImportWindowsBackup,
    this.onRefreshWindowsData,
    super.key,
  });

  static const routeName = '/settings';

  final WindowsWidgetSettings? windowsSettings;
  final ValueChanged<WindowsWidgetSettings>? onWindowsSettingsChanged;
  final Future<String?> Function()? onOpenWindowsDataFolder;
  final Future<String?> Function()? onImportWindowsBackup;
  final Future<String?> Function()? onRefreshWindowsData;

  @override
  Widget build(BuildContext context) {
    final settings = windowsSettings;
    final isWindowsMode = settings != null;
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (isWindowsMode) ...[
            _SettingsTile(
              icon: Icons.folder_open_outlined,
              title: '本地数据目录',
              subtitle: '打开缓存、设置和导入后的本地 JSON 文件所在位置',
              onTap: onOpenWindowsDataFolder,
            ),
            _SettingsTile(
              icon: Icons.restore_outlined,
              title: '导入 Android 备份',
              subtitle: '选择 anniversary-backup-v1.json 并重新计算日期',
              onTap: onImportWindowsBackup,
            ),
            _SettingsTile(
              icon: Icons.refresh,
              title: '刷新数据',
              subtitle: '重新读取本地缓存，适合手动替换备份文件后使用',
              onTap: onRefreshWindowsData,
            ),
          ] else ...[
            const _AndroidStatusCard(),
            _SettingsTile(
              icon: Icons.info_outline,
              title: '关于今念',
              subtitle: '版本 $productVersionName',
              onTap: () => _showAbout(context),
            ),
            _SettingsTile(
              icon: Icons.privacy_tip_outlined,
              title: '本地优先与隐私',
              subtitle: '数据留在本机，日期计算使用内置农历规则',
              onTap: () => _showPrivacy(context),
            ),
          ],
          if (settings != null && onWindowsSettingsChanged != null) ...[
            const SizedBox(height: 20),
            Text(
              'Windows 桌面组件',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 12),
            _WindowsSwitchTile(
              icon: Icons.push_pin_outlined,
              title: '窗口置顶',
              subtitle: '让纪念日卡片停留在其他窗口上方',
              value: settings.alwaysOnTop,
              onChanged: (value) => onWindowsSettingsChanged!(
                settings.copyWith(alwaysOnTop: value),
              ),
            ),
            _WindowsSwitchTile(
              icon: Icons.power_settings_new_outlined,
              title: '开机启动',
              subtitle: '登录 Windows 后自动启动桌面组件',
              value: settings.launchAtStartup,
              onChanged: (value) => onWindowsSettingsChanged!(
                settings.copyWith(launchAtStartup: value),
              ),
            ),
            _WindowsCloseBehaviorTile(
              value: settings.closeBehavior,
              onChanged: (value) => onWindowsSettingsChanged!(
                settings.copyWith(closeBehavior: value),
              ),
            ),
            _WindowsSliderTile(
              icon: Icons.opacity,
              title: '透明度',
              valueLabel: '${(settings.opacity * 100).round()}%',
              value: settings.opacity,
              min: 0.62,
              max: 1,
              divisions: 19,
              onChanged: (value) => onWindowsSettingsChanged!(
                settings.copyWith(opacity: value),
              ),
            ),
            _WindowsSliderTile(
              icon: Icons.format_size,
              title: '字号',
              valueLabel: '${(settings.fontScale * 100).round()}%',
              value: settings.fontScale,
              min: 0.88,
              max: 1.28,
              divisions: 20,
              onChanged: (value) => onWindowsSettingsChanged!(
                settings.copyWith(fontScale: value),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<String?> _showAbout(BuildContext context) async {
    showAboutDialog(
      context: context,
      applicationName: productChineseName,
      applicationVersion: '$productVersionName+$productBuildNumber',
      applicationIcon: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.asset(
          'assets/brand/jinnian_logo.png',
          width: 48,
          height: 48,
        ),
      ),
      applicationLegalese: '本地优先 · 农历 1901-2100',
      children: const [
        SizedBox(height: 12),
        Text(productTagline),
      ],
    );
    return null;
  }

  Future<String?> _showPrivacy(BuildContext context) async {
    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('本地优先与隐私'),
          content: const Text(
            '今念不包含账号登录、云同步或商城能力。纪念日数据在本机运行环境中处理，日期换算使用随应用打包的农历规则数据。',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('知道了'),
            ),
          ],
        );
      },
    );
    return null;
  }
}

class _AndroidStatusCard extends StatelessWidget {
  const _AndroidStatusCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 14, 16, 14),
        child: Column(
          children: [
            _StatusRow(
              icon: Icons.dark_mode_outlined,
              title: '外观模式',
              value: '跟随系统',
            ),
            Divider(height: 20),
            _StatusRow(
              icon: Icons.event_available_outlined,
              title: '日期范围',
              value: '农历 1901-2100',
            ),
            Divider(height: 20),
            _StatusRow(
              icon: Icons.storage_outlined,
              title: '数据策略',
              value: '本地优先',
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  const _StatusRow({
    required this.icon,
    required this.title,
    required this.value,
  });

  final IconData icon;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            title,
            style: textTheme.bodyLarge,
          ),
        ),
        Text(
          value,
          style: textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Future<String?> Function()? onTap;

  @override
  Widget build(BuildContext context) {
    final action = onTap;
    return Card(
      child: ListTile(
        enabled: action != null,
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: action == null ? null : const Icon(Icons.chevron_right),
        onTap: action == null
            ? null
            : () async {
                final message = await action();
                if (context.mounted && message != null && message.isNotEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(message)),
                  );
                }
              },
      ),
    );
  }
}

class _WindowsCloseBehaviorTile extends StatelessWidget {
  const _WindowsCloseBehaviorTile({
    required this.value,
    required this.onChanged,
  });

  final WindowsCloseBehavior value;
  final ValueChanged<WindowsCloseBehavior> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(
          children: [
            const Icon(Icons.close_fullscreen_outlined),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<WindowsCloseBehavior>(
                value: value,
                decoration: const InputDecoration(
                  labelText: '关闭按钮',
                  helperText: '点击右上角关闭时的默认行为',
                ),
                items: [
                  for (final behavior in WindowsCloseBehavior.values)
                    DropdownMenuItem(
                      value: behavior,
                      child: Text(behavior.label),
                    ),
                ],
                onChanged: (behavior) {
                  if (behavior != null) {
                    onChanged(behavior);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WindowsSwitchTile extends StatelessWidget {
  const _WindowsSwitchTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SwitchListTile(
        secondary: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}

class _WindowsSliderTile extends StatelessWidget {
  const _WindowsSliderTile({
    required this.icon,
    required this.title,
    required this.valueLabel,
    required this.value,
    required this.min,
    required this.max,
    required this.divisions,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String valueLabel;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Row(
          children: [
            Icon(icon),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(title)),
                      Text(valueLabel),
                    ],
                  ),
                  Slider(
                    value: value,
                    min: min,
                    max: max,
                    divisions: divisions,
                    label: valueLabel,
                    onChanged: onChanged,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
