import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/enums/note_category.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';

class NoteListWidget extends StatefulWidget {
  const NoteListWidget({super.key, required this.projectId});

  final String projectId;

  static const cardPadding = 16.0;
  static const cardRadius = 12.0;
  static const chipSpacing = 4.0;
  static const chipRunSpacing = 4.0;
  static const listItemSpacing = 8.0;
  static const iconButtonSize = 36.0;

  static String formatDateTime(DateTime dt) {
    final local = dt.toLocal();
    return '${local.year}-${_pad(local.month)}-${_pad(local.day)} '
        '${_pad(local.hour)}:${_pad(local.minute)}';
  }

  static String _pad(int n) => n.toString().padLeft(2, '0');

  @override
  State<NoteListWidget> createState() => _NoteListWidgetState();
}

class _NoteListWidgetState extends State<NoteListWidget> {
  NoteCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<KnowledgeBaseBloc, KnowledgeBaseState>(
        buildWhen: (prev, curr) =>
            prev.notes != curr.notes || prev.error != curr.error,
        builder: (context, state) {
          final notes = state.notes;

          if (notes.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Icon(
                    Icons.note_outlined,
                    size: 56,
                    color: MorandiColors.mist,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '暂无笔记',
                    style: TextStyle(
                      fontSize: 16,
                      color: MorandiColors.clay,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '点击右下角按钮创建新笔记',
                    style: TextStyle(
                      fontSize: 13,
                      color: MorandiColors.sage,
                    ),
                  ),
                ],
              ),
            );
          }

          final filteredNotes = _selectedCategory == null
              ? notes
              : notes.where((n) => n.category == _selectedCategory).toList();

