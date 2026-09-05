import 'dart:async';

import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/material.dart';

import '../../domain/anniversary_preview.dart';
import '../../domain/anniversary_repository.dart';

class EventDetailScreen extends StatefulWidget {
  const EventDetailScreen({
    required this.repository,
    this.onChanged,
    super.key,
  });

  static const routeName = '/detail';

  final AnniversaryRepository repository;
  final VoidCallback? onChanged;

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  AnniversaryPreview? _preview;
  bool _loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadPreview();
  }

  Future<void> _loadPreview() async {
    final previews = await widget.repository.listHomePreviews();
    if (!mounted) return;

    AnniversaryPreview? selected;
    if (previews.isNotEmpty) {
      final arguments = ModalRoute.of(context)?.settings.arguments;
      final selectedId = arguments is String ? arguments : null;
      if (selectedId == null) {
        selected = previews.first;
      } else {
        for (final preview in previews) {
          if (preview.id == selectedId) {
            selected = preview;
            break;
          }
        }
        selected ??= previews.first;
      }
    }

    setState(() {
      _preview = selected;
      _loaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return Scaffold(
        appBar: AppBar(title: const Text('详情')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final preview = _preview;
    if (preview == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('详情')),
        body: const Center(
          child: Text('这个纪念日暂时不可查看'),
        ),
      );
    }

    final days = preview.daysUntil(widget.repository.today);
    return Scaffold(
      appBar: AppBar(
        title: const Text('详情'),
        actions: [
          IconButton(
            tooltip: '删除',
            onPressed: () => _confirmDelete(context, preview),
            icon: const Icon(Icons.delete_outline),
          ),
          TextButton.icon(
            onPressed: () => Navigator.of(context).pushNamed(
              '/edit',
              arguments: preview.id,
            ),
            icon: const Icon(Icons.edit_outlined),
            label: const Text('编辑'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    preview.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    '$days',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  Text(preview.primaryLabel),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _InfoSection(
            rows: [
              ('原始日期', preview.sourceDisplay),
              ('今年对应', preview.targetDateText),
              ('提醒', preview.reminderRule.displayText),
              ('分类', preview.category),
            ],
          ),
          if (preview.note.trim().isNotEmpty) ...[
            const SizedBox(height: 16),
            _NoteSection(note: preview.note.trim()),
          ],
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '未来几年',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  for (final occurrence in preview.futureOccurrences)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(formatDate(occurrence.occurrenceDate!)),
                      subtitle: Text(occurrence.sourceDisplay),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(
    BuildContext context,
    AnniversaryPreview preview,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('删除纪念日'),
        content: Text('确定删除「${preview.title}」吗？此操作无法撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('删除'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) {
      return;
    }
    await widget.repository.deleteEvent(preview.id);
    widget.onChanged?.call();
    if (context.mounted) {
      Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
    }
  }
}

class _NoteSection extends StatelessWidget {
  const _NoteSection({
    required this.note,
  });

  final String note;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.notes_outlined),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '备注',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(note),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({
    required this.rows,
  });

  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            for (final row in rows)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Expanded(child: Text(row.$1)),
                    Flexible(
                      child: Text(
                        row.$2,
                        textAlign: TextAlign.end,
                        style: const TextStyle(fontWeight: FontWeight.w700),
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
