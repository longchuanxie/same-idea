import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/enums/character_role.dart';
import 'package:novel_creator/domain/value_objects/character_relationship.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';

class CharacterListWidget extends StatefulWidget {
  const CharacterListWidget({super.key, required this.projectId});

  final String projectId;

  static const badgeFontSize = 11.0;
  static const badgePaddingH = 8.0;
  static const badgePaddingV = 4.0;

  @override
  State<CharacterListWidget> createState() => _CharacterListWidgetState();
}

class _CharacterListWidgetState extends State<CharacterListWidget> {
  static const _listItemSpacing = 4.0;
  static const _listWidth = 280.0;

  String? _selectedCharacterId;

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<KnowledgeBaseBloc, KnowledgeBaseState>(
        buildWhen: (prev, curr) =>
            prev.characters != curr.characters ||
            prev.error != curr.error,
        builder: (context, state) {
          final characters = state.characters;

          if (characters.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Icon(
                    Icons.person_outline,
                    size: 56,
                    color: MorandiColors.mist,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '暂无角色',
                    style: TextStyle(
                      fontSize: 16,
                      color: MorandiColors.clay,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '点击右下角按钮创建新角色',
                    style: TextStyle(
                      fontSize: 13,
                      color: MorandiColors.sage,
                    ),
                  ),
                ],
              ),
            );
          }

