import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/features/workspace/bloc/workspace_state.dart';

class AgentPanel extends StatefulWidget {
  const AgentPanel({
    required this.mode,
    required this.suggestion,
    required this.pendingRevisions,
    required this.selectedChapterId,
    required this.currentContent,
    required this.onGenerateSuggestion,
    required this.onCreateRevision,
    required this.onAcceptRevision,
    required this.onRejectRevision,
    this.suggestionType,
    this.suggestionSummary,
    this.isDark = false,
    this.onCancel,
    this.onSubmitInstruction,
    this.providerName = '',
    this.modelId = '',
    this.isGenerating = false,
    super.key,
  });

  final AgentMode mode;
  final String suggestion;
  final AgentSuggestionType? suggestionType;
  final String? suggestionSummary;
  final List<Revision> pendingRevisions;
  final String selectedChapterId;
  final String currentContent;
  final VoidCallback onGenerateSuggestion;
  final VoidCallback onCreateRevision;
  final ValueChanged<String> onAcceptRevision;
  final ValueChanged<String> onRejectRevision;
  final bool isDark;
  final VoidCallback? onCancel;
  final ValueChanged<String>? onSubmitInstruction;
  final String providerName;
  final String modelId;
  final bool isGenerating;

  @override
  State<AgentPanel> createState() => _AgentPanelState();
}

class _AgentPanelState extends State<AgentPanel> {
  int _selectedTab = 0;
  static const _tabs = ['推荐', '洞察', '风险', '灵感'];
  final _instructionController = TextEditingController();

