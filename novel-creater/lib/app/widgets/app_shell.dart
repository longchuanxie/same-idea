import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/widgets/mac_bar.dart';
import 'package:novel_creator/app/widgets/status_bar.dart';

/// 应用壳：MacBar + 三栏布局 + StatusBar。
///
/// 对齐原型 .browser-shell 整体结构：
/// - 顶部 MacBar（交通灯 + 标签页 + 工具栏）
/// - 中间三栏 Grid（sidebar + workspace + agent-panel）
/// - 底部 StatusBar
class AppShell extends StatelessWidget {
  const AppShell({
    required this.saveStatusLabel,
    required this.sidebar,
    required this.workspace,
    required this.agentPanel,
    required this.wordCount,
    required this.revisionCount,
    this.isDark = false,
    this.showAgentPanel = true,
    this.onToggleAgentPanel,
    super.key,
  });

  final String saveStatusLabel;
  final Widget sidebar;
  final Widget workspace;
  final Widget agentPanel;
  final int wordCount;
  final int revisionCount;
  final bool isDark;
  final bool showAgentPanel;
  final VoidCallback? onToggleAgentPanel;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;

    return Container(
      color: bg,
      child: Column(
        children: [
          MacBar(
            saveStatusLabel: saveStatusLabel,
            onBack: () => Navigator.of(context).pop(),
            isDark: isDark,
            onToggleAgentPanel: onToggleAgentPanel,
            showAgentPanel: showAgentPanel,
          ),
          Expanded(
            child: Row(
              children: [
                // 左栏：侧边栏
                sidebar,
                // 中栏：工作区
                Expanded(child: workspace),
                // 右栏：Agent 面板（动画折叠）
                AnimatedSize(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeInOut,
                  alignment: Alignment.centerRight,
                  child: showAgentPanel
                      ? agentPanel
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
          StatusBar(
            wordCount: wordCount,
            revisionCount: revisionCount,
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}
