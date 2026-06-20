import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/editor/revision/revision.dart';
import 'package:novel_creator/features/knowledge_base/bloc/knowledge_base_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/bloc/research_bloc.dart';
import 'package:novel_creator/features/workspace/models/workspace_view.dart';
import 'package:novel_creator/features/workspace/widgets/chapter_editor_widget.dart';
import 'package:novel_creator/features/workspace/widgets/workspace_skeleton.dart';
import 'package:novel_creator/infra/search/search.dart';

class WorkspaceContent extends StatelessWidget {
  const WorkspaceContent({
    required this.view,
    required this.projectId,
    super.key,
  });

  final WorkspaceView view;
  final String projectId;

  @override
  Widget build(BuildContext context) => switch (view) {
        WorkspaceView.editor => const ChapterEditorWidget(),
        WorkspaceView.overview => const _OverviewPage(),
        WorkspaceView.outline => const _KnowledgeOutlinePage(),
        WorkspaceView.research => const _ResearchWorkspacePage(),
        WorkspaceView.revision => _RevisionReviewPage(projectId: projectId),
        WorkspaceView.agentTasks => const _AgentTasksPage(),
        WorkspaceView.pendingChanges => _RevisionReviewPage(
            projectId: projectId,
            isPendingCenter: true,
          ),
        WorkspaceView.characters => const _KnowledgeCharactersPage(),
        WorkspaceView.world => const _KnowledgeWorldPage(),
        WorkspaceView.notes => const _KnowledgeNotesPage(),
        WorkspaceView.sessions => const _SessionsPage(),
        WorkspaceView.export => const _ExportPage(),
        WorkspaceView.backup => const _BackupPage(),
        WorkspaceView.settings => const _SettingsPage(),
      };
}

class _OverviewPage extends StatelessWidget {
  const _OverviewPage();

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<ChapterTreeBloc, ChapterTreeState>(
        builder: (context, state) {
          final totalWords = state.chapters.fold<int>(
            0,
            (sum, chapter) => sum + chapter.wordCount,
          );

          return WorkspacePageScaffold(
            title: '项目概览',
            subtitle: '总览写作进度、最近章节、待处理修订和快捷入口。',
            actions: const [
              SkeletonActionButton(
                label: '新建章节',
                icon: Icons.add,
                isPrimary: true,
              ),
              SkeletonActionButton(
                label: '创建快照',
                icon: Icons.history,
              ),
            ],
            children: [
              MetricGrid(
                items: [
                  MetricItem(
                    value: '${state.chapters.length}',
                    label: '章节',
                    hint: '当前项目章节数',
                  ),
                  MetricItem(
                    value: '$totalWords',
                    label: '总字数',
                    hint: '来自章节缓存',
                  ),
                  const MetricItem(
                    value: '0',
                    label: '待审核修订',
                    hint: 'Agent 写入需确认',
                  ),
                  const MetricItem(
                    value: '0',
                    label: '运行中任务',
                    hint: 'AgentTask 状态',
                  ),
                ],
              ),
              WorkspacePanel(
                title: '最近章节',
                child: Column(
                  children: state.chapters
                      .take(4)
                      .map(
                        (chapter) => SkeletonListRow(
                          title: chapter.title,
                          subtitle: '字数 ${chapter.wordCount}'
                              ' · 状态 ${chapter.status.name}',
                          trailing: const StatusPill(
                            label: '可编辑',
                            tone: StatusTone.success,
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
              const WorkspacePanel(
                title: '产品骨架提示',
                child: Text(
                  '这里后续会接入项目目标、写作曲线、最近 Agent 会话、知识库缺口和导出提醒。',
                ),
              ),
            ],
          );
        },
      );
}

// ignore: unused_element
class _OutlinePage extends StatelessWidget {
  const _OutlinePage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '大纲与资料库',
        subtitle: '管理卷、章、节拍、资料引用和情节一致性提示。',
        actions: [
          SkeletonActionButton(
            label: '新增节拍',
            icon: Icons.add,
            isPrimary: true,
          ),
          SkeletonActionButton(label: '生成骨架', icon: Icons.auto_awesome),
        ],
        children: [
          MetricGrid(
            items: [
              MetricItem(value: '3', label: '卷', hint: '规划中的故事阶段'),
              MetricItem(value: '24', label: '章节', hint: '含草稿与计划'),
              MetricItem(value: '8', label: '关键节拍', hint: '需保持因果链'),
              MetricItem(value: '2', label: '一致性提醒', hint: '等待处理'),
            ],
          ),
          WorkspacePanel(
            title: '节拍骨架',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '开端：雨夜的来客',
                  subtitle: '引入匿名信、档案馆与主角核心疑问。',
                  trailing: StatusPill(label: '已完成', tone: StatusTone.success),
                ),
                SkeletonListRow(
                  title: '推进：旧档案',
                  subtitle: '补足阻力、线索代价与角色行动。',
                  trailing: StatusPill(label: '进行中', tone: StatusTone.warning),
                ),
                SkeletonListRow(
                  title: '转折：钥匙与门',
                  subtitle: '需要明确中点转折和秘密揭示边界。',
                  trailing: StatusPill(label: '待完善'),
                ),
              ],
            ),
          ),
        ],
      );
}

// ignore: unused_element
class _ResearchPage extends StatelessWidget {
  const _ResearchPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '联网调研与引用',
        subtitle: '联网搜索默认进入确认流程，调研结果只保存为资料或建议。',
        actions: [
          SkeletonActionButton(
            label: '开始调研',
            icon: Icons.search,
            isPrimary: true,
          ),
          SkeletonActionButton(label: '保存为笔记', icon: Icons.note_add),
        ],
        children: [
          WorkspacePanel(
            title: '权限边界',
            child: Text(
              '首次联网搜索需要用户确认将发送的文本范围。调研摘要不会直接写入正文，只能成为笔记、引用或待确认修订的上下文。',
            ),
          ),
          WorkspacePanel(
            title: '调研计划',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '确定时间与地区范围',
                  subtitle: '限定资料检索上下文，避免泛化引用。',
                  trailing: StatusPill(label: '待开始'),
                ),
                SkeletonListRow(
                  title: '汇总可信来源',
                  subtitle: '保留标题、URL、摘录和引用说明。',
                  trailing: StatusPill(label: '待开始'),
                ),
              ],
            ),
          ),
        ],
      );
}

