import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/setting_category.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';

class SettingEntryListWidget extends StatefulWidget {
  const SettingEntryListWidget({super.key, required this.projectId});

  final String projectId;

  static const cardPadding = 16.0;
  static const cardRadius = 12.0;
  static const chipSpacing = 4.0;
  static const chipRunSpacing = 4.0;
  static const listItemSpacing = 8.0;
  static const iconButtonSize = 36.0;

  @override
  State<SettingEntryListWidget> createState() => _SettingEntryListWidgetState();
}

class _SettingEntryListWidgetState extends State<SettingEntryListWidget> {

  SettingCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<KnowledgeBaseBloc, KnowledgeBaseState>(
        buildWhen: (prev, curr) =>
            prev.settingEntries != curr.settingEntries ||
            prev.error != curr.error,
        builder: (context, state) {
          final entries = state.settingEntries;

          if (entries.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Icon(
                    Icons.menu_book_outlined,
                    size: 56,
                    color: MorandiColors.mist,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '暂无设定',
                    style: TextStyle(
                      fontSize: 16,
                      color: MorandiColors.clay,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '点击右下角按钮创建新设定',
                    style: TextStyle(
                      fontSize: 13,
                      color: MorandiColors.sage,
                    ),
                  ),
                ],
              ),
            );
          }

          final filteredEntries = _selectedCategory == null
              ? entries
              : entries
                  .where((e) => e.category == _selectedCategory)
                  .toList();

          return Column(
            children: <Widget>[
              // Category filter row
              _CategoryFilterRow(
                selectedCategory: _selectedCategory,
                onCategorySelected: (category) {
                  setState(() {
                    _selectedCategory = category;
                  });
                },
              ),
              // Entry list
              Expanded(
                child: Stack(
                  children: <Widget>[
                    filteredEntries.isEmpty
                        ? Center(
                            child: Text(
                              '该分类下暂无设定',
                              style: TextStyle(
                                fontSize: 14,
                                color: MorandiColors.clay,
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(SettingEntryListWidget.cardPadding),
                            itemCount: filteredEntries.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: SettingEntryListWidget.listItemSpacing),
                            itemBuilder: (context, index) =>
                                _SettingEntryCard(
                              entry: filteredEntries[index],
                              onEdit: () => _showEntryDialog(
                                  context, filteredEntries[index]),
                            ),
                          ),
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: FloatingActionButton(
                        backgroundColor: MorandiColors.clay,
                        foregroundColor: Colors.white,
                        onPressed: () =>
                            _showEntryDialog(context, null),
                        tooltip: '新建设定',
                        child: const Icon(Icons.add),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      );

  Future<void> _showEntryDialog(
    BuildContext context,
    SettingEntry? entry,
  ) async {
    final titleController = TextEditingController(text: entry?.title ?? '');
    final contentController = TextEditingController(text: entry?.content ?? '');
    final tagsController = TextEditingController(
      text: entry?.tags.join(', ') ?? '',
    );
    SettingCategory selectedCategory =
        entry?.category ?? SettingCategory.other;

    final result = await showDialog<SettingEntry>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(entry == null ? '新建设定' : '编辑设定'),
        content: SingleChildScrollView(
          child: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: '标题',
                    border: OutlineInputBorder(),
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<SettingCategory>(
                  value: selectedCategory,
                  decoration: const InputDecoration(
                    labelText: '分类',
                    border: OutlineInputBorder(),
                  ),
                  items: SettingCategory.values.map((cat) {
                    return DropdownMenuItem<SettingCategory>(
                      value: cat,
                      child: Text(_categoryLabel(cat)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) selectedCategory = value;
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: tagsController,
                  decoration: const InputDecoration(
                    labelText: '标签（逗号分隔）',
                    border: OutlineInputBorder(),
                    hintText: '魔法, 古代, 禁忌',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentController,
                  decoration: const InputDecoration(
                    labelText: '内容',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 5,
                ),
              ],
            ),
          ),
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () {
              if (titleController.text.trim().isEmpty) return;
              final now = DateTime.now().toUtc();
              Navigator.of(dialogContext).pop(
                SettingEntry(
                  id: entry?.id ?? IdGenerator.create('setting'),
                  projectId: widget.projectId,
                  title: titleController.text.trim(),
                  content: contentController.text.trim(),
                  category: selectedCategory,
                  tags: _parseTags(tagsController.text),
                  createdAt: entry?.createdAt ?? now,
                  updatedAt: now,
                ),
              );
            },
            child: Text(entry == null ? '创建' : '保存'),
          ),
        ],
      ),
    );

    if (!context.mounted || result == null) return;

    if (entry == null) {
      context.read<KnowledgeBaseBloc>().add(SettingEntryCreated(result));
    } else {
      context.read<KnowledgeBaseBloc>().add(SettingEntryUpdated(result));
    }
  }

  List<String> _parseTags(String text) {
    if (text.trim().isEmpty) return <String>[];
    return text
        .split(',')
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty)
        .toList();
  }

  String _categoryLabel(SettingCategory cat) => switch (cat) {
        SettingCategory.geography => '地理',
        SettingCategory.history => '历史',
        SettingCategory.magicSystem => '魔法体系',
        SettingCategory.politics => '政治',
        SettingCategory.culture => '文化',
        SettingCategory.technology => '科技',
        SettingCategory.organization => '组织',
        SettingCategory.items => '物品',
        SettingCategory.other => '其他',
      };
}

// --- Category filter row ---
class _CategoryFilterRow extends StatelessWidget {
  const _CategoryFilterRow({
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  final SettingCategory? selectedCategory;
  final ValueChanged<SettingCategory?> onCategorySelected;

  static const _categoryColors = <SettingCategory, Color>{
    SettingCategory.geography: Color(0xFF7A9E8F),
    SettingCategory.history: Color(0xFF8E7A9E),
    SettingCategory.magicSystem: Color(0xFF9E8E7A),
    SettingCategory.politics: Color(0xFF7A8E9E),
    SettingCategory.culture: Color(0xFF9E7A8E),
    SettingCategory.technology: Color(0xFF7A9E9E),
    SettingCategory.organization: Color(0xFF8E9E8E),
    SettingCategory.items: Color(0xFF9E9E7A),
    SettingCategory.other: MorandiColors.mist,
  };

  static const _categoryLabels = <SettingCategory, String>{
    SettingCategory.geography: '地理',
    SettingCategory.history: '历史',
    SettingCategory.magicSystem: '魔法体系',
    SettingCategory.politics: '政治',
    SettingCategory.culture: '文化',
    SettingCategory.technology: '科技',
    SettingCategory.organization: '组织',
    SettingCategory.items: '物品',
    SettingCategory.other: '其他',
  };

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: <Widget>[
              _FilterChip(
                label: '全部',
                isSelected: selectedCategory == null,
                color: MorandiColors.sage,
                onTap: () => onCategorySelected(null),
              ),
              const SizedBox(width: 6),
              ...SettingCategory.values.map((cat) => Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: _FilterChip(
                      label: _categoryLabels[cat]!,
                      isSelected: selectedCategory == cat,
                      color: _categoryColors[cat]!,
                      onTap: () => onCategorySelected(
                        selectedCategory == cat ? null : cat,
                      ),
                    ),
                  )),
            ],
          ),
        ),
      );
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.color,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bgColor = isSelected ? color.withOpacity(0.2) : Colors.white;
    final textColor = isSelected ? color : MorandiColors.clay;
    final borderColor = isSelected ? color : MorandiColors.mist;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderColor,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: textColor,
          ),
        ),
      ),
    );
  }
}

