import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';

String _formatTokens(int? n) {
  if (n == null) {
    return '-';
  }
  if (n >= 1000) {
    final k = n / 1000;
    return k == k.toInt() ? '${k.toInt()}K' : '${k.toStringAsFixed(1)}K';
  }
  return n.toString();
}

class ModelListBlock extends StatelessWidget {
  const ModelListBlock({
    required this.provider,
    required this.onRefresh,
    required this.onSelectModel,
    required this.onTemperatureChanged,
    super.key,
  });

  final LlmProvider provider;
  final VoidCallback onRefresh;
  final ValueChanged<String> onSelectModel;
  final void Function(String modelId, double? temperature)
      onTemperatureChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final models = provider.cachedModels;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Text(
              '模型列表',
              style: AppTypography.title(color: text, weight: FontWeight.w700),
            ),
            const Spacer(),
            TextButton.icon(
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh, size: AppSpacing.iconSmall),
              label: const Text('刷新模型'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        if (models.isEmpty)
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: line),
              borderRadius: BorderRadius.circular(AppRadius.tabTop),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xxxl),
              child: Text(
                '暂无模型数据。点击"刷新模型"从服务商拉取。',
                style: AppTypography.body(color: text),
              ),
            ),
          )
        else
          DecoratedBox(
            decoration: BoxDecoration(
              border: Border.all(color: line),
              borderRadius: BorderRadius.circular(AppRadius.tabTop),
            ),
            child: Column(
              children: <Widget>[
                _HeaderStrip(),
                for (final model in models)
                  _ModelRow(
                    model: model,
                    isSelected: model.modelId == provider.selectedModelId,
                    providerTemperature: provider.temperature,
                    onSelect: () => onSelectModel(model.modelId),
                    onTemperatureChanged: (double? t) =>
                        onTemperatureChanged(model.modelId, t),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}

class _HeaderStrip extends StatelessWidget {
  const _HeaderStrip();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;

    final labelStyle = AppTypography.small(color: text, weight: FontWeight.w700);

    return Container(
      decoration: BoxDecoration(
        color: surface2,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(AppRadius.tabTop),
          topRight: Radius.circular(AppRadius.tabTop),
        ),
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.lg,
      ),
      child: Row(
        children: <Widget>[
          const SizedBox(width: 40),
          Expanded(flex: 2, child: Text('模型名称', style: labelStyle)),
          Expanded(flex: 2, child: Text('模型 ID', style: labelStyle)),
          Expanded(child: Text('上下文', style: labelStyle)),
          Expanded(child: Text('最大输出', style: labelStyle)),
          SizedBox(width: 60, child: Text('流式', style: labelStyle)),
          SizedBox(width: 140, child: Text('温度', style: labelStyle)),
        ],
      ),
    );
  }
}

class _ModelRow extends StatelessWidget {
  const _ModelRow({
    required this.model,
    required this.isSelected,
    required this.providerTemperature,
    required this.onSelect,
    required this.onTemperatureChanged,
  });

  final LlmModel model;
  final bool isSelected;
  final double providerTemperature;
  final VoidCallback onSelect;
  final ValueChanged<double?> onTemperatureChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final effectiveTemperature =
        model.temperature ?? providerTemperature;

    return InkWell(
      onTap: onSelect,
      child: Container(
        color: isSelected ? surface : null,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.lg,
        ),
        child: Row(
          children: <Widget>[
            SizedBox(
              width: 40,
              child: _RadioDot(isSelected: isSelected, onTap: onSelect),
            ),
            Expanded(
              flex: 2,
              child: Text(
                model.name,
                style: AppTypography.body(
                  color: text,
                  weight: FontWeight.w600,
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                model.modelId,
                style: AppTypography.body(color: text),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Expanded(
              child: Text(
                _formatTokens(model.contextLength),
                style: AppTypography.body(color: text),
              ),
            ),
            Expanded(
              child: Text(
                _formatTokens(model.maxOutput),
                style: AppTypography.body(color: text),
              ),
            ),
            SizedBox(
              width: 60,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: model.supportsStreaming ? green : muted,
                ),
              ),
            ),
            SizedBox(
              width: 140,
              child: TextFormField(
                initialValue: effectiveTemperature.toStringAsFixed(2),
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  border: const OutlineInputBorder(),
                  hintText: providerTemperature.toStringAsFixed(2),
                ),
                onChanged: (String v) {
                  if (v.isEmpty) {
                    onTemperatureChanged(null);
                    return;
                  }
                  final parsed = double.tryParse(v);
                  if (parsed != null && parsed >= 0.0 && parsed <= 2.0) {
                    onTemperatureChanged(parsed);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RadioDot extends StatelessWidget {
  const _RadioDot({required this.isSelected, required this.onTap});

  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 16,
        height: 16,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: green, width: 2),
          color: isSelected ? green : null,
        ),
      ),
    );
  }
}