// ignore: unused_element
class _ResearchWorkspacePage extends StatefulWidget {
  const _ResearchWorkspacePage();

  @override
  State<_ResearchWorkspacePage> createState() => _ResearchWorkspacePageState();
}

class _ResearchWorkspacePageState extends State<_ResearchWorkspacePage> {
  late final TextEditingController _queryController;

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController();
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      BlocConsumer<ResearchBloc, ResearchState>(
        listenWhen: (previous, current) =>
            previous.error != current.error ||
            previous.lastMessage != current.lastMessage,
        listener: (context, state) {
          final message = state.error ?? state.lastMessage;
          if (message == null) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message)),
          );
        },
        builder: (context, state) => WorkspacePageScaffold(
          title: '联网调研与引用',
          subtitle: '搜索结果只保存为调研资料或建议，不会直接写入小说正文。',
          actions: [
            SkeletonActionButton(
              label: state.hasConfirmedSearchRisk ? '已确认边界' : '确认联网边界',
              icon: Icons.verified_user_outlined,
              isPrimary: !state.hasConfirmedSearchRisk,
              onPressed: () => context.read<ResearchBloc>().add(
                    const ResearchRiskConfirmed(),
                  ),
            ),
          ],
          children: [
            const WorkspacePanel(
              title: '联网前确认',
              child: Text(
                '搜索会发送查询词和必要上下文。调研资料仅用于理解背景，'
                '不应大段复制到正文；真实人物、医学、法律、金融和历史事实需要用户自行核验。',
              ),
            ),
            WorkspacePanel(
              title: '手动搜索',
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _queryController,
                      decoration: const InputDecoration(
                        hintText: '输入调研问题，例如：十九世纪伦敦档案馆制度',
                        prefixIcon: Icon(Icons.search),
                      ),
                      onChanged: (query) => context.read<ResearchBloc>().add(
                            ResearchQueryChanged(query: query),
                          ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: state.isSearching
                        ? null
                        : () => context.read<ResearchBloc>().add(
                              ResearchSearchRequested(
                                query: _queryController.text,
                              ),
                            ),
                    icon: state.isSearching
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.travel_explore, size: 16),
                    label: Text(state.isSearching ? '搜索中' : '开始搜索'),
                  ),
                ],
              ),
            ),
            MetricGrid(
              items: [
                MetricItem(
                  value: '${state.sources.length}',
                  label: '搜索结果',
                  hint: 'SourceCard',
                ),
                MetricItem(
                  value: _cacheHitCount(state.sources),
                  label: '缓存命中',
                  hint: '重复 URL 优先缓存',
                ),
                MetricItem(
                  value: _extractionFailedCount(state.sources),
                  label: '提取失败',
                  hint: '保留摘要可降级',
                ),
                MetricItem(
                  value: '${state.savedNoteIds.length}',
                  label: '已保存',
                  hint: 'Research Note',
                ),
              ],
            ),
            WorkspacePanel(
              title: '来源卡',
              child: _ResearchSourceList(sources: state.sources),
            ),
          ],
        ),
      );
}

class _ResearchSourceList extends StatelessWidget {
  const _ResearchSourceList({required this.sources});

  final List<SourceCard> sources;

  @override
  Widget build(BuildContext context) {
    if (sources.isEmpty) {
      return const Text('暂无搜索结果。确认联网边界后输入查询词开始调研。');
    }
    return Column(
      children:
          sources.map((source) => _ResearchSourceRow(source: source)).toList(),
    );
  }
}

class _ResearchSourceRow extends StatelessWidget {
  const _ResearchSourceRow({required this.source});

  final SourceCard source;

  @override
  Widget build(BuildContext context) => SkeletonListRow(
        title: source.title,
        subtitle: '${source.domain} · ${source.summary}\n'
            'URL: ${source.url}\n'
            'RetrievedAt: ${source.retrievedAt.toIso8601String()}',
        trailing: Wrap(
          spacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            if (source.wasCacheHit) const StatusPill(label: 'cache'),
            if (source.extractionFailed)
              const StatusPill(
                label: 'summary only',
                tone: StatusTone.warning,
              ),
            OutlinedButton.icon(
              onPressed: () => context.read<ResearchBloc>().add(
                    ResearchSourceSaved(source: source),
                  ),
              icon: const Icon(Icons.note_add_outlined, size: 16),
              label: const Text('保存资料'),
            ),
          ],
        ),
      );
}

String _cacheHitCount(List<SourceCard> sources) =>
    '${sources.where((source) => source.wasCacheHit).length}';