  @override
  void dispose() {
    _instructionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final surface3 = isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3;
    final faint = isDark ? MorandiColors.darkFaint : MorandiColors.faint;
    final danger = isDark ? MorandiColors.darkDanger : MorandiColors.danger;
    final orange = isDark ? MorandiColors.darkOrange : MorandiColors.orange;

    final chapterRevisions = widget.pendingRevisions
        .where((r) =>
            r.chapterId == widget.selectedChapterId &&
            r.status == RevisionStatus.pending)
        .toList();

    return Container(
      width: AppSpacing.agentWidth,
      decoration: BoxDecoration(
        color: surface,
        border: Border(left: BorderSide(color: line)),
      ),
      child: Column(
        children: [
          _buildHeader(text, muted, green),
          _buildModelCard(surface2, muted, text, green, surface3, orange),
          const SizedBox(height: 10),
          _buildModeCard(green, green2, surface),
          const SizedBox(height: 10),
          _buildTabs(green, green2, muted, text),
          const SizedBox(height: 10),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSuggestionCard(text, muted, green, surface2, line),
                  const SizedBox(height: AppSpacing.xxxx),
                  if (chapterRevisions.isNotEmpty) ...[
                    Text('待审核修订：${chapterRevisions.length}', style: AppTypography.small(color: text, weight: AppTypography.weightBold)),
                    const SizedBox(height: 8),
                    ...chapterRevisions.map((r) => _buildRevisionItem(r, text, muted, green, surface2, line, danger)),
                  ],
                ],
              ),
            ),
          ),
          _buildInputArea(line, muted, text, surface2, faint, green),
        ],
      ),
    );
  }

  Widget _buildHeader(Color text, Color muted, Color green) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding, vertical: AppSpacing.xl),
      child: Row(
        children: [
          Text('Agent', style: AppTypography.title(color: text, weight: AppTypography.weightBold)),
          const SizedBox(width: 8),
          Container(
            width: 8, height: 8,
            decoration: BoxDecoration(color: green, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text('在线', style: AppTypography.caption(color: green)),
          const Spacer(),
          if (widget.onCancel != null)
            SizedBox(
              width: AppSpacing.iconButtonSize,
              height: AppSpacing.iconButtonSize,
              child: IconButton(
                icon: Icon(LucideIcons.square, size: AppSpacing.iconSmall),
                color: muted,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: widget.onCancel,
                tooltip: '停止生成',
              ),
            ),
          SizedBox(
            width: AppSpacing.iconButtonSize,
            height: AppSpacing.iconButtonSize,
            child: IconButton(
              icon: Icon(LucideIcons.helpCircle, size: AppSpacing.iconMedium),
              color: muted,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: () {},
              tooltip: '帮助',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModelCard(Color surface2, Color muted, Color text, Color green, Color surface3, Color orange) {
    final displayName = widget.providerName.isNotEmpty
        ? widget.providerName
        : '未配置模型';
    final displayModel = widget.modelId.isNotEmpty
        ? widget.modelId
        : '请前往设置页配置';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: surface2,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(displayName, style: AppTypography.small(color: text, weight: AppTypography.weightBold)),
                const Spacer(),
                if (widget.isGenerating)
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: green,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(displayModel, style: AppTypography.caption(color: muted), overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            Row(
              children: [
                Text('上下文', style: AppTypography.caption(color: muted)),
                const SizedBox(width: 8),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                    child: SizedBox(
                      height: 4,
                      child: LinearProgressIndicator(
                        value: 0.35,
                        backgroundColor: surface3,
                        valueColor: AlwaysStoppedAnimation(green),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Text('35%', style: AppTypography.caption(color: muted)),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Text('输出', style: AppTypography.caption(color: muted)),
                const SizedBox(width: 20),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                    child: SizedBox(
                      height: 4,
                      child: LinearProgressIndicator(
                        value: 0.12,
                        backgroundColor: surface3,
                        valueColor: AlwaysStoppedAnimation(orange),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Text('12%', style: AppTypography.caption(color: muted)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeCard(Color green, Color green2, Color surface) {
    final modeLabels = {
      AgentMode.brainstorm: '构思',
      AgentMode.writing: '写作',
      AgentMode.revision: '修订',
      AgentMode.knowledge: '资料',
      AgentMode.review: '检查',
    };

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: green2,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          children: [
            Icon(LucideIcons.sparkles, size: AppSpacing.iconMedium, color: green),
            const SizedBox(width: 8),
            Text('当前模式', style: AppTypography.caption(color: green)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
              ),
              child: Text(
                modeLabels[widget.mode] ?? widget.mode.name,
                style: AppTypography.caption(color: green, weight: AppTypography.weightBold),
              ),
            ),
            const Spacer(),
            Icon(LucideIcons.chevronDown, size: AppSpacing.iconSmall, color: green),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs(Color green, Color green2, Color muted, Color text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding),
      child: Row(
        children: List.generate(_tabs.length, (i) {
          final isSelected = i == _selectedTab;
          return Padding(
            padding: const EdgeInsets.only(right: 4),
            child: Material(
              color: isSelected ? green2 : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.sm),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.sm),
                onTap: () => setState(() => _selectedTab = i),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Text(
                    _tabs[i],
                    style: AppTypography.small(
                      color: isSelected ? green : muted,
                      weight: isSelected ? AppTypography.weightBold : AppTypography.weightRegular,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildSuggestionCard(Color text, Color muted, Color green, Color surface2, Color line) {
    if (widget.suggestion.trim().isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FilledButton(
            onPressed: widget.onGenerateSuggestion,
            style: FilledButton.styleFrom(
              backgroundColor: green,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
            ),
            child: Text('生成建议', style: AppTypography.small(color: Colors.white, weight: AppTypography.weightBold)),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 建议类型标签
        if (widget.suggestionType != null) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
            ),
            child: Text(
              widget.suggestionType!._label,
              style: AppTypography.caption(color: green, weight: AppTypography.weightBold),
            ),
          ),
          const SizedBox(height: 6),
        ],
        // 建议摘要
        if (widget.suggestionSummary != null) ...[
          Text(
            widget.suggestionSummary!,
            style: AppTypography.small(color: muted),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
        ],
        // 建议正文
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: surface2,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: line),
          ),
          child: Text(widget.suggestion, style: AppTypography.small(color: text)),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            FilledButton(
              onPressed: widget.onCreateRevision,
              style: FilledButton.styleFrom(
                backgroundColor: green,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
              ),
              child: Text('创建修订', style: AppTypography.small(color: Colors.white, weight: AppTypography.weightBold)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRevisionItem(Revision revision, Color text, Color muted, Color green, Color surface2, Color line, Color danger) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: surface2,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(revision.patch.metadata.summary, style: AppTypography.small(color: text)),
          const SizedBox(height: 6),
          Row(
            children: [
              TextButton(
                onPressed: () => widget.onAcceptRevision(revision.id),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  minimumSize: Size.zero,
                ),
                child: Text('接受', style: AppTypography.caption(color: green, weight: AppTypography.weightBold)),
              ),
              TextButton(
                onPressed: () => widget.onRejectRevision(revision.id),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  minimumSize: Size.zero,
                ),
                child: Text('拒绝', style: AppTypography.caption(color: danger, weight: AppTypography.weightBold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea(Color line, Color muted, Color text, Color surface2, Color faint, Color green) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.agentPadding, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: line)),
      ),
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 36,
              child: TextField(
                controller: _instructionController,
                style: AppTypography.small(color: text),
                decoration: InputDecoration(
                  hintText: '输入指令...',
                  hintStyle: AppTypography.small(color: faint),
                  filled: true,
                  fillColor: surface2,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (_) => _submitInstruction(),
              ),
            ),
          ),
          const SizedBox(width: 6),
          SizedBox(
            width: 36,
            height: 36,
            child: Material(
              color: green,
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.md),
                onTap: _submitInstruction,
                child: Icon(LucideIcons.send, size: 16, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _submitInstruction() {
    final instruction = _instructionController.text.trim();
    if (instruction.isEmpty) {
      widget.onGenerateSuggestion();
    } else {
      widget.onSubmitInstruction?.call(instruction);
      _instructionController.clear();
    }
  }
}

extension _AgentSuggestionTypeLabel on AgentSuggestionType {
  String get _label => switch (this) {
        AgentSuggestionType.continueWrite => '续写',
        AgentSuggestionType.write => '写作',
        AgentSuggestionType.rewrite => '改写',
        AgentSuggestionType.expand => '扩写',
        AgentSuggestionType.condense => '缩写',
        AgentSuggestionType.polish => '润色',
      };
}
