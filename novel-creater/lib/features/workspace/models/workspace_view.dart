import 'package:flutter/material.dart';

enum WorkspaceView {
  overview(
    label: '项目概览',
    shortLabel: '概览',
    icon: Icons.home_outlined,
  ),
  outline(
    label: '大纲与资料库',
    shortLabel: '大纲',
    icon: Icons.list_alt_outlined,
  ),
  editor(
    label: '章节编辑',
    shortLabel: '章节',
    icon: Icons.description_outlined,
  ),
  research(
    label: '联网调研',
    shortLabel: '调研',
    icon: Icons.travel_explore_outlined,
  ),
  revision(
    label: '修订审核',
    shortLabel: '修订',
    icon: Icons.rule_outlined,
  ),
  agentTasks(
    label: 'Agent 任务中心',
    shortLabel: '任务',
    icon: Icons.pending_actions_outlined,
  ),
  pendingChanges(
    label: '待确认变更',
    shortLabel: '变更',
    icon: Icons.fact_check_outlined,
  ),
  characters(
    label: '角色库',
    shortLabel: '角色',
    icon: Icons.people_outline,
  ),
  world(
    label: '世界观设定',
    shortLabel: '世界观',
    icon: Icons.public_outlined,
  ),
  notes(
    label: '笔记与素材',
    shortLabel: '笔记',
    icon: Icons.note_outlined,
  ),
  sessions(
    label: '会话与时光机',
    shortLabel: '会话',
    icon: Icons.forum_outlined,
  ),
  export(
    label: '导出向导',
    shortLabel: '导出',
    icon: Icons.upload_file_outlined,
  ),
  backup(
    label: '数据与备份',
    shortLabel: '备份',
    icon: Icons.inventory_2_outlined,
  ),
  settings(
    label: '设置与服务商',
    shortLabel: '设置',
    icon: Icons.settings_outlined,
  );

  const WorkspaceView({
    required this.label,
    required this.shortLabel,
    required this.icon,
  });

  final String label;
  final String shortLabel;
  final IconData icon;
}