String _extractionFailedCount(List<SourceCard> sources) =>
    '${sources.where((source) => source.extractionFailed).length}';

// ignore: unused_element
class _RevisionPage extends StatelessWidget {
  const _RevisionPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '修订追踪与审核',
        subtitle: '所有正文改动以 RevisionPatch 进入审核，正文不会被静默覆盖。',
        actions: [
          SkeletonActionButton(
            label: '接受当前',
            icon: Icons.check,
            isPrimary: true,
          ),
          SkeletonActionButton(label: '拒绝当前', icon: Icons.close),
        ],
        children: [
          MetricGrid(
            items: [
              MetricItem(value: '0', label: '待审核', hint: 'pending revision'),
              MetricItem(value: '0', label: '已接受', hint: 'accepted'),
              MetricItem(value: '0', label: '已拒绝', hint: 'rejected'),
              MetricItem(value: '0', label: '冲突', hint: 'hash 不一致'),
            ],
          ),
          WorkspacePanel(
            title: 'Diff 预览',
            child: Text(
              '后续这里会显示 beforeText / afterText 对照、baseContentHash 冲突提示，以及单条、段落、整体审核模式。',
            ),
          ),
        ],
      );
}

class _RevisionReviewPage extends StatefulWidget {
  const _RevisionReviewPage({
    required this.projectId,
    this.isPendingCenter = false,
  });

  final String projectId;
  final bool isPendingCenter;

  @override
  State<_RevisionReviewPage> createState() => _RevisionReviewPageState();
}

class _RevisionReviewPageState extends State<_RevisionReviewPage> {
  late Future<AppResult<List<Revision>>> _pendingFuture;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _pendingFuture =
        locator<RevisionRepository>().getPendingByProjectId(widget.projectId);
  }

  @override
  Widget build(BuildContext context) =>
      FutureBuilder<AppResult<List<Revision>>>(
        future: _pendingFuture,
        builder: (context, snapshot) {
          final result = snapshot.data;
          final revisions = result?.maybeSuccess ?? const <Revision>[];
          final isLoading = snapshot.connectionState != ConnectionState.done;
          final error = result?.maybeFailure?.userMessage;

          return WorkspacePageScaffold(
            title: widget.isPendingCenter ? '待确认变更中心' : '修订追踪与审核',
            subtitle: '所有正文改动都以 pending revision 进入审核，接受前不会修改正文。',
            actions: const [
              SkeletonActionButton(
                label: '刷新',
                icon: Icons.refresh,
                isPrimary: true,
              ),
            ],
            children: [
              MetricGrid(
                items: [
                  MetricItem(
                    value: '${revisions.length}',
                    label: '待审核',
                    hint: 'pending revision',
                  ),
                  const MetricItem(
                    value: '0',
                    label: '冲突',
                    hint: '接受时检测 hash',
                  ),
                  const MetricItem(
                    value: '单条',
                    label: '审核模式',
                    hint: '批量审核后续接入',
                  ),
                  const MetricItem(
                    value: '安全',
                    label: '正文保护',
                    hint: 'Agent 不静默覆盖',
                  ),
                ],
              ),
              WorkspacePanel(
                title: '待审核修订',
                child: _RevisionReviewBody(
                  isLoading: isLoading,
                  error: error,
                  revisions: revisions,
                  onAccept: _accept,
                  onReject: _reject,
                ),
              ),
            ],
          );
        },
      );

  Future<void> _accept(String revisionId) async {
    final result = await locator<RevisionService>().accept(revisionId);
    if (!mounted) return;
    _showResult(result, successMessage: '已接受修订');
    setState(_reload);
  }

  Future<void> _reject(String revisionId) async {
    final result = await locator<RevisionService>().reject(revisionId);
    if (!mounted) return;
    _showResult(result, successMessage: '已拒绝修订');
    setState(_reload);
  }

  void _showResult(
    AppResult<Revision> result, {
    required String successMessage,
  }) {
    final message = result.isSuccess
        ? successMessage
        : result.maybeFailure?.userMessage ?? '操作失败';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _RevisionReviewBody extends StatelessWidget {
  const _RevisionReviewBody({
    required this.isLoading,
    required this.revisions,
    required this.onAccept,
    required this.onReject,
    this.error,
  });

  final bool isLoading;
  final String? error;
  final List<Revision> revisions;
  final ValueChanged<String> onAccept;
  final ValueChanged<String> onReject;

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Text('正在加载待审核修订...');
    if (error != null) return Text(error!);
    if (revisions.isEmpty) {
      return const Text('暂无待审核修订。Agent 生成的正文改动会先出现在这里。');
    }

    return Column(
      children: revisions
          .map(
            (revision) => _RevisionReviewCard(
              revision: revision,
              onAccept: () => onAccept(revision.id),
              onReject: () => onReject(revision.id),
            ),
          )
          .toList(),
    );
  }
}

class _RevisionReviewCard extends StatelessWidget {
  const _RevisionReviewCard({
    required this.revision,
    required this.onAccept,
    required this.onReject,
  });

  final Revision revision;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SkeletonListRow(
              title: '${revision.operation.name} · ${revision.chapterId}',
              subtitle: revision.metadata?.summary ??
                  revision.metadata?.changeSummary ??
                  '等待用户审核',
              trailing: const StatusPill(
                label: 'pending',
                tone: StatusTone.warning,
              ),
            ),
            const SizedBox(height: 8),
            _DiffBlock(label: 'beforeText', text: revision.beforeText),
            const SizedBox(height: 6),
            _DiffBlock(label: 'afterText', text: revision.afterText),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: onAccept,
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('接受'),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: onReject,
                  icon: const Icon(Icons.close, size: 16),
                  label: const Text('拒绝'),
                ),
              ],
            ),
          ],
        ),
      );
}

