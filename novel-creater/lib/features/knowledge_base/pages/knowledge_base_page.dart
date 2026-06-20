import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_event.dart';
import 'package:novel_creator/features/knowledge_base/widgets/character_list_widget.dart';
import 'package:novel_creator/features/knowledge_base/widgets/note_list_widget.dart';
import 'package:novel_creator/features/knowledge_base/widgets/setting_entry_list_widget.dart';

class KnowledgeBasePage extends StatefulWidget {
  const KnowledgeBasePage({super.key, required this.projectId});

  final String projectId;

  @override
  State<KnowledgeBasePage> createState() => _KnowledgeBasePageState();
}

class _KnowledgeBasePageState extends State<KnowledgeBasePage>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<KnowledgeBaseBloc>().add(
            KnowledgeBaseLoaded(widget.projectId),
          );
    });
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) {
      final tab = switch (_tabController.index) {
        0 => KnowledgeBaseTab.characters,
        1 => KnowledgeBaseTab.settings,
        _ => KnowledgeBaseTab.notes,
      };
      context.read<KnowledgeBaseBloc>().add(TabChanged(tab));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: MorandiColors.paper,
        appBar: AppBar(
          backgroundColor: MorandiColors.paper,
          elevation: 0,
          title: const Text(
            '知识库',
            style: TextStyle(color: MorandiColors.ink),
          ),
          bottom: TabBar(
            controller: _tabController,
            labelColor: MorandiColors.sage,
            unselectedLabelColor: MorandiColors.clay,
            indicatorColor: MorandiColors.sage,
            tabs: const <Tab>[
              Tab(text: '角色'),
              Tab(text: '设定'),
              Tab(text: '笔记'),
            ],
          ),
        ),
        body: BlocBuilder<KnowledgeBaseBloc, KnowledgeBaseState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state.error != null) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Icon(
                      Icons.warning_amber_rounded,
                      size: 48,
                      color: MorandiColors.clay,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      state.error!.userMessage,
                      style: TextStyle(color: MorandiColors.ink),
                    ),
                  ],
                ),
              );
            }

            return TabBarView(
              controller: _tabController,
              children: <Widget>[
                CharacterListWidget(projectId: widget.projectId),
                SettingEntryListWidget(projectId: widget.projectId),
                NoteListWidget(projectId: widget.projectId),
              ],
            );
          },
        ),
      );
}
