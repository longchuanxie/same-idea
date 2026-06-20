import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/injection.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/enums/export_format.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/repositories/project_repository.dart';
import 'package:novel_creator/domain/repositories/revision_repository.dart';
import 'package:novel_creator/domain/services/export_service.dart';
import 'package:novel_creator/features/export/bloc/export_bloc.dart';
import 'package:novel_creator/features/export/bloc/export_event.dart';
import 'package:novel_creator/features/export/bloc/export_state.dart';
import 'package:novel_creator/features/export/services/default_export_service.dart';

class ExportPage extends StatelessWidget {
  const ExportPage({super.key, required this.projectId});

  final String projectId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<ExportBloc>(
      create: (_) => ExportBloc(
        exportService: DefaultExportService(
          projectRepository: getIt<ProjectRepository>(),
          chapterRepository: getIt<ChapterRepository>(),
          revisionRepository: getIt<RevisionRepository>(),
        ),
        projectRepository: getIt<ProjectRepository>(),
        chapterRepository: getIt<ChapterRepository>(),
        revisionRepository: getIt<RevisionRepository>(),
        eventBus: getIt(),
      )..add(ExportLoaded(projectId: projectId)),
      child: ExportView(projectId: projectId),
    );
  }
}

class ExportView extends StatelessWidget {
  const ExportView({super.key, required this.projectId});