class _DiffBlock extends StatelessWidget {
  const _DiffBlock({
    required this.label,
    required this.text,
  });

  final String label;
  final String text;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Text(
        '$label\n${text.isEmpty ? '(empty)' : text}',
        style: const TextStyle(height: 1.5),
      ),
    );
  }
}

class _AgentTasksPage extends StatelessWidget {
  const _AgentTasksPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: 'Agent 任务中心',
        subtitle: '展示 created、queued、running、succeeded、failed、cancelled 全状态。',
        actions: [
          SkeletonActionButton(label: '取消运行中', icon: Icons.stop_circle),
        ],
        children: [
          WorkspacePanel(
            title: '任务队列',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '生成第 3 章续写建议',
                  subtitle: '输出将进入待确认修订，不直接写入正文。',
                  trailing:
                      StatusPill(label: 'queued', tone: StatusTone.warning),
                ),
                SkeletonListRow(
                  title: '角色一致性检查',
                  subtitle: '只生成建议和定位信息。',
                  trailing: StatusPill(label: 'created'),
                ),
              ],
            ),
          ),
        ],
      );
}

// ignore: unused_element
class _PendingChangesPage extends StatelessWidget {
  const _PendingChangesPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '待确认变更中心',
        subtitle: '集中处理 Agent 建议、知识库建议和正文修订申请。',
        actions: [
          SkeletonActionButton(label: '批量审核', icon: Icons.playlist_add_check),
        ],
        children: [
          WorkspacePanel(
            title: '安全红线',
            child: Text(
              '插入、替换和删除正文都必须生成 pending revision。删除正文属于高风险操作，只能以删除修订提交并等待确认。',
            ),
          ),
          WorkspacePanel(
            title: '待确认项',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '正文替换建议',
                  subtitle: '必须保留 beforeText，并在 hash 冲突时进入冲突处理。',
                  trailing: StatusPill(label: '正文', tone: StatusTone.warning),
                ),
                SkeletonListRow(
                  title: '角色设定调整',
                  subtitle: '以建议形式呈现，不直接改写角色实体。',
                  trailing: StatusPill(label: '知识库'),
                ),
              ],
            ),
          ),
        ],
      );
}

class _KnowledgeCharactersPage extends StatelessWidget {
  const _KnowledgeCharactersPage();

