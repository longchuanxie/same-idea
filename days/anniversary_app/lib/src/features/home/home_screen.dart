import 'dart:async';

import 'package:flutter/material.dart';

import '../../domain/anniversary_preview.dart';
import '../../domain/anniversary_repository.dart';
import '../../app/product_brand.dart';
import '../detail/event_detail_screen.dart';
import '../edit/event_edit_screen.dart';
import '../settings/settings_screen.dart';
import 'widgets/preview_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    required this.repository,
    this.loadKey = 0,
    super.key,
  });

  static const routeName = '/';

  final AnniversaryRepository repository;
  final int loadKey;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<AnniversaryPreview>? _previews;
  int _lastLoadKey = -1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didUpdateWidget(HomeScreen oldWidget) {
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
    if (previews == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text(productChineseName),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(productChineseName),
        actions: [
          IconButton(
            tooltip: '设置',
            icon: const Icon(Icons.settings_outlined),
            onPressed: () =>
                Navigator.of(context).pushNamed(SettingsScreen.routeName),
          ),
        ],
      ),
      body: previews.isEmpty
          ? const _EmptyHomeState()
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
              children: [
                _PrimaryCard(
                  preview: previews.first,
                  days: previews.first.daysUntil(widget.repository.today),
                ),
                const SizedBox(height: 24),
                Text(
                  '即将到来',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 12),
                for (final preview in previews)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: PreviewCard(
                      preview: preview,
                      days: preview.daysUntil(widget.repository.today),
                      onTap: () => Navigator.of(context).pushNamed(
                        EventDetailScreen.routeName,
                        arguments: preview.id,
                      ),
                    ),
                  ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        tooltip: '新增纪念日',
        onPressed: () =>
            Navigator.of(context).pushNamed(EventEditScreen.routeName),
        child: const Icon(Icons.add),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '首页',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_circle_outline),
            selectedIcon: Icon(Icons.add_circle),
            label: '新增',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: '设置',
          ),
        ],
        onDestinationSelected: (index) {
          if (index == 1) {
            Navigator.of(context).pushNamed(EventEditScreen.routeName);
          }
          if (index == 2) {
            Navigator.of(context).pushNamed(SettingsScreen.routeName);
          }
        },
      ),
    );
  }
}

class _EmptyHomeState extends StatelessWidget {
  const _EmptyHomeState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.event_note_outlined,
              size: 48,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              '还没有纪念日',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '新增一个纪念日，或在设置里导入 Android 备份。',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: () =>
                  Navigator.of(context).pushNamed(EventEditScreen.routeName),
              icon: const Icon(Icons.add),
              label: const Text('新增纪念日'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PrimaryCard extends StatelessWidget {
  const _PrimaryCard({
    required this.preview,
    required this.days,
  });

  final AnniversaryPreview preview;
  final int days;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '最近的纪念日',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: scheme.primary,
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 18),
            Text(
              preview.title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 8),
            Text('${preview.sourceDisplay} · ${preview.targetDateText}'),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$days',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        color: scheme.primary,
                      ),
                ),
                const SizedBox(width: 8),
                Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Text(
                    preview.primaryLabel,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
