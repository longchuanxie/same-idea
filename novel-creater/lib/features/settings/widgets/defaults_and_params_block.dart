import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';

typedef _ProviderModelPair = ({LlmProvider provider, LlmModel model});

typedef _DecodedKey = ({String? pid, String? mid});

class DefaultsAndParamsBlock extends StatefulWidget {
  const DefaultsAndParamsBlock({
    required this.providers,
    required this.settings,
    required this.onDefaultsChanged,
    required this.onParametersChanged,
    super.key,
  });

  final List<LlmProvider> providers;
  final LlmDefaultSettings settings;
  final ValueChanged<LlmDefaultSettings> onDefaultsChanged;
  final void Function({double? t, double? p, bool? s}) onParametersChanged;

  @override
  State<DefaultsAndParamsBlock> createState() => _DefaultsAndParamsBlockState();
}

class _DefaultsAndParamsBlockState extends State<DefaultsAndParamsBlock> {
  late double _temperature;
  late double _topP;

  @override
  void initState() {
    super.initState();
    _temperature = widget.settings.defaultTemperature;
    _topP = widget.settings.defaultTopP;
  }

  @override
  void didUpdateWidget(covariant DefaultsAndParamsBlock oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.settings.defaultTemperature !=
        widget.settings.defaultTemperature) {
      _temperature = widget.settings.defaultTemperature;
    }
    if (oldWidget.settings.defaultTopP != widget.settings.defaultTopP) {
      _topP = widget.settings.defaultTopP;
    }
  }

  String? _encodeKey(String? pid, String? mid) {
    if (pid == null || mid == null) {
      return null;
    }
    return '$pid::$mid';
  }

  _DecodedKey _decodeKey(String? key) {
    if (key == null) {
      return (pid: null, mid: null);
    }
    final parts = key.split('::');
    if (parts.length != 2) {
      return (pid: null, mid: null);
    }
    return (pid: parts[0], mid: parts[1]);
  }

  List<_ProviderModelPair> _allPairs() {
    final pairs = <_ProviderModelPair>[];
    for (final provider in widget.providers) {
      for (final model in provider.cachedModels) {
        pairs.add((provider: provider, model: model));
      }
    }
    return pairs;
  }

  List<DropdownMenuItem<String?>> _buildItems(
    List<_ProviderModelPair> pairs,
    Color text,
  ) {
    final items = <DropdownMenuItem<String?>>[
      DropdownMenuItem<String?>(
        value: null,
        child: Text(
          '（未选择）',
          style: AppTypography.body(color: text),
        ),
      ),
    ];
    for (final pair in pairs) {
      final key = _encodeKey(pair.provider.id, pair.model.modelId);
      items.add(
        DropdownMenuItem<String?>(
          value: key,
          child: Text(
            '${pair.provider.name} · ${pair.model.name}',
            style: AppTypography.body(color: text),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      );
    }
    return items;
  }

  String? _currentKey(String? pid, String? mid) {
    final encoded = _encodeKey(pid, mid);
    if (encoded == null) {
      return null;
    }
    final pairs = _allPairs();
    for (final pair in pairs) {
      if (pair.provider.id == pid && pair.model.modelId == mid) {
        return encoded;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 720;
        final defaultsCard = _buildDefaultsCard(context, text, line, green);
        final paramsCard = _buildParamsCard(context, text, line, green);
        if (isNarrow) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              defaultsCard,
              const SizedBox(height: AppSpacing.xxxl),
              paramsCard,
            ],
          );
        }
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(child: defaultsCard),
            const SizedBox(width: AppSpacing.xxxl),
            Expanded(child: paramsCard),
          ],
        );
      },
    );
  }

  Widget _buildDefaultsCard(
    BuildContext context,
    Color text,
    Color line,
    Color green,
  ) {
    final pairs = _allPairs();
    final items = _buildItems(pairs, text);
    final settings = widget.settings;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: line),
        borderRadius: BorderRadius.circular(AppRadius.tabTop),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(
              '默认模型',
              style: AppTypography.cardTitle(
                color: text,
                weight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            _buildLabeledDropdown(
              label: '写作模型',
              items: items,
              value: _currentKey(
                settings.writingProviderId,
                settings.writingModelId,
              ),
              onChanged: (value) {
                final decoded = _decodeKey(value);
                widget.onDefaultsChanged(
                  settings.copyWith(
                    writingProviderId: decoded.pid,
                    writingModelId: decoded.mid,
                  ),
                );
              },
              text: text,
            ),
            const SizedBox(height: AppSpacing.xl),
            _buildLabeledDropdown(
              label: '推理模型（可选）',
              items: items,
              value: _currentKey(
                settings.reasoningProviderId,
                settings.reasoningModelId,
              ),
              onChanged: (value) {
                final decoded = _decodeKey(value);
                widget.onDefaultsChanged(
                  settings.copyWith(
                    reasoningProviderId: decoded.pid,
                    reasoningModelId: decoded.mid,
                  ),
                );
              },
              text: text,
            ),
            const SizedBox(height: AppSpacing.xl),
            _buildLabeledDropdown(
              label: '嵌入模型（可选）',
              items: items,
              value: _currentKey(
                settings.embeddingProviderId,
                settings.embeddingModelId,
              ),
              onChanged: (value) {
                final decoded = _decodeKey(value);
                widget.onDefaultsChanged(
                  settings.copyWith(
                    embeddingProviderId: decoded.pid,
                    embeddingModelId: decoded.mid,
                  ),
                );
              },
              text: text,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabeledDropdown({
    required String label,
    required List<DropdownMenuItem<String?>> items,
    required String? value,
    required ValueChanged<String?> onChanged,
    required Color text,
  }) =>
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            label,
            style: AppTypography.small(color: text),
          ),
          const SizedBox(height: AppSpacing.sm),
          DropdownButtonFormField<String?>(
            value: value,
            isExpanded: true,
            items: items,
            onChanged: onChanged,
            decoration: const InputDecoration(
              isDense: true,
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(
                horizontal: AppSpacing.xl,
                vertical: AppSpacing.md,
              ),
            ),
          ),
        ],
      );

  Widget _buildParamsCard(
    BuildContext context,
    Color text,
    Color line,
    Color green,
  ) {
    final settings = widget.settings;

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: line),
        borderRadius: BorderRadius.circular(AppRadius.tabTop),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(
              '参数设置',
              style: AppTypography.cardTitle(
                color: text,
                weight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: <Widget>[
                Text(
                  'Temperature',
                  style: AppTypography.body(color: text),
                ),
                const Spacer(),
                Text(
                  _temperature.toStringAsFixed(2),
                  style: AppTypography.body(color: text),
                ),
              ],
            ),
            Slider(
              value: _temperature,
              max: 2,
              divisions: 40,
              activeColor: green,
              onChanged: (value) => setState(() => _temperature = value),
              onChangeEnd: (value) =>
                  widget.onParametersChanged(t: value),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: <Widget>[
                Text(
                  'Top P',
                  style: AppTypography.body(color: text),
                ),
                const Spacer(),
                Text(
                  _topP.toStringAsFixed(2),
                  style: AppTypography.body(color: text),
                ),
              ],
            ),
            Slider(
              value: _topP,
              divisions: 20,
              activeColor: green,
              onChanged: (value) => setState(() => _topP = value),
              onChangeEnd: (value) =>
                  widget.onParametersChanged(p: value),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: <Widget>[
                Text(
                  '流式输出',
                  style: AppTypography.body(color: text),
                ),
                const Spacer(),
                Switch(
                  value: settings.streamingEnabled,
                  activeColor: green,
                  onChanged: (value) =>
                      widget.onParametersChanged(s: value),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