  @override
  Widget build(BuildContext context) =>
      BlocConsumer<KnowledgeBaseBloc, KnowledgeBaseState>(
        listenWhen: (previous, current) =>
            previous.error != current.error ||
            previous.lastMessage != current.lastMessage,
        listener: _showKnowledgeMessage,
        builder: (context, state) => WorkspacePageScaffold(
          title: '角色库',
          subtitle: '角色卡、标签和一致性事实统一进入知识库，供章节与 Agent 引用。',
          actions: [
            SkeletonActionButton(
              label: '新建角色',
              icon: Icons.person_add,
              isPrimary: true,
              onPressed: () => _showCharacterDialog(context),
            ),
          ],
          children: [
            _KnowledgeSearchBox(initialQuery: state.query),
            MetricGrid(
              items: [
                MetricItem(
                  value: '${state.characters.length}',
                  label: '角色',
                  hint: '当前项目角色卡',
                ),
                MetricItem(
                  value: '${state.filteredCharacters.length}',
                  label: '搜索命中',
                  hint: '按名称、简介、标签',
                ),
                const MetricItem(
                  value: 'Repository',
                  label: '写入路径',
                  hint: '不绕过数据层',
                ),
                const MetricItem(
                  value: '建议态',
                  label: 'Agent 修改',
                  hint: '后续接确认流',
                ),
              ],
            ),
            WorkspacePanel(
              title: '角色卡',
              child: _KnowledgeList(
                isLoading: state.isLoading,
                emptyText: '暂无角色。可以先创建主角、反派或关键配角。',
                children: state.filteredCharacters
                    .map(
                      (character) => _KnowledgeRow(
                        title: character.name,
                        subtitle: character.description.isEmpty
                            ? '标签：${_formatTags(character.tags)}'
                            : '${character.description} · 标签：'
                                '${_formatTags(character.tags)}',
                        trailing: StatusPill(label: character.role.name),
                        onEdit: () => _showCharacterDialog(
                          context,
                          character: character,
                        ),
                        onDelete: () => context.read<KnowledgeBaseBloc>().add(
                              KnowledgeCharacterDeleted(
                                characterId: character.id,
                              ),
                            ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      );
}

class _KnowledgeNotesPage extends StatelessWidget {
  const _KnowledgeNotesPage();

  @override
  Widget build(BuildContext context) =>
      BlocConsumer<KnowledgeBaseBloc, KnowledgeBaseState>(
        listenWhen: (previous, current) =>
            previous.error != current.error ||
            previous.lastMessage != current.lastMessage,
        listener: _showKnowledgeMessage,
        builder: (context, state) => WorkspacePageScaffold(
          title: '笔记与素材库',
          subtitle: '管理灵感、调研摘录、决策和问题，保留来源并供 Agent 检索。',
          actions: [
            SkeletonActionButton(
              label: '新建笔记',
              icon: Icons.note_add,
              isPrimary: true,
              onPressed: () => _showNoteDialog(context),
            ),
          ],
          children: [
            _KnowledgeSearchBox(initialQuery: state.query),
            MetricGrid(
              items: [
                MetricItem(
                  value: '${state.notes.length}',
                  label: '笔记',
                  hint: '素材总量',
                ),
                MetricItem(
                  value: '${state.filteredNotes.length}',
                  label: '搜索命中',
                  hint: '按标题、内容、标签',
                ),
                MetricItem(
                  value:
                      '${state.notes.where((n) => n.sourceUrl != null).length}',
                  label: '带来源',
                  hint: '可追溯素材',
                ),
                const MetricItem(
                  value: '可降级',
                  label: '调研策略',
                  hint: '搜索失败仍可手记',
                ),
              ],
            ),
            WorkspacePanel(
              title: '素材条目',
              child: _KnowledgeList(
                isLoading: state.isLoading,
                emptyText: '暂无笔记。可以先记录灵感、摘录或待解决问题。',
                children: state.filteredNotes
                    .map(
                      (note) => _KnowledgeRow(
                        title: note.title,
                        subtitle: note.content.isEmpty
                            ? '标签：${_formatTags(note.tags)}'
                            : '${note.content} · 标签：${_formatTags(note.tags)}',
                        trailing: StatusPill(label: note.type.name),
                        onEdit: () => _showNoteDialog(context, note: note),
                        onDelete: () => context.read<KnowledgeBaseBloc>().add(
                              KnowledgeNoteDeleted(noteId: note.id),
                            ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      );
}

class _KnowledgeOutlinePage extends StatelessWidget {
  const _KnowledgeOutlinePage();

  @override
  Widget build(BuildContext context) =>
      BlocConsumer<KnowledgeBaseBloc, KnowledgeBaseState>(
        listenWhen: (previous, current) =>
            previous.error != current.error ||
            previous.lastMessage != current.lastMessage,
        listener: _showKnowledgeMessage,
        builder: (context, state) => WorkspacePageScaffold(
          title: '大纲与资料库',
          subtitle: '管理卷、章、场景和节拍，逐步替换静态大纲骨架。',
          actions: [
            SkeletonActionButton(
              label: '新增节点',
              icon: Icons.add,
              isPrimary: true,
              onPressed: () => _showOutlineDialog(context),
            ),
          ],
          children: [
            _KnowledgeSearchBox(initialQuery: state.query),
            MetricGrid(
              items: [
                MetricItem(
                  value: '${state.outlineNodes.length}',
                  label: '大纲节点',
                  hint: '卷/章/场景/节拍',
                ),
                MetricItem(
                  value: '${state.filteredOutlineNodes.length}',
                  label: '搜索命中',
                  hint: '按标题、摘要',
                ),
                const MetricItem(
                  value: '顺序',
                  label: '排序策略',
                  hint: '按 order 展示',
                ),
                const MetricItem(
                  value: '可链接',
                  label: '章节关系',
                  hint: '后续接章节绑定',
                ),
              ],
            ),
            WorkspacePanel(
              title: '大纲节点',
              child: _KnowledgeList(
                isLoading: state.isLoading,
                emptyText: '暂无大纲节点。可以先添加卷、章或关键场景。',
                children: state.filteredOutlineNodes
                    .map(
                      (node) => _KnowledgeRow(
                        title: node.title,
                        subtitle: node.summary.isEmpty
                            ? '类型：${node.nodeType.name}'
                            : '${node.summary} · 类型：${node.nodeType.name}',
                        trailing: StatusPill(label: node.status.name),
                        onEdit: () => _showOutlineDialog(context, node: node),
                        onDelete: () => context.read<KnowledgeBaseBloc>().add(
                              KnowledgeOutlineNodeDeleted(nodeId: node.id),
                            ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      );
}

class _KnowledgeWorldPage extends StatelessWidget {
  const _KnowledgeWorldPage();

  @override
  Widget build(BuildContext context) =>
      BlocConsumer<KnowledgeBaseBloc, KnowledgeBaseState>(
        listenWhen: (previous, current) =>
            previous.error != current.error ||
            previous.lastMessage != current.lastMessage,
        listener: _showKnowledgeMessage,
        builder: (context, state) => WorkspacePageScaffold(
          title: '世界观设定',
          subtitle: '地理、历史、势力、规则等设定统一入库，Agent 只能以建议形式修改。',
          actions: [
            SkeletonActionButton(
              label: '新建设定',
              icon: Icons.add_location_alt,
              isPrimary: true,
              onPressed: () => _showSettingEntryDialog(context),
            ),
          ],
          children: [
            _KnowledgeSearchBox(initialQuery: state.query),
            MetricGrid(
              items: [
                MetricItem(
                  value: '${state.settingEntries.length}',
                  label: '设定',
                  hint: '世界观条目',
                ),
                MetricItem(
                  value: '${state.filteredSettingEntries.length}',
                  label: '搜索命中',
                  hint: '按分类、标题、内容、标签',
                ),
                MetricItem(
                  value: _categoryCount(state.settingEntries),
                  label: '分类',
                  hint: '地理/历史/势力/规则',
                ),
                const MetricItem(
                  value: '受限',
                  label: 'Agent 修改',
                  hint: '后续接建议确认',
                ),
              ],
            ),
            WorkspacePanel(
              title: '设定条目',
              child: _KnowledgeList(
                isLoading: state.isLoading,
                emptyText: '暂无世界观设定。可以先添加地理、历史、势力或规则。',
                children: state.filteredSettingEntries
                    .map(
                      (entry) => _KnowledgeRow(
                        title: entry.title,
                        subtitle: entry.content.isEmpty
                            ? '标签：${_formatTags(entry.tags)}'
                            : '${entry.content} · 标签：'
                                '${_formatTags(entry.tags)}',
                        trailing: StatusPill(label: entry.category),
                        onEdit: () => _showSettingEntryDialog(
                          context,
                          entry: entry,
                        ),
                        onDelete: () => context.read<KnowledgeBaseBloc>().add(
                              KnowledgeSettingEntryDeleted(entryId: entry.id),
                            ),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      );
}

class _KnowledgeSearchBox extends StatefulWidget {
  const _KnowledgeSearchBox({required this.initialQuery});

  final String initialQuery;

  @override
  State<_KnowledgeSearchBox> createState() => _KnowledgeSearchBoxState();
}

class _KnowledgeSearchBoxState extends State<_KnowledgeSearchBox> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => WorkspacePanel(
        title: '搜索',
        child: TextField(
          controller: _controller,
          decoration: const InputDecoration(
            hintText: '输入名称、标签、摘要或正文关键词',
            prefixIcon: Icon(Icons.search),
          ),
          onChanged: (query) => context.read<KnowledgeBaseBloc>().add(
                KnowledgeBaseQueryChanged(query: query),
              ),
        ),
      );
}

class _KnowledgeList extends StatelessWidget {
  const _KnowledgeList({
    required this.isLoading,
    required this.emptyText,
    required this.children,
  });

  final bool isLoading;
  final String emptyText;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Text('正在加载知识库...');
    if (children.isEmpty) return Text(emptyText);
    return Column(children: children);
  }
}

class _KnowledgeRow extends StatelessWidget {
  const _KnowledgeRow({
    required this.title,
    required this.subtitle,
    required this.onEdit,
    required this.onDelete,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => SkeletonListRow(
        title: title,
        subtitle: subtitle,
        trailing: Wrap(
          spacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            if (trailing != null) trailing!,
            IconButton(
              icon: const Icon(Icons.edit_outlined, size: 18),
              tooltip: '编辑',
              onPressed: onEdit,
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, size: 18),
              tooltip: '删除',
              onPressed: onDelete,
            ),
          ],
        ),
      );
}

void _showKnowledgeMessage(
  BuildContext context,
  KnowledgeBaseState state,
) {
  final message = state.error ?? state.lastMessage;
  if (message == null) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}

Future<void> _showCharacterDialog(
  BuildContext context, {
  Character? character,
}) async {
  final nameController = TextEditingController(text: character?.name ?? '');
  final descriptionController =
      TextEditingController(text: character?.description ?? '');
  final tagsController =
      TextEditingController(text: character?.tags.join(', ') ?? '');

  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(character == null ? '新建角色' : '编辑角色'),
      content: _KnowledgeFormFields(
        primaryController: nameController,
        primaryLabel: '角色名称',
        secondaryController: descriptionController,
        secondaryLabel: '简介',
        tagsController: tagsController,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: const Text('取消'),
        ),
        ElevatedButton(
          onPressed: () {
            final bloc = context.read<KnowledgeBaseBloc>();
            if (character == null) {
              bloc.add(
                KnowledgeCharacterCreated(
                  name: nameController.text,
                  description: descriptionController.text,
                  tags: tagsController.text,
                ),
              );
            } else {
              bloc.add(
                KnowledgeCharacterUpdated(
                  character: character,
                  name: nameController.text,
                  description: descriptionController.text,
                  tags: tagsController.text,
                ),
              );
            }
            Navigator.of(dialogContext).pop();
          },
          child: const Text('保存'),
        ),
      ],
    ),
  );

  nameController.dispose();
  descriptionController.dispose();
  tagsController.dispose();
}

Future<void> _showNoteDialog(
  BuildContext context, {
  Note? note,
}) async {
  final titleController = TextEditingController(text: note?.title ?? '');
  final contentController = TextEditingController(text: note?.content ?? '');
  final tagsController =
      TextEditingController(text: note?.tags.join(', ') ?? '');
  final sourceController = TextEditingController(text: note?.sourceUrl ?? '');

  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(note == null ? '新建笔记' : '编辑笔记'),
      content: _KnowledgeFormFields(
        primaryController: titleController,
        primaryLabel: '标题',
        secondaryController: contentController,
        secondaryLabel: '内容',
        tagsController: tagsController,
        extraController: sourceController,
        extraLabel: '来源 URL',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: const Text('取消'),
        ),
        ElevatedButton(
          onPressed: () {
            final bloc = context.read<KnowledgeBaseBloc>();
            if (note == null) {
              bloc.add(
                KnowledgeNoteCreated(
                  title: titleController.text,
                  content: contentController.text,
                  sourceUrl: sourceController.text,
                  tags: tagsController.text,
                ),
              );
            } else {
              bloc.add(
                KnowledgeNoteUpdated(
                  note: note,
                  title: titleController.text,
                  content: contentController.text,
                  type: note.type,
                  sourceUrl: sourceController.text,
                  tags: tagsController.text,
                ),
              );
            }
            Navigator.of(dialogContext).pop();
          },
          child: const Text('保存'),
        ),
      ],
    ),
  );

  titleController.dispose();
  contentController.dispose();
  tagsController.dispose();
  sourceController.dispose();
}

Future<void> _showOutlineDialog(
  BuildContext context, {
  OutlineNode? node,
}) async {
  final titleController = TextEditingController(text: node?.title ?? '');
  final summaryController = TextEditingController(text: node?.summary ?? '');
  final tagsController = TextEditingController();

  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(node == null ? '新增大纲节点' : '编辑大纲节点'),
      content: _KnowledgeFormFields(
        primaryController: titleController,
        primaryLabel: '标题',
        secondaryController: summaryController,
        secondaryLabel: '摘要',
        tagsController: tagsController,
        showTags: false,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: const Text('取消'),
        ),
        ElevatedButton(
          onPressed: () {
            final bloc = context.read<KnowledgeBaseBloc>();
            if (node == null) {
              bloc.add(
                KnowledgeOutlineNodeCreated(
                  title: titleController.text,
                  summary: summaryController.text,
                ),
              );
            } else {
              bloc.add(
                KnowledgeOutlineNodeUpdated(
                  node: node,
                  title: titleController.text,
                  summary: summaryController.text,
                  nodeType: node.nodeType,
                  status: node.status,
                ),
              );
            }
            Navigator.of(dialogContext).pop();
          },
          child: const Text('保存'),
        ),
      ],
    ),
  );

  titleController.dispose();
  summaryController.dispose();
  tagsController.dispose();
}

Future<void> _showSettingEntryDialog(
  BuildContext context, {
  SettingEntry? entry,
}) async {
  final categoryController =
      TextEditingController(text: entry?.category ?? '地理');
  final titleController = TextEditingController(text: entry?.title ?? '');
  final contentController = TextEditingController(text: entry?.content ?? '');
  final tagsController =
      TextEditingController(text: entry?.tags.join(', ') ?? '');

  await showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(entry == null ? '新建设定' : '编辑设定'),
      content: _KnowledgeFormFields(
        primaryController: titleController,
        primaryLabel: '标题',
        secondaryController: contentController,
        secondaryLabel: '内容',
        tagsController: tagsController,
        extraController: categoryController,
        extraLabel: '分类',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: const Text('取消'),
        ),
        ElevatedButton(
          onPressed: () {
            final bloc = context.read<KnowledgeBaseBloc>();
            if (entry == null) {
              bloc.add(
                KnowledgeSettingEntryCreated(
                  category: categoryController.text,
                  title: titleController.text,
                  content: contentController.text,
                  tags: tagsController.text,
                ),
              );
            } else {
              bloc.add(
                KnowledgeSettingEntryUpdated(
                  entry: entry,
                  category: categoryController.text,
                  title: titleController.text,
                  content: contentController.text,
                  tags: tagsController.text,
                ),
              );
            }
            Navigator.of(dialogContext).pop();
          },
          child: const Text('保存'),
        ),
      ],
    ),
  );

  categoryController.dispose();
  titleController.dispose();
  contentController.dispose();
  tagsController.dispose();
}

class _KnowledgeFormFields extends StatelessWidget {
  const _KnowledgeFormFields({
    required this.primaryController,
    required this.primaryLabel,
    required this.secondaryController,
    required this.secondaryLabel,
    required this.tagsController,
    this.extraController,
    this.extraLabel,
    this.showTags = true,
  });

  final TextEditingController primaryController;
  final String primaryLabel;
  final TextEditingController secondaryController;
  final String secondaryLabel;
  final TextEditingController tagsController;
  final TextEditingController? extraController;
  final String? extraLabel;
  final bool showTags;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 420,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: primaryController,
              decoration: InputDecoration(labelText: primaryLabel),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: secondaryController,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(labelText: secondaryLabel),
            ),
            if (showTags) ...[
              const SizedBox(height: 12),
              TextField(
                controller: tagsController,
                decoration: const InputDecoration(
                  labelText: '标签',
                  hintText: '用逗号或空格分隔',
                ),
              ),
            ],
            if (extraController != null && extraLabel != null) ...[
              const SizedBox(height: 12),
              TextField(
                controller: extraController,
                decoration: InputDecoration(labelText: extraLabel),
              ),
            ],
          ],
        ),
      );
}

String _formatTags(List<String> tags) => tags.isEmpty ? '无' : tags.join(', ');

String _categoryCount(List<SettingEntry> entries) =>
    '${entries.map((entry) => entry.category).toSet().length}';

// ignore: unused_element
class _CharactersPage extends StatelessWidget {
  const _CharactersPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '角色库',
        subtitle: '角色卡、关系、目标、弱点、秘密与一致性提醒。',
        actions: [
          SkeletonActionButton(
            label: '新建角色',
            icon: Icons.person_add,
            isPrimary: true,
          ),
        ],
        children: [
          MetricGrid(
            items: [
              MetricItem(value: '0', label: '主角', hint: 'CharacterRole.main'),
              MetricItem(value: '0', label: '配角', hint: 'supporting'),
              MetricItem(value: '0', label: '关系', hint: '待接图谱'),
              MetricItem(value: '0', label: '提醒', hint: '一致性问题'),
            ],
          ),
          WorkspacePanel(
            title: '角色详情占位',
            child: Text(
              '后续接 CharacterRepository，展示角色卡、关系图谱和跨章节行为一致性。',
            ),
          ),
        ],
      );
}

// ignore: unused_element
class _WorldPage extends StatelessWidget {
  const _WorldPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '世界观设定',
        subtitle: '地理、历史、势力、规则设定统一管理。',
        actions: [
          SkeletonActionButton(
            label: '新建设定',
            icon: Icons.add_location_alt,
            isPrimary: true,
          ),
        ],
        children: [
          MetricGrid(
            items: [
              MetricItem(value: '0', label: '地理', hint: '地点与区域'),
              MetricItem(value: '0', label: '历史', hint: '事件与年表'),
              MetricItem(value: '0', label: '势力', hint: '组织与阵营'),
              MetricItem(value: '0', label: '规则', hint: '限制与代价'),
            ],
          ),
          WorkspacePanel(
            title: '一致性提示',
            child: Text(
              '世界观修改属于受限操作，Agent 只能提交建议，用户确认后才更新设定实体。',
            ),
          ),
        ],
      );
}

// ignore: unused_element
class _NotesPage extends StatelessWidget {
  const _NotesPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '笔记与素材库',
        subtitle: '管理灵感、摘录、图片线索、调研摘要和未归档素材。',
        actions: [
          SkeletonActionButton(
            label: '新建笔记',
            icon: Icons.note_add,
            isPrimary: true,
          ),
        ],
        children: [
          WorkspacePanel(
            title: '素材分组',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '灵感',
                  subtitle: '碎片想法、桥段和意象。',
                  trailing: StatusPill(label: '0 条'),
                ),
                SkeletonListRow(
                  title: '调研摘录',
                  subtitle: '保存来源、引用和可信度说明。',
                  trailing: StatusPill(label: '0 条'),
                ),
              ],
            ),
          ),
        ],
      );
}

class _SessionsPage extends StatelessWidget {
  const _SessionsPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '会话、分支与时光机',
        subtitle: '管理 Agent 会话、上下文快照、分支和回溯预览。',
        actions: [
          SkeletonActionButton(
            label: '创建快照',
            icon: Icons.history,
            isPrimary: true,
          ),
          SkeletonActionButton(label: '新建会话', icon: Icons.add_comment),
        ],
        children: [
          WorkspacePanel(
            title: '当前会话',
            child: Text(
              '后续接 SessionRepository 和 SnapshotRepository，快照入口会远离高频写作按钮，避免误触。',
            ),
          ),
          WorkspacePanel(
            title: '时间线',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '自动保存快照',
                  subtitle: '迁移、导出或高风险变更前创建。',
                  trailing: StatusPill(label: '计划中'),
                ),
              ],
            ),
          ),
        ],
      );
}