class _SettingEntryCard extends StatelessWidget {
  const _SettingEntryCard({
    required this.entry,
    required this.onEdit,
  });

  final SettingEntry entry;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) => Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SettingEntryListWidget.cardRadius),
          side: BorderSide(color: MorandiColors.mist),
        ),
        color: Colors.white,
        margin: EdgeInsets.zero,
        child: InkWell(
          borderRadius: BorderRadius.circular(SettingEntryListWidget.cardRadius),
          onTap: () {},
          child: Padding(
            padding:
                const EdgeInsets.all(SettingEntryListWidget.cardPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        entry.title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: MorandiColors.ink,
                        ),
                      ),
                    ),
                    _CategoryBadge(category: entry.category),
                  ],
                ),
                if (entry.content.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 8),
                  Text(
                    entry.content,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: MorandiColors.clay,
                      height: 1.5,
                    ),
                  ),
                ],
                if (entry.tags.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: SettingEntryListWidget.chipSpacing,
                    runSpacing: SettingEntryListWidget.chipRunSpacing,
                    children: entry.tags
                        .map((tag) => Chip(
                              label: Text(tag),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                              labelStyle: TextStyle(
                                fontSize: 11,
                                color: MorandiColors.sage,
                              ),
                              backgroundColor:
                                  MorandiColors.sage.withOpacity(0.1),
                              padding: EdgeInsets.zero,
                            ))
                        .toList(),
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    IconButton(
                      iconSize: 18,
                      icon: Icon(
                        Icons.edit_outlined,
                        color: MorandiColors.sage,
                        size: 18,
                      ),
                      constraints: BoxConstraints(
                        minWidth: SettingEntryListWidget.iconButtonSize,
                        minHeight: SettingEntryListWidget.iconButtonSize,
                      ),
                      onPressed: onEdit,
                      tooltip: '编辑',
                    ),
                    IconButton(
                      iconSize: 18,
                      icon: Icon(
                        Icons.delete_outline,
                        color: MorandiColors.clay,
                        size: 18,
                      ),
                      constraints: BoxConstraints(
                        minWidth: SettingEntryListWidget.iconButtonSize,
                        minHeight: SettingEntryListWidget.iconButtonSize,
                      ),
                      onPressed: () => _confirmDelete(context),
                      tooltip: '删除',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );

  void _confirmDelete(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定要删除设定「${entry.title}」吗？此操作不可撤销。'),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('取消'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red.shade300,
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<KnowledgeBaseBloc>().add(SettingEntryDeleted(entry.id));
            },
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  const _CategoryBadge({required this.category});

  final SettingCategory category;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (category) {
      SettingCategory.geography => ('地理', Color(0xFF7A9E8F)),
      SettingCategory.history => ('历史', Color(0xFF8E7A9E)),
      SettingCategory.magicSystem => ('魔法体系', Color(0xFF9E8E7A)),
      SettingCategory.politics => ('政治', Color(0xFF7A8E9E)),
      SettingCategory.culture => ('文化', Color(0xFF9E7A8E)),
      SettingCategory.technology => ('科技', Color(0xFF7A9E9E)),
      SettingCategory.organization => ('组织', Color(0xFF8E9E8E)),
      SettingCategory.items => ('物品', Color(0xFF9E9E7A)),
      SettingCategory.other => ('其他', MorandiColors.mist),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}