  final String projectId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('导出向导'),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            tooltip: '导出帮助',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('选择格式后可预览和导出项目内容')),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<ExportBloc, ExportState>(
        builder: (context, state) {
          if (state.isLoading && state.projectId.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error != null && state.projectId.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline,
                      size: 48, color: Theme.of(context).colorScheme.error),
                  const SizedBox(height: 16),
                  Text(state.error!.userMessage),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () => context
                        .read<ExportBloc>()
                        .add(ExportLoaded(projectId: projectId)),
                    child: const Text('重试'),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _FormatSelector(state: state),
                const SizedBox(height: 24),
                _ExportOptions(state: state),
                const SizedBox(height: 24),
                if (state.hasPendingRevisions) _RevisionWarning(state: state),
                const SizedBox(height: 24),
                _ProjectInfo(state: state),
                const SizedBox(height: 24),
                _PreviewSection(state: state),
                const SizedBox(height: 24),
                _ExportActions(state: state),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FormatSelector extends StatelessWidget {
  const _FormatSelector({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('选择导出格式',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: ExportFormat.values.map((format) {
            final isSelected = state.format == format;
            return _FormatCard(
              format: format,
              isSelected: isSelected,
              isImplemented: format.isImplemented,
              onTap: () => context
                  .read<ExportBloc>()
                  .add(ExportFormatSelected(format: format)),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _FormatCard extends StatelessWidget {
  const _FormatCard({
    required this.format,
    required this.isSelected,
    required this.isImplemented,
    required this.onTap,
  });

  final ExportFormat format;
  final bool isSelected;
  final bool isImplemented;
  final VoidCallback onTap;

  IconData get _icon => switch (format) {
        ExportFormat.txt => Icons.description_outlined,
        ExportFormat.markdown => Icons.code,
        ExportFormat.epub => Icons.menu_book_outlined,
        ExportFormat.pdf => Icons.picture_as_pdf_outlined,
        ExportFormat.docx => Icons.article_outlined,
        ExportFormat.projectPackage => Icons.folder_zip_outlined,
      };

  String get _description => switch (format) {
        ExportFormat.txt => '纯文本格式，体积小，兼容性强',
        ExportFormat.markdown => '轻量标记语言，便于编辑与版本控制',
        ExportFormat.epub => '电子书标准格式（即将推出）',
        ExportFormat.pdf => '通用文档格式（即将推出）',
        ExportFormat.docx => 'Word 文档格式（即将推出）',
        ExportFormat.projectPackage => '项目打包格式（即将推出）',
      };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: isImplemented ? onTap : null,
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 180,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected
                ? MorandiColors.sage
                : MorandiColors.mist,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
          color: isSelected
              ? MorandiColors.sage.withOpacity(0.1)
              : null,
        ),
        child: Opacity(
          opacity: isImplemented ? 1.0 : 0.5,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Radio<ExportFormat>(
                    value: format,
                    groupValue: isSelected ? format : null,
                    onChanged: isImplemented ? (_) => onTap() : null,
                    visualDensity: VisualDensity.compact,
                  ),
                  Icon(_icon, size: 20, color: MorandiColors.ink),
                  const SizedBox(width: 8),
                  Text(
                    format.name.toUpperCase(),
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                _description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: MorandiColors.ink.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                format.extension,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: MorandiColors.sage,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExportOptions extends StatelessWidget {
  const _ExportOptions({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('导出选项',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            SwitchListTile(
              title: const Text('仅导出已接受内容'),
              subtitle: const Text('排除待审核的修订内容'),
              value: state.onlyAcceptedContent,
              onChanged: (v) => context
                  .read<ExportBloc>()
                  .add(ExportOnlyAcceptedToggled(onlyAccepted: v)),
            ),
            SwitchListTile(
              title: const Text('包含目录'),
              subtitle: const Text('在文档开头生成章节目录'),
              value: state.includeToc,
              onChanged: (v) => context
                  .read<ExportBloc>()
                  .add(ExportIncludeTocToggled(includeToc: v)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextFormField(
                decoration: const InputDecoration(
                  labelText: '作者',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
                onChanged: (v) => context
                    .read<ExportBloc>()
                    .add(ExportAuthorChanged(author: v)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RevisionWarning extends StatelessWidget {
  const _RevisionWarning({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: MorandiColors.clay.withOpacity(0.15),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.warning_amber, color: MorandiColors.clay),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '存在 ${state.pendingRevisionCount} 条待审核修订',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '当前设置仅导出已接受内容。待审核修订不会被包含在导出文件中。',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => context
                  .read<ExportBloc>()
                  .add(const ExportRevisionWarningDismissed()),
              child: const Text('知道了'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProjectInfo extends StatelessWidget {
  const _ProjectInfo({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.folder_outlined, color: MorandiColors.sage),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(state.projectName,
                      style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(
                    '${state.chapterCount} 章 · ${state.totalWordCount} 字',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: MorandiColors.ink.withOpacity(0.6),
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

class _PreviewSection extends StatelessWidget {
  const _PreviewSection({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('文档预览',
                    style: Theme.of(context).textTheme.titleMedium),
                const Spacer(),
                FilledButton.tonal(
                  onPressed: state.format.isImplemented
                      ? () => context
                          .read<ExportBloc>()
                          .add(const ExportPreviewRequested())
                      : null,
                  child: const Text('生成预览'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (state.previewContent != null)
              Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxHeight: 300),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: MorandiColors.paper,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: MorandiColors.mist),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    state.previewContent!,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontSize: 14,
                      height: 1.8,
                    ),
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  color: MorandiColors.paper.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: MorandiColors.mist),
                ),
                child: Center(
                  child: Text(
                    '点击"生成预览"查看导出效果',
                    style: TextStyle(
                      color: MorandiColors.ink.withOpacity(0.4),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ExportActions extends StatelessWidget {
  const _ExportActions({required this.state});

  final ExportState state;

  @override
  Widget build(BuildContext context) {
    if (state.exportResult != null) {
      return _ExportSuccess(result: state.exportResult!);
    }

    return Row(
      children: [
        FilledButton(
          onPressed: state.format.isImplemented && !state.isExporting
              ? () => context
                  .read<ExportBloc>()
                  .add(const ExportConfirmed())
              : null,
          child: state.isExporting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('导出文件'),
        ),
        const SizedBox(width: 12),
        if (!state.format.isImplemented)
          Text(
            '该格式暂未实现',
            style: TextStyle(
              color: Theme.of(context).colorScheme.error,
              fontSize: 13,
            ),
          ),
      ],
    );
  }
}

class _ExportSuccess extends StatelessWidget {
  const _ExportSuccess({required this.result});

  final ExportResult result;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: MorandiColors.sage.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.check_circle, color: MorandiColors.sage),
                const SizedBox(width: 12),
                Text('导出成功',
                    style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
            const SizedBox(height: 12),
            Text('格式：${result.format.name.toUpperCase()}'),
            Text('章节：${result.chapterCount} 章'),
            Text('字数：${result.totalWordCount} 字'),
            Text('内容长度：${result.content.length} 字符'),
            const SizedBox(height: 16),
            SelectableText(
              result.content.substring(0, result.content.length > 500 ? 500 : result.content.length),
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('返回'),
            ),
          ],
        ),
      ),
    );
  }
}