class _ExportPage extends StatelessWidget {
  const _ExportPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '导出向导',
        subtitle: '导出不修改项目正文，pending revision 默认不进入成稿。',
        actions: [
          SkeletonActionButton(
            label: '开始导出',
            icon: Icons.file_upload,
            isPrimary: true,
          ),
        ],
        children: [
          MetricGrid(
            items: [
              MetricItem(value: 'TXT', label: '第一阶段', hint: '纯文本'),
              MetricItem(value: 'MD', label: '第二阶段', hint: 'Markdown'),
              MetricItem(value: 'EPUB', label: '后续', hint: '电子书'),
              MetricItem(value: 'Package', label: '备份', hint: '项目包'),
            ],
          ),
          WorkspacePanel(
            title: '导出前检查',
            child: Text(
              '若存在 pending revision，导出前必须提示。默认只导出已接受内容，并显示导出进度和失败降级方案。',
            ),
          ),
        ],
      );
}

class _BackupPage extends StatelessWidget {
  const _BackupPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '数据与备份',
        subtitle: '迁移前自动备份，失败时保留旧数据并提示导出备份。',
        actions: [
          SkeletonActionButton(
            label: '创建备份',
            icon: Icons.inventory_2,
            isPrimary: true,
          ),
          SkeletonActionButton(label: '迁移 dryRun', icon: Icons.science),
        ],
        children: [
          WorkspacePanel(
            title: '迁移策略',
            child: Text(
              '''
迁移流程需要 dryRun、apply 和 rollbackHint。
这里后续接 MigrationPlan 与项目包导入导出。''',
            ),
          ),
          WorkspacePanel(
            title: '备份历史',
            child: Column(
              children: [
                SkeletonListRow(
                  title: '尚无备份记录',
                  subtitle: '执行迁移或手动创建备份后，会显示在这里。',
                  trailing: StatusPill(label: '空状态'),
                ),
              ],
            ),
          ),
        ],
      );
}

class _SettingsPage extends StatelessWidget {
  const _SettingsPage();

  @override
  Widget build(BuildContext context) => const WorkspacePageScaffold(
        title: '设置与服务商',
        subtitle: '配置 OpenAI 兼容服务商、本地模型、写作偏好和隐私边界。',
        actions: [
          SkeletonActionButton(
            label: '测试连接',
            icon: Icons.cloud_done,
            isPrimary: true,
          ),
        ],
        children: [
          WorkspacePanel(
            title: '隐私提醒',
            child: Text(
              'Web 端直连第三方 API 可能暴露 API Key。桌面端应使用本地加密存储，模型调用前明确将发送的文本范围。',
            ),
          ),
          WorkspacePanel(
            title: '服务商列表',
            child: Column(
              children: [
                SkeletonListRow(
                  title: 'OpenAI Compatible',
                  subtitle:
                      'base_url / api_key / model / temperature / max_tokens',
                  trailing: StatusPill(label: '待配置'),
                ),
                SkeletonListRow(
                  title: 'Ollama 本地模型',
                  subtitle: '适合离线或隐私优先写作流程。',
                  trailing: StatusPill(label: '本地', tone: StatusTone.success),
                ),
              ],
            ),
          ),
        ],
      );
}
