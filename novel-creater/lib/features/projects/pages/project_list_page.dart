import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';

class ProjectListPage extends StatelessWidget {
  const ProjectListPage({super.key});

  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (_) => ProjectListBloc(
          projectRepository: locator<ProjectRepository>(),
        )..add(ProjectListStarted()),
        child: const _ProjectListView(),
      );
}

class _ProjectListView extends StatelessWidget {
  const _ProjectListView();

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Scaffold(
      body: Row(
        children: [
          _Sidebar(morandi: morandi),
          Expanded(
            child: BlocBuilder<ProjectListBloc, ProjectListState>(
              builder: (context, state) => ColoredBox(
                color: morandi.bg,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _MainHeader(state: state),
                    Expanded(child: _MainContent(state: state)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        width: 260,
        color: morandi.surface2.withOpacity(0.88),
        child: Column(
          children: [
            Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: morandi.line)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFFEDF3E8), Color(0xFFDFE8D9)],
                      ),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFD8E3D2)),
                    ),
                    child: Icon(
                      Icons.eco_outlined,
                      size: 16,
                      color: morandi.greenDark,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Novel Creator',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: morandi.ink,
                    ),
                  ),
                ],
              ),
            ),
            _NavItem(
              icon: Icons.folder_outlined,
              label: '项目库',
              isActive: true,
              morandi: morandi,
            ),
            _NavItem(
              icon: Icons.history,
              label: '最近打开',
              isActive: false,
              morandi: morandi,
            ),
            _NavItem(
              icon: Icons.star_outline,
              label: '收藏',
              isActive: false,
              morandi: morandi,
            ),
            _NavItem(
              icon: Icons.delete_outline,
              label: '回收站',
              isActive: false,
              morandi: morandi,
            ),
            const Spacer(),
            Divider(
              color: morandi.line,
              height: 1,
              indent: 16,
              endIndent: 16,
            ),
            _NavItem(
              icon: Icons.settings_outlined,
              label: '设置',
              isActive: false,
              morandi: morandi,
            ),
            const SizedBox(height: 12),
          ],
        ),
      );
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.morandi,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: isActive ? morandi.greenTint : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive ? morandi.greenLight : Colors.transparent,
          ),
        ),
        child: ListTile(
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          leading: Icon(
            icon,
            size: 18,
            color: isActive
                ? morandi.greenDark
                : const Color(0xFF555952),
          ),
          title: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
              color: isActive
                  ? morandi.greenDark
                  : const Color(0xFF555952),
            ),
          ),
          onTap: () {},
        ),
      );
}

class _MainHeader extends StatelessWidget {
  const _MainHeader({required this.state});

  final ProjectListState state;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 24, 32, 0),
      child: Row(
        children: [
          Text(
            '我的项目',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: morandi.ink,
            ),
          ),
          const SizedBox(width: 16),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: morandi.greenLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '${state.projects.length}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: morandi.greenDark,
              ),
            ),
          ),
          const Spacer(),
          SizedBox(
            width: 220,
            height: 36,
            child: TextField(
              decoration: InputDecoration(
                hintText: '搜索项目...',
                hintStyle: TextStyle(
                  fontSize: 13,
                  color: morandi.soft,
                ),
                prefixIcon: Icon(
                  Icons.search,
                  size: 18,
                  color: morandi.muted,
                ),
                filled: true,
                fillColor: morandi.canvas,
                contentPadding: EdgeInsets.zero,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: morandi.line),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: morandi.line),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(
                    color: morandi.green,
                    width: 1.5,
                  ),
                ),
              ),
              style: TextStyle(
                fontSize: 13,
                color: morandi.text,
              ),
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pushNamed(
              AppRoutes.newProject,
            ),
            icon: const Icon(Icons.add, size: 16),
            label: const Text(
              '新建项目',
              style: TextStyle(fontSize: 13),
            ),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
              backgroundColor: morandi.green,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MainContent extends StatelessWidget {
  const _MainContent({required this.state});

  final ProjectListState state;

  @override
  Widget build(BuildContext context) {
    if (state.isLoading && state.projects.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null && state.projects.isEmpty) {
      final morandi = Theme.of(context).extension<MorandiColors>()!;
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: morandi.red,
            ),
            const SizedBox(height: 16),
            Text(
              state.error!,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context
                  .read<ProjectListBloc>()
                  .add(ProjectListRefreshed()),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (state.projects.isEmpty) {
      final morandi = Theme.of(context).extension<MorandiColors>()!;
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.menu_book_outlined,
              size: 64,
              color: morandi.soft.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              '创建你的第一部小说',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(color: morandi.muted),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => Navigator.of(context).pushNamed(
                AppRoutes.newProject,
              ),
              icon: const Icon(Icons.add),
              label: const Text('新建项目'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProjectListBloc>().add(ProjectListRefreshed());
      },
      child: Padding(
        padding: const EdgeInsets.fromLTRB(32, 20, 32, 32),
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 280,
            mainAxisExtent: 260,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: state.projects.length + 1,
          itemBuilder: (context, index) {
            if (index == state.projects.length) {
              return const _AddProjectTile();
            }
            return _ProjectTile(project: state.projects[index]);
          },
        ),
      ),
    );
  }
}

