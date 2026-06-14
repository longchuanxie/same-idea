import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/widgets/app_modal.dart';
import 'package:novel_creator/domain/entities/revision.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';

/// 修订追踪页面，对齐原型 revision-tracking.html
class RevisionPage extends StatelessWidget {
  const RevisionPage({
    required this.revisions,
    this.onAcceptAll,
    this.onRejectAll,
    this.onAcceptRevision,
    this.onRejectRevision,
    this.isDark = false,
    super.key,
  });

  final List<Revision> revisions;
  final VoidCallback? onAcceptAll;
  final VoidCallback? onRejectAll;
  final ValueChanged<String>? onAcceptRevision;
  final ValueChanged<String>? onRejectRevision;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final danger = isDark ? MorandiColors.darkDanger : MorandiColors.danger;
    final orange = isDark ? MorandiColors.darkOrange : MorandiColors.orange;

    final pendingRevisions = revisions.where((r) => r.status == RevisionStatus.pending).toList();
    final acceptedRevisions = revisions.where((r) => r.status == RevisionStatus.accepted).toList();
    final rejectedRevisions = revisions.where((r) => r.status == RevisionStatus.rejected).toList();

    if (revisions.isEmpty) {
      return Container(
        color: bg,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.gitCompare, size: 48, color: muted),
              const SizedBox(height: AppSpacing.xl),
              Text('暂无修订记录', style: AppTypography.body(color: muted)),
            ],
          ),
        ),
      );
    }

    final progressPercent = revisions.isEmpty ? 0.0 : acceptedRevisions.length / revisions.length;

    return Container(
      color: bg,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.workspacePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 修订摘要卡
            Container(
              padding: const EdgeInsets.all(AppSpacing.cardPadding),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: line),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('修订追踪', style: AppTypography.headline(color: text)),
                  const SizedBox(height: AppSpacing.lg),
                  // 指标网格
                  Wrap(
                    spacing: AppSpacing.lg,
                    runSpacing: AppSpacing.lg,
                    children: [
                      _MetricItem(label: '修改建议', value: '${revisions.length}', color: text),
                      _MetricItem(label: '已接受', value: '${acceptedRevisions.length}', color: green),
                      _MetricItem(label: '待处理', value: '${pendingRevisions.length}', color: orange),
                      _MetricItem(label: '已拒绝', value: '${rejectedRevisions.length}', color: danger),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  // 进度条
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.pill.toDouble()),
                    child: SizedBox(
                      height: AppSpacing.sm,
                      child: LinearProgressIndicator(
                        value: progressPercent.clamp(0.0, 1.0),
                        backgroundColor: isDark ? MorandiColors.darkSurface3 : MorandiColors.surface3,
                        valueColor: AlwaysStoppedAnimation(green),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text('${(progressPercent * 100).round()}% 已处理', style: AppTypography.caption(color: muted)),
                  const SizedBox(height: AppSpacing.lg),
                  // 操作按钮
                  Row(
                    children: [
                      FilledButton(
                        onPressed: () async {
                          final confirmed = await AppModal.confirm(
                            context: context,
                            title: '接受全部修订',
                            message: '确定接受所有待审核的修订吗？此操作将应用所有修改建议。',
                            confirmLabel: '接受全部',
                          );
                          if (confirmed) onAcceptAll?.call();
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: green,
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxl, vertical: AppSpacing.md),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                        ),
                        child: Text('接受全部', style: AppTypography.small(color: Colors.white, weight: AppTypography.weightBold)),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      OutlinedButton(
                        onPressed: () async {
                          final confirmed = await AppModal.confirm(
                            context: context,
                            title: '拒绝全部修订',
                            message: '确定拒绝所有待审核的修订吗？此操作不可撤销。',
                            confirmLabel: '拒绝全部',
                            isDanger: true,
                          );
                          if (confirmed) onRejectAll?.call();
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxl, vertical: AppSpacing.md),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                        ),
                        child: Text('拒绝全部', style: AppTypography.small(color: muted)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xxxx),
            // 修订列表
            Text('待审核修订', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
            const SizedBox(height: AppSpacing.lg),
            ...pendingRevisions.map((r) => _RevisionCard(
              revision: r,
              green: green,
              green2: green2,
              surface: surface,
              line: line,
              text: text,
              muted: muted,
              danger: danger,
              orange: orange,
              onAccept: onAcceptRevision,
              onReject: onRejectRevision,
            )),
            if (acceptedRevisions.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.xxxx),
              Text('已接受修订', style: AppTypography.cardTitle(color: text, weight: AppTypography.weightBold)),
              const SizedBox(height: AppSpacing.lg),
              ...acceptedRevisions.map((r) => _RevisionCard(
                revision: r,
                green: green,
                green2: green2,
                surface: surface,
                line: line,
                text: text,
                muted: muted,
                danger: danger,
                orange: orange,
                onAccept: onAcceptRevision,
                onReject: onRejectRevision,
              )),
            ],
          ],
        ),
      ),
    );
  }
}

class _MetricItem extends StatelessWidget {
  const _MetricItem({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 120,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: AppTypography.title(color: color, weight: AppTypography.weightBold)),
          const SizedBox(height: 2),
          Text(label, style: AppTypography.caption(color: color)),
        ],
      ),
    );
  }
}

class _RevisionCard extends StatelessWidget {
  const _RevisionCard({
    required this.revision,
    required this.green,
    required this.green2,
    required this.surface,
    required this.line,
    required this.text,
    required this.muted,
    required this.danger,
    required this.orange,
    this.onAccept,
    this.onReject,
  });

  final Revision revision;
  final Color green;
  final Color green2;
  final Color surface;
  final Color line;
  final Color text;
  final Color muted;
  final Color danger;
  final Color orange;
  final ValueChanged<String>? onAccept;
  final ValueChanged<String>? onReject;

  @override
  Widget build(BuildContext context) {
    final isPending = revision.status == RevisionStatus.pending;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.cardPadding),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.gitCommit, size: AppSpacing.iconSmall, color: isPending ? orange : green),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  revision.patch.metadata.summary,
                  style: AppTypography.small(color: text, weight: AppTypography.weightBold),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '操作：${revision.patch.operation.name} | 来源：${revision.patch.source.name}',
            style: AppTypography.caption(color: muted),
          ),
          if (revision.patch.beforeText.isNotEmpty || revision.patch.afterText.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: green2,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (revision.patch.beforeText.isNotEmpty)
                    Text('原文：${revision.patch.beforeText}', style: AppTypography.caption(color: muted), maxLines: 2, overflow: TextOverflow.ellipsis),
                  if (revision.patch.afterText.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text('建议：${revision.patch.afterText}', style: AppTypography.caption(color: green), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ],
              ),
            ),
          ],
          if (isPending) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                TextButton(
                  onPressed: () => onAccept?.call(revision.id),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
                    minimumSize: Size.zero,
                  ),
                  child: Text('接受', style: AppTypography.caption(color: green, weight: AppTypography.weightBold)),
                ),
                TextButton(
                  onPressed: () => onReject?.call(revision.id),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
                    minimumSize: Size.zero,
                  ),
                  child: Text('拒绝', style: AppTypography.caption(color: danger, weight: AppTypography.weightBold)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