          // Ensure selected character still exists
          final selectedCharacter = _selectedCharacterId != null
              ? characters.where((c) => c.id == _selectedCharacterId).firstOrNull
              : null;
          if (_selectedCharacterId != null && selectedCharacter == null) {
            _selectedCharacterId = null;
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              // LEFT: character list
              SizedBox(
                width: _listWidth,
                child: Column(
                  children: <Widget>[
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: characters.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: _listItemSpacing),
                        itemBuilder: (context, index) {
                          final character = characters[index];
                          final isSelected =
                              character.id == _selectedCharacterId;
                          return _CharacterListItem(
                            character: character,
                            isSelected: isSelected,
                            onTap: () {
                              setState(() {
                                _selectedCharacterId = character.id;
                              });
                            },
                          );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              _showCharacterDialog(context, null),
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('新建角色'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: MorandiColors.sage,
                            side: BorderSide(color: MorandiColors.mist),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Divider
              VerticalDivider(width: 1, thickness: 1, color: MorandiColors.mist),
              // RIGHT: detail card
              Expanded(
                child: selectedCharacter != null
                    ? _CharacterDetailCard(
                        character: selectedCharacter,
                        characters: characters,
                        onEdit: () =>
                            _showCharacterDialog(context, selectedCharacter),
                        onDelete: () =>
                            _confirmDelete(context, selectedCharacter),
                      )
                    : Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Icon(
                              Icons.touch_app_outlined,
                              size: 48,
                              color: MorandiColors.mist,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              '选择一个角色查看详情',
                              style: TextStyle(
                                fontSize: 14,
                                color: MorandiColors.clay,
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ],
          );
        },
      );

  Future<void> _showCharacterDialog(
    BuildContext context,
    Character? character,
  ) async {
    final nameController = TextEditingController(text: character?.name ?? '');
    final descriptionController =
        TextEditingController(text: character?.description ?? '');
    final backgroundController =
        TextEditingController(text: character?.background ?? '');
    final aliasesController = TextEditingController(
      text: character?.aliases.join(', ') ?? '',
    );
    final appearanceController =
        TextEditingController(text: character?.appearance ?? '');
    final personalityController =
        TextEditingController(text: character?.personality ?? '');
    final goalsController =
        TextEditingController(text: character?.goals ?? '');
    final conflictsController =
        TextEditingController(text: character?.conflicts ?? '');
    final secretsController =
        TextEditingController(text: character?.secrets ?? '');
    CharacterRole selectedRole = character?.role ?? CharacterRole.supporting;

    final result = await showDialog<Character>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(character == null ? '新建角色' : '编辑角色'),
        content: SingleChildScrollView(
          child: SizedBox(
            width: 480,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: '名称',
                    border: OutlineInputBorder(),
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<CharacterRole>(
                  value: selectedRole,
                  decoration: const InputDecoration(
                    labelText: '角色类型',
                    border: OutlineInputBorder(),
                  ),
                  items: CharacterRole.values.map((role) {
                    return DropdownMenuItem<CharacterRole>(
                      value: role,
                      child: Text(_roleLabel(role)),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) selectedRole = value;
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: aliasesController,
                  decoration: const InputDecoration(
                    labelText: '别名（逗号分隔）',
                    border: OutlineInputBorder(),
                    hintText: '外号, 化名, 称号',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    labelText: '描述',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: appearanceController,
                  decoration: const InputDecoration(
                    labelText: '外貌',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: personalityController,
                  decoration: const InputDecoration(
                    labelText: '性格',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: backgroundController,
                  decoration: const InputDecoration(
                    labelText: '背景',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: goalsController,
                  decoration: const InputDecoration(
                    labelText: '目标',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: conflictsController,
                  decoration: const InputDecoration(
                    labelText: '冲突',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: secretsController,
                  decoration: const InputDecoration(
                    labelText: '秘密',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
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
              if (nameController.text.trim().isEmpty) return;
              final now = DateTime.now().toUtc();
              Navigator.of(dialogContext).pop(
                Character(
                  id: character?.id ?? IdGenerator.create('character'),
                  projectId: widget.projectId,
                  name: nameController.text.trim(),
                  description: descriptionController.text.trim(),
                  role: selectedRole,
                  background: backgroundController.text.trim(),
                  aliases: _parseList(aliasesController.text),
                  appearance: appearanceController.text.trim(),
                  personality: personalityController.text.trim(),
                  goals: goalsController.text.trim(),
                  conflicts: conflictsController.text.trim(),
                  secrets: secretsController.text.trim(),
                  relationships: character?.relationships ?? const [],
                  consistencyFacts: character?.consistencyFacts ?? const [],
                  traits: character?.traits ?? const {},
                  createdAt: character?.createdAt ?? now,
                  updatedAt: now,
                ),
              );
            },
            child: Text(character == null ? '创建' : '保存'),
          ),
        ],
      ),
    );

    if (!context.mounted || result == null) return;

    if (character == null) {
      context.read<KnowledgeBaseBloc>().add(CharacterCreated(result));
      setState(() {
        _selectedCharacterId = result.id;
      });
    } else {
      context.read<KnowledgeBaseBloc>().add(CharacterUpdated(result));
    }
  }

  List<String> _parseList(String text) {
    if (text.trim().isEmpty) return <String>[];
    return text
        .split(',')
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty)
        .toList();
  }

  void _confirmDelete(BuildContext context, Character character) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定要删除角色「${character.name}」吗？此操作不可撤销。'),
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
              context
                  .read<KnowledgeBaseBloc>()
                  .add(CharacterDeleted(character.id));
              setState(() {
                _selectedCharacterId = null;
              });
            },
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }

  String _roleLabel(CharacterRole role) => switch (role) {
        CharacterRole.protagonist => '主角',
        CharacterRole.antagonist => '反派',
        CharacterRole.supporting => '配角',
        CharacterRole.minor => '龙套',
      };
}

// --- Left panel list item ---
class _CharacterListItem extends StatelessWidget {
  const _CharacterListItem({
    required this.character,
    required this.isSelected,
    required this.onTap,
  });

  final Character character;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bgColor = isSelected
        ? MorandiColors.sage.withOpacity(0.12)
        : Colors.white;
    final borderColor =
        isSelected ? MorandiColors.sage : MorandiColors.mist;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: borderColor, width: isSelected ? 1.5 : 1),
      ),
      color: bgColor,
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Flexible(
                          child: Text(
                            character.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: MorandiColors.ink,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        _RoleBadge(role: character.role),
                      ],
                    ),
                    if (character.description.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 4),
                      Text(
                        character.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: MorandiColors.clay,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// --- Right panel detail card ---
class _CharacterDetailCard extends StatelessWidget {
  const _CharacterDetailCard({
    required this.character,
    required this.characters,
    required this.onEdit,
    required this.onDelete,
  });

  final Character character;
  final List<Character> characters;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Header with name, role, edit/delete buttons
            Row(
              children: <Widget>[
                Expanded(
                  child: Row(
                    children: <Widget>[
                      Text(
                        character.name,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: MorandiColors.ink,
                        ),
                      ),
                      const SizedBox(width: 10),
                      _RoleBadge(role: character.role),
                    ],
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.edit_outlined, color: MorandiColors.sage),
                  onPressed: onEdit,
                  tooltip: '编辑',
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline, color: MorandiColors.clay),
                  onPressed: onDelete,
                  tooltip: '删除',
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Aliases
            if (character.aliases.isNotEmpty) ...<Widget>[
              _SectionTitle('别名'),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: character.aliases
                    .map((alias) => Chip(
                          label: Text(alias),
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            color: MorandiColors.sage,
                          ),
                          backgroundColor: MorandiColors.sage.withOpacity(0.1),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 16),
            ],

            // Description
            if (character.description.isNotEmpty) ...<Widget>[
              _SectionTitle('描述'),
              const SizedBox(height: 4),
              _FieldText(character.description),
              const SizedBox(height: 16),
            ],

            // Appearance
            if (character.appearance.isNotEmpty) ...<Widget>[
              _SectionTitle('外貌'),
              const SizedBox(height: 4),
              _FieldText(character.appearance),
              const SizedBox(height: 16),
            ],

            // Personality
            if (character.personality.isNotEmpty) ...<Widget>[
              _SectionTitle('性格'),
              const SizedBox(height: 4),
              _FieldText(character.personality),
              const SizedBox(height: 16),
            ],

            // Background
            if (character.background.isNotEmpty) ...<Widget>[
              _SectionTitle('背景'),
              const SizedBox(height: 4),
              _FieldText(character.background),
              const SizedBox(height: 16),
            ],

            // Goals
            if (character.goals.isNotEmpty) ...<Widget>[
              _SectionTitle('目标'),
              const SizedBox(height: 4),
              _FieldText(character.goals),
              const SizedBox(height: 16),
            ],

            // Conflicts
            if (character.conflicts.isNotEmpty) ...<Widget>[
              _SectionTitle('冲突'),
              const SizedBox(height: 4),
              _FieldText(character.conflicts),
              const SizedBox(height: 16),
            ],

            // Secrets
            if (character.secrets.isNotEmpty) ...<Widget>[
              _SectionTitle('秘密'),
              const SizedBox(height: 4),
              _FieldText(character.secrets),
              const SizedBox(height: 16),
            ],

            // Traits
            if (character.traits.isNotEmpty) ...<Widget>[
              _SectionTitle('特征'),
              const SizedBox(height: 6),
              ...character.traits.entries.map((entry) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.only(top: 7, right: 8),
                          decoration: BoxDecoration(
                            color: MorandiColors.sage,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Text(
                          '${entry.key}: ',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: MorandiColors.ink,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            entry.value,
                            style: TextStyle(
                              fontSize: 13,
                              color: MorandiColors.clay,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 16),
            ],

            // Relationships
            if (character.relationships.isNotEmpty) ...<Widget>[
              _SectionTitle('关系'),
              const SizedBox(height: 6),
              ...character.relationships.map((rel) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _RelationshipRow(
                      relationship: rel,
                      characters: characters,
                    ),
                  )),
              const SizedBox(height: 16),
            ],

            // Consistency Facts
            if (character.consistencyFacts.isNotEmpty) ...<Widget>[
              _SectionTitle('一致性约束'),
              const SizedBox(height: 6),
              ...character.consistencyFacts.map((fact) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          '- ',
                          style: TextStyle(
                            fontSize: 13,
                            color: MorandiColors.clay,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            fact,
                            style: TextStyle(
                              fontSize: 13,
                              color: MorandiColors.clay,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      );
}

class _RelationshipRow extends StatelessWidget {
  const _RelationshipRow({
    required this.relationship,
    required this.characters,
  });

  final CharacterRelationship relationship;
  final List<Character> characters;

  @override
  Widget build(BuildContext context) {
    final targetName = characters
            .where((c) => c.id == relationship.targetCharacterId)
            .firstOrNull
            ?.name ??
        relationship.targetCharacterId;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: MorandiColors.paper,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: <Widget>[
          Icon(Icons.link, size: 14, color: MorandiColors.sage),
          const SizedBox(width: 8),
          Text(
            targetName,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: MorandiColors.ink,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: MorandiColors.clay.withOpacity(0.15),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              relationship.relationType,
              style: TextStyle(
                fontSize: 11,
                color: MorandiColors.clay,
              ),
            ),
          ),
          if (relationship.description.isNotEmpty) ...<Widget>[
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                relationship.description,
                style: TextStyle(
                  fontSize: 12,
                  color: MorandiColors.clay,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) => Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: MorandiColors.sage,
        ),
      );
}

class _FieldText extends StatelessWidget {
  const _FieldText(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          fontSize: 14,
          color: MorandiColors.ink,
          height: 1.6,
        ),
      );
}

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});

  final CharacterRole role;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (role) {
      CharacterRole.protagonist => ('主角', MorandiColors.sage),
      CharacterRole.antagonist => ('反派', Color(0xFFB08A8A)),
      CharacterRole.supporting => ('配角', MorandiColors.clay),
      CharacterRole.minor => ('龙套', MorandiColors.mist),
    };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: CharacterListWidget.badgePaddingH,
        vertical: CharacterListWidget.badgePaddingV,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: CharacterListWidget.badgeFontSize,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}