class _ProjectTile extends StatelessWidget {
  const _ProjectTile({required this.project});

  final Project project;

  static final _gradients = [
    [const Color(0xFF637B61), const Color(0xFFA8B5A2)],
    [const Color(0xFFBA8D50), const Color(0xFFD8C5A6)],
    [const Color(0xFF7C8F95), const Color(0xFFA8B5A2)],
    [const Color(0xFFC7A99A), const Color(0xFFD9B7AE)],
    [const Color(0xFFB56A60), const Color(0xFFD9B7AE)],
  ];

  static final _fallbackTitles = [
    '未命名项目',
    '新建小说',
    '我的创作',
  ];

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    final gradientIndex = project.title.hashCode.abs() % _gradients.length;
    final gradient = _gradients[gradientIndex];

    return Container(
      decoration: BoxDecoration(
        color: morandi.canvas,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: morandi.line),
      ),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(
          AppRoutes.workspace,
          arguments: project.id,
        ),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 150,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: gradient,
                ),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 12,
                    right: 12,
                    child: PopupMenuButton<String>(
                      icon: Icon(
                        Icons.more_horiz,
                        color: Colors.white.withOpacity(0.8),
                        size: 20,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      onSelected: (value) {
                        if (value == 'delete') _confirmDelete(context);
                      },
                      itemBuilder: (_) => [
                        const PopupMenuItem(
                          value: 'delete',
                          child: Text('删除项目'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title.isNotEmpty
                          ? project.title
                          : _fallbackTitles[
                              project.id.hashCode.abs() %
                                  _fallbackTitles.length],
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: morandi.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (project.description.isNotEmpty)
                      Text(
                        project.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: morandi.muted,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      )
                    else
                      Text(
                        '暂无简介',
                        style: TextStyle(
                          fontSize: 12,
                          color: morandi.soft,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    const Spacer(),
                    Row(
                      children: [
                        _StatusChip(
                          label: project.genre.isNotEmpty
                              ? project.genre
                              : '未分类',
                          color: morandi.orangeLight,
                          textColor: morandi.orange,
                        ),
                        const SizedBox(width: 6),
                        _StatusChip(
                          label: _formatDate(project.updatedAt),
                          color: morandi.surface3,
                          textColor: morandi.muted,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) return '今天';
    if (diff.inDays == 1) return '昨天';
    if (diff.inDays < 7) return '${diff.inDays}天前';
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-'
        '${dt.day.toString().padLeft(2, '0')}';
  }

  void _confirmDelete(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('删除项目'),
        content: Text(
          '确定删除"${project.title}"吗？此操作不可撤销。',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<ProjectListBloc>().add(
                    ProjectListDeleteRequested(projectId: project.id),
                  );
              Navigator.of(dialogContext).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: morandi.red,
            ),
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.color,
    required this.textColor,
  });

  final String label;
  final Color color;
  final Color textColor;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 8,
          vertical: 3,
        ),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: textColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      );
}

class _AddProjectTile extends StatelessWidget {
  const _AddProjectTile();

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Container(
      decoration: BoxDecoration(
        color: morandi.canvas,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: morandi.line),
      ),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(AppRoutes.newProject),
        borderRadius: BorderRadius.circular(16),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.add_outlined,
                size: 36,
                color: morandi.soft.withOpacity(0.6),
              ),
              const SizedBox(height: 8),
              Text(
                '新建项目',
                style: TextStyle(
                  fontSize: 14,
                  color: morandi.muted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
