import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/widgets/app_modal.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/features/settings/bloc/settings_bloc.dart';
import 'package:novel_creator/features/settings/bloc/settings_event.dart';
import 'package:novel_creator/features/settings/bloc/settings_state.dart';
import 'package:novel_creator/features/settings/widgets/add_provider_dialog.dart';
import 'package:novel_creator/features/settings/widgets/defaults_and_params_block.dart';
import 'package:novel_creator/features/settings/widgets/model_list_block.dart';
import 'package:novel_creator/features/settings/widgets/provider_table.dart';

class SettingsModelPane extends StatefulWidget {
  const SettingsModelPane({required this.state, super.key});

  final SettingsState state;

  @override
  State<SettingsModelPane> createState() => _SettingsModelPaneState();
}

class _SettingsModelPaneState extends State<SettingsModelPane> {
  String? _activeProviderId;

  LlmProvider? _resolveActive() {
    final ps = widget.state.providers;
    if (ps.isEmpty) return null;
    for (final p in ps) {
      if (p.id == _activeProviderId) return p;
    }
    return ps.first;
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    final active = _resolveActive();
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.xxxx + AppSpacing.xxl),
      children: <Widget>[
        ProviderTable(
          providers: state.providers,
          activeProviderId: active?.id,
          testStatus: state.testStatus,
          testingProviderId: state.testingProviderId,
          onSelect: (id) => setState(() => _activeProviderId = id),
          onAdd: () => _addProvider(context),
          onTest: (id) =>
              context.read<SettingsBloc>().add(ConnectionTested(id)),
          onRemove: (id) => _confirmRemoveProvider(context, id),
        ),
        const SizedBox(height: AppSpacing.xxxx + AppSpacing.xs),
        if (active != null) ...<Widget>[
          ModelListBlock(
            provider: active,
            onRefresh: () => context
                .read<SettingsBloc>()
                .add(ModelsRefreshed(active.id)),
            onSelectModel: (modelId) => context
                .read<SettingsBloc>()
                .add(ModelSelected(providerId: active.id, modelId: modelId)),
            onTemperatureChanged: (modelId, t) =>
                context.read<SettingsBloc>().add(
                      ModelTemperatureSet(
                        providerId: active.id,
                        modelId: modelId,
                        temperature: t,
                      ),
                    ),
          ),
          const SizedBox(height: AppSpacing.xxxx + AppSpacing.xs),
          DefaultsAndParamsBlock(
            providers: state.providers,
            settings: state.defaultSettings,
            onDefaultsChanged: (LlmDefaultSettings s) =>
                context.read<SettingsBloc>().add(DefaultModelChanged(s)),
            onParametersChanged: ({double? t, double? p, bool? s}) =>
                context.read<SettingsBloc>().add(
                      ParametersUpdated(
                        temperature: t,
                        topP: p,
                        streaming: s,
                      ),
                    ),
          ),
        ] else
          _emptyHint(),
        if (state.error != null) ...<Widget>[
          const SizedBox(height: AppSpacing.xxxl),
          _errorBanner(state.error!.userMessage),
        ],
      ],
    );
  }

  Widget _emptyHint() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: surface2,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: line),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxx + AppSpacing.xs),
        child: Text(
          '尚未配置任何服务商。点击"添加服务商"开始配置。',
          style: AppTypography.body(color: text),
        ),
      ),
    );
  }

  Widget _errorBanner(String message) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final danger = isDark ? MorandiColors.darkDanger : MorandiColors.danger;
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: danger,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: danger),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Text(
          message,
          style: AppTypography.body(color: bg),
        ),
      ),
    );
  }

  Future<void> _addProvider(BuildContext context) async {
    final bloc = context.read<SettingsBloc>();
    final result = await showDialog<AddProviderResult>(
      context: context,
      builder: (_) => const AddProviderDialog(),
    );
    if (result != null) {
      bloc.add(
        ProviderAdded(
          name: result.name,
          baseUrl: result.baseUrl,
          apiKey: result.apiKey,
          status: ProviderStatus.pendingConfig,
        ),
      );
    }
  }

  Future<void> _confirmRemoveProvider(BuildContext context, String providerId) async {
    final provider = widget.state.providers.where((p) => p.id == providerId).firstOrNull;
    final name = provider?.name ?? '该服务商';
    final confirmed = await AppModal.confirm(
      context: context,
      title: '删除服务商',
      message: '确定要删除服务商「$name」吗？相关 API Key 也将被清除，此操作不可撤销。',
      confirmLabel: '删除',
      isDanger: true,
    );
    if (confirmed && context.mounted) {
      context.read<SettingsBloc>().add(ProviderRemoved(providerId));
    }
  }
}