          return Column(
            children: <Widget>[
              // Category filter row
              _NoteCategoryFilterRow(
                selectedCategory: _selectedCategory,
                onCategorySelected: (category) {
                  setState(() {
                    _selectedCategory = category;
                  });
                },
              ),
              // Note list
              Expanded(
                child: Stack(
                  children: <Widget>[
                    filteredNotes.isEmpty
                        ? Center(
                            child: Text(
                              '该分类下暂无笔记',
                              style: TextStyle(
                                fontSize: 14,
                                color: MorandiColors.clay,
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(NoteListWidget.cardPadding),
                            itemCount: filteredNotes.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: NoteListWidget.listItemSpacing),
                            itemBuilder: (context, index) => _NoteCard(
                              note: filteredNotes[index],
                              onEdit: () => _showNoteDialog(
                                  context, filteredNotes[index]),
                            ),
                          ),
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: FloatingActionButton(
                        backgroundColor: MorandiColors.sage,
                        foregroundColor: Colors.white,
                        onPressed: () => _showNoteDialog(context, null),
                        tooltip: '新建笔记',
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

  Future<void> _showNoteDialog(BuildContext context, Note? note) async {
    final titleController = TextEditingController(text: note?.title ?? '');
    final contentController = TextEditingController(text: note?.content ?? '');
    final tagsController = TextEditingController(
      text: note?.tags.join(', ') ?? '',
    );
    var selectedCategory = note?.category ?? NoteCategory.misc;

    final result = await showDialog<Note>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(note == null ? '新建笔记' : '编辑笔记'),
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
                DropdownButtonFormField<NoteCategory>(
                  value: selectedCategory,
                  decoration: const InputDecoration(
                    labelText: '分类',
                    border: OutlineInputBorder(),
                  ),
                  items: NoteCategory.values.map((cat) {
                    return DropdownMenuItem<NoteCategory>(
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
                    hintText: '伏笔, 线索, 待补充',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentController,
                  decoration: const InputDecoration(
                    labelText: '内容',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 6,
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
                Note(
                  id: note?.id ?? IdGenerator.create('note'),
                  projectId: widget.projectId,
                  title: titleController.text.trim(),
                  content: contentController.text.trim(),
                  category: selectedCategory,
                  tags: _parseTags(tagsController.text),
                  createdAt: note?.createdAt ?? now,
                  updatedAt: now,
                ),
              );
            },
            child: Text(note == null ? '创建' : '保存'),
          ),
        ],
      ),
    );

    if (!context.mounted || result == null) return;

    if (note == null) {
      context.read<KnowledgeBaseBloc>().add(NoteCreated(result));
    } else {
      context.read<KnowledgeBaseBloc>().add(NoteUpdated(result));
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

  String _categoryLabel(NoteCategory cat) => switch (cat) {
        NoteCategory.plot => '情节',
        NoteCategory.character => '角色相关',
        NoteCategory.worldbuilding => '世界观',
        NoteCategory.research => '资料调研',
        NoteCategory.idea => '灵感',
        NoteCategory.decision => '决策',
        NoteCategory.issue => '问题',
        NoteCategory.misc => '其他',
      };
}

// --- Category filter row ---
class _NoteCategoryFilterRow extends StatelessWidget {
  const _NoteCategoryFilterRow({
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  final NoteCategory? selectedCategory;
  final ValueChanged<NoteCategory?> onCategorySelected;

  static const _categoryColors = <NoteCategory, Color>{
    NoteCategory.plot: Color(0xFF8E9E7A),
    NoteCategory.character: Color(0xFF7A8E9E),
    NoteCategory.worldbuilding: Color(0xFF9E8E7A),
    NoteCategory.research: Color(0xFF9E7A8E),
    NoteCategory.idea: Color(0xFF8E7A9E),
    NoteCategory.decision: Color(0xFF7A9E8E),
    NoteCategory.issue: Color(0xFF9E7A7A),
    NoteCategory.misc: MorandiColors.mist,
  };

  static const _categoryLabels = <NoteCategory, String>{
    NoteCategory.plot: '情节',
    NoteCategory.character: '角色相关',
    NoteCategory.worldbuilding: '世界观',
    NoteCategory.research: '资料调研',
    NoteCategory.idea: '灵感',
    NoteCategory.decision: '决策',
    NoteCategory.issue: '问题',
    NoteCategory.misc: '其他',
  };

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: <Widget>[
              _NoteFilterChip(
                label: '全部',
                isSelected: selectedCategory == null,
                color: MorandiColors.sage,
                onTap: () => onCategorySelected(null),
              ),
              const SizedBox(width: 6),
              ...NoteCategory.values.map((cat) => Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: _NoteFilterChip(
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

class _NoteFilterChip extends StatelessWidget {
  const _NoteFilterChip({
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

class _NoteCard extends StatelessWidget {
  const _NoteCard({required this.note, required this.onEdit});

  final Note note;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) => Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(NoteListWidget.cardRadius),
          side: BorderSide(color: MorandiColors.mist),
        ),
        color: Colors.white,
        margin: EdgeInsets.zero,
        child: InkWell(
          borderRadius: BorderRadius.circular(NoteListWidget.cardRadius),
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.all(NoteListWidget.cardPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        note.title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: MorandiColors.ink,
                        ),
                      ),
                    ),
                    _NoteCategoryBadge(category: note.category),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  NoteListWidget.formatDateTime(note.createdAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: MorandiColors.mist,
                  ),
                ),
                if (note.content.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 8),
                  Text(
                    note.content,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: MorandiColors.clay,
                      height: 1.5,
                    ),
                  ),
                ],
                if (note.tags.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: NoteListWidget.chipSpacing,
                    runSpacing: NoteListWidget.chipRunSpacing,
                    children: note.tags
                        .map((tag) => Chip(
                              label: Text(tag),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                              labelStyle: TextStyle(
                                fontSize: 11,
                                color: MorandiColors.clay,
                              ),
                              backgroundColor:
                                  MorandiColors.clay.withOpacity(0.1),
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
                        minWidth: NoteListWidget.iconButtonSize,
                        minHeight: NoteListWidget.iconButtonSize,
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
                        minWidth: NoteListWidget.iconButtonSize,
                        minHeight: NoteListWidget.iconButtonSize,
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
        content: Text('确定要删除笔记「${note.title}」吗？此操作不可撤销。'),
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
              context.read<KnowledgeBaseBloc>().add(NoteDeleted(note.id));
            },
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }
}

class _NoteCategoryBadge extends StatelessWidget {
  const _NoteCategoryBadge({required this.category});

  final NoteCategory category;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (category) {
      NoteCategory.plot => ('情节', Color(0xFF8E9E7A)),
      NoteCategory.character => ('角色相关', Color(0xFF7A8E9E)),
      NoteCategory.worldbuilding => ('世界观', Color(0xFF9E8E7A)),
      NoteCategory.research => ('资料调研', Color(0xFF9E7A8E)),
      NoteCategory.idea => ('灵感', Color(0xFF8E7A9E)),
      NoteCategory.decision => ('决策', Color(0xFF7A9E8E)),
      NoteCategory.issue => ('问题', Color(0xFF9E7A7A)),
      NoteCategory.misc => ('其他', MorandiColors.mist),
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
