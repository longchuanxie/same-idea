import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/features/settings/bloc/connection_test_status.dart';

class ProviderTable extends StatelessWidget {
  const ProviderTable({
    required this.providers,
    required this.testStatus,
    required this.onSelect,
    required this.onAdd,
    required this.onTest,
    required this.onRemove,
    this.activeProviderId,
    this.testingProviderId,
    super.key,
  });

  final List<LlmProvider> providers;
  final String? activeProviderId;
  final ConnectionTestStatus testStatus;
  final String? testingProviderId;
  final ValueChanged<String> onSelect;
  final VoidCallback onAdd;
  final ValueChanged<String> onTest;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Text(
                '服务商管理',
                style: AppTypography.title(color: text, weight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add, size: 18),
              label: const Text('添加'),
            ),
          ],
        ),
        if (providers.isNotEmpty) ...<Widget>[
          const SizedBox(height: AppSpacing.xxxl),
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: line),
              borderRadius: BorderRadius.circular(AppRadius.tabTop),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                const _HeaderRow(),
                for (final provider in providers)
                  _BodyRow(
                    provider: provider,
                    isActive: provider.id == activeProviderId,
                    isTesting: testingProviderId == provider.id &&
                        testStatus == ConnectionTestStatus.testing,
                    onSelect: onSelect,
                    onTest: onTest,
                    onRemove: onRemove,
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _HeaderRow extends StatelessWidget {
  const _HeaderRow();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;

    final style = AppTypography.small(color: text, weight: FontWeight.w700);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: surface2,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(AppRadius.tabTop),
          topRight: Radius.circular(AppRadius.tabTop),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.lg,
        ),
        child: Row(
          children: <Widget>[
            Expanded(flex: 2, child: Text('服务商', style: style)),
            Expanded(flex: 3, child: Text('基础地址', style: style)),
            Expanded(flex: 2, child: Text('API Key', style: style)),
            Expanded(child: Text('状态', style: style)),
            SizedBox(width: 100, child: Text('操作', style: style)),
          ],
        ),
      ),
    );
  }
}

class _BodyRow extends StatelessWidget {
  const _BodyRow({
    required this.provider,
    required this.isActive,
    required this.isTesting,
    required this.onSelect,
    required this.onTest,
    required this.onRemove,
  });

  final LlmProvider provider;
  final bool isActive;
  final bool isTesting;
  final ValueChanged<String> onSelect;
  final ValueChanged<String> onTest;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;

    return Material(
      color: isActive ? surface : Colors.transparent,
      child: InkWell(
        onTap: () => onSelect(provider.id),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.lg,
          ),
          child: Row(
            children: <Widget>[
              Expanded(
                flex: 2,
                child: Text(
                  provider.name,
                  style: AppTypography.body(
                    color: text,
                    weight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 3,
                child: Text(
                  provider.baseUrl,
                  style: AppTypography.body(color: text),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  '••••••••••••••••',
                  style: AppTypography.body(color: text),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                child: _StatusBadge(status: provider.status),
              ),
              SizedBox(
                width: 100,
                child: Row(
                  children: <Widget>[
                    _IconAction(
                      icon: Icons.refresh,
                      tooltip: '测试连接',
                      isBusy: isTesting,
                      onTap: () => onTest(provider.id),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    _IconAction(
                      icon: Icons.delete_outline,
                      tooltip: '删除',
                      onTap: () => onRemove(provider.id),
                    ),
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

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final ProviderStatus status;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final orange = isDark ? MorandiColors.darkOrange : MorandiColors.orange;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    final (Color color, String label) = switch (status) {
      ProviderStatus.connected => (green, '已连接'),
      ProviderStatus.error => (orange, '错误'),
      ProviderStatus.pendingConfig => (muted, '待配置'),
      ProviderStatus.local => (muted, '本地'),
    };
    return Row(
      children: <Widget>[
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Flexible(
          child: Text(
            label,
            style: AppTypography.caption(color: text),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _IconAction extends StatelessWidget {
  const _IconAction({
    required this.icon,
    required this.tooltip,
    required this.onTap,
    this.isBusy = false,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  final bool isBusy;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;

    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.sm),
        child: SizedBox(
          width: AppSpacing.iconButtonSize,
          height: AppSpacing.iconButtonSize,
          child: Center(
            child: isBusy
                ? SizedBox(
                      width: AppSpacing.xl + 2,
                      height: AppSpacing.xl + 2,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: text,
                      ),
                    )
                : Icon(icon, size: AppSpacing.iconMedium, color: text),
          ),
        ),
      ),
    );
  }
}
