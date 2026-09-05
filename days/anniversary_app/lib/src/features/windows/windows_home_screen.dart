import 'dart:async';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/material.dart';

import '../../app/product_brand.dart';
import '../../domain/anniversary_preview.dart';
import '../../domain/anniversary_repository.dart';
import '../../data/windows_settings_store.dart';
import '../detail/event_detail_screen.dart';
import '../edit/event_edit_screen.dart';
import '../settings/settings_screen.dart';

class WindowsHomeScreen extends StatefulWidget {
  const WindowsHomeScreen({
    required this.repository,
    required this.settings,
    this.loadKey = 0,
    super.key,
  });

  final AnniversaryRepository repository;
  final WindowsWidgetSettings settings;
  final int loadKey;

  @override
  State<WindowsHomeScreen> createState() => _WindowsHomeScreenState();
}

class _WindowsHomeScreenState extends State<WindowsHomeScreen> {
  List<AnniversaryPreview>? _previews;
  int _lastLoadKey = -1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didUpdateWidget(WindowsHomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.loadKey != _lastLoadKey) {
      _loadData();
    }
  }

  Future<void> _loadData() async {
    _lastLoadKey = widget.loadKey;
    final previews = await widget.repository.listHomePreviews();
    if (mounted) {
      setState(() => _previews = previews);
    }
  }

  @override
  Widget build(BuildContext context) {
    final previews = _previews;
    final scheme = Theme.of(context).colorScheme;

    if (previews == null) {
      return Scaffold(
        backgroundColor: scheme.surface.withOpacity(
          (Theme.of(context).brightness == Brightness.dark ? 0.76 : 0.58) *
              widget.settings.opacity,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: scheme.surface.withOpacity(
        (Theme.of(context).brightness == Brightness.dark ? 0.76 : 0.58) *
            widget.settings.opacity,
      ),
      body: SafeArea(
        child: MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(widget.settings.fontScale),
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                minWidth: 360,
                maxWidth: 760,
                minHeight: 360,
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: (constraints.maxHeight - 32).clamp(
                          0,
                          double.infinity,
                        ),
                      ),
                      child: Center(
                        child: previews.isEmpty
                            ? _EmptyWindowsPanel(
                                today: widget.repository.today,
                                opacity: widget.settings.opacity,
                              )
                            : _FloatingPanel(
                                primary: previews.first,
                                previews: previews,
                                today: widget.repository.today,
                                opacity: widget.settings.opacity,
                              ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyWindowsPanel extends StatelessWidget {
  const _EmptyWindowsPanel({
    required this.today,
    required this.opacity,
  });

  final DateTime today;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: scheme.surface.withOpacity(
          (Theme.of(context).brightness == Brightness.dark ? 0.92 : 0.88) *
              opacity,
        ),
        border: Border.all(color: scheme.outlineVariant.withOpacity(0.58)),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(
              Theme.of(context).brightness == Brightness.dark ? 0.32 : 0.12,
            ),
            blurRadius: 36,
            offset: const Offset(0, 22),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _WindowToolbar(today: today),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 30),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.event_note_outlined,
                    size: 42,
                    color: scheme.primary,
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '还没有纪念日',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '导入 Android 备份，或先新增一个本地纪念日。',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.icon(
                        onPressed: () => Navigator.of(context).pushNamed(
                          SettingsScreen.routeName,
                        ),
                        icon: const Icon(Icons.file_open_outlined),
                        label: const Text('导入备份'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => Navigator.of(context).pushNamed(
                          EventEditScreen.routeName,
                        ),
                        icon: const Icon(Icons.add),
                        label: const Text('新增'),
                      ),
                    ],
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

class _FloatingPanel extends StatelessWidget {
  const _FloatingPanel({
    required this.primary,
    required this.previews,
    required this.today,
    required this.opacity,
  });

  final AnniversaryPreview primary;
  final List<AnniversaryPreview> previews;
  final DateTime today;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final days = primary.daysUntil(today);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: scheme.surface.withOpacity(
          (Theme.of(context).brightness == Brightness.dark ? 0.92 : 0.88) *
              opacity,
        ),
        border: Border.all(color: scheme.outlineVariant.withOpacity(0.58)),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(
              Theme.of(context).brightness == Brightness.dark ? 0.32 : 0.12,
            ),
            blurRadius: 36,
            offset: const Offset(0, 22),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _WindowToolbar(today: today),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 16, 22, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: _PrimarySummary(
                          preview: primary,
                          days: days,
                        ),
                      ),
                      const SizedBox(width: 18),
                      _MainNumber(days: days, label: primary.primaryLabel),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '全部小日子',
                          style:
                              Theme.of(context).textTheme.titleSmall?.copyWith(
                                    color: scheme.onSurfaceVariant,
                                    fontWeight: FontWeight.w900,
                                  ),
                        ),
                      ),
                      Text(
                        '${previews.length} 个',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              color: scheme.primary,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  for (final preview in previews)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _RecentRow(
                        preview: preview,
                        days: preview.daysUntil(today),
                      ),
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

class _WindowToolbar extends StatelessWidget {
  const _WindowToolbar({
    required this.today,
  });

  final DateTime today;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerHighest.withOpacity(0.34),
        border: Border(
          bottom: BorderSide(color: scheme.outlineVariant.withOpacity(0.45)),
        ),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              'assets/brand/jinnian_logo.png',
              width: 30,
              height: 30,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              productChineseName,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ),
          Text(
            formatDate(today),
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: scheme.onSurfaceVariant,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(width: 8),
          IconButton(
            tooltip: '新增',
            icon: const Icon(Icons.add),
            onPressed: () => Navigator.of(context).pushNamed(
              EventEditScreen.routeName,
            ),
          ),
          IconButton(
            tooltip: '设置',
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.of(context).pushNamed(
              SettingsScreen.routeName,
            ),
          ),
        ],
      ),
    );
  }
}

class _PrimarySummary extends StatelessWidget {
  const _PrimarySummary({
    required this.preview,
    required this.days,
  });

  final AnniversaryPreview preview;
  final int days;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          days == 0 ? '今天' : '最近的纪念日',
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: scheme.primary,
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          preview.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 6),
        Text(
          '${preview.sourceDisplay} · ${preview.targetDateText}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: scheme.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}

class _MainNumber extends StatelessWidget {
  const _MainNumber({
    required this.days,
    required this.label,
  });

  final int days;
  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      label: '$days $label',
      child: ExcludeSemantics(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '$days',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    height: 0.95,
                    color: scheme.primary,
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: scheme.onSurfaceVariant,
                    fontWeight: FontWeight.w800,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentRow extends StatelessWidget {
  const _RecentRow({
    required this.preview,
    required this.days,
  });

  final AnniversaryPreview preview;
  final int days;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.surfaceContainerHighest.withOpacity(0.28),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () => Navigator.of(context).pushNamed(
          EventDetailScreen.routeName,
          arguments: preview.id,
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            children: [
              Icon(
                Icons.event_available_outlined,
                size: 20,
                color: scheme.primary,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      preview.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${preview.category} · ${preview.sourceDisplay}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: scheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 76,
                child: Text(
                  days == 0 ? '今天' : '$days 天',
                  textAlign: TextAlign.end,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
