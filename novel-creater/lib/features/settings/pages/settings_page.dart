import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/settings/bloc/settings_bloc.dart';
import 'package:novel_creator/features/settings/bloc/settings_event.dart';
import 'package:novel_creator/features/settings/bloc/settings_state.dart';
import 'package:novel_creator/features/settings/bloc/settings_tab.dart';
import 'package:novel_creator/features/settings/widgets/settings_model_pane.dart';
import 'package:novel_creator/features/settings/widgets/settings_nav.dart';
import 'package:novel_creator/features/settings/widgets/settings_placeholder_pane.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  void initState() {
    super.initState();
    context.read<SettingsBloc>().add(const SettingsLoaded());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;

    return Scaffold(
        backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: text),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: '返回',
        ),
        title: Text(
          '设置',
          style: AppTypography.title(color: text, weight: FontWeight.w700),
        ),
      ),
      body: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          return Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              SettingsNav(
                selected: state.selectedTab,
                onSelect: (tab) => context
                    .read<SettingsBloc>()
                    .add(SettingsTabSelected(tab)),
              ),
              Expanded(child: _PaneSwitcher(state: state)),
            ],
          );
        },
      ),
    );
  }
}

class _PaneSwitcher extends StatelessWidget {
  const _PaneSwitcher({required this.state});

  final SettingsState state;

  @override
  Widget build(BuildContext context) {
    switch (state.selectedTab) {
      case SettingsTab.model:
        return SettingsModelPane(state: state);
      case SettingsTab.general:
        return const SettingsPlaceholderPane(
          title: '通用设置',
          description: '基础语言、启动行为、同步策略和界面密度。该 Tab 仅为占位。',
        );
      case SettingsTab.writing:
        return const SettingsPlaceholderPane(
          title: '写作偏好',
          description: '控制默认语气、叙述视角、回复长度和主题外观。该 Tab 仅为占位。',
        );
      case SettingsTab.proof:
        return const SettingsPlaceholderPane(
          title: '编辑与校对',
          description: '拼写检查、修订显示、敏感词提示和一致性校对。该 Tab 仅为占位。',
        );
      case SettingsTab.shortcuts:
        return const SettingsPlaceholderPane(
          title: '快捷键',
          description: '常用创作动作的键盘快捷方式。该 Tab 仅为占位。',
        );
      case SettingsTab.backup:
        return const SettingsPlaceholderPane(
          title: '数据与备份',
          description: '项目数据、本地缓存、云端同步和导出备份。该 Tab 仅为占位。',
        );
      case SettingsTab.about:
        return const SettingsPlaceholderPane(
          title: '关于 Novel Creator',
          description: 'Novel Creator v0.1.0 · 面向长篇小说创作的 AI Agent 工作台。',
        );
    }
  }
}
