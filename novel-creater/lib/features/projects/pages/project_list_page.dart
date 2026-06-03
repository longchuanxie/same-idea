import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';

class ProjectListPage extends StatelessWidget {
  const ProjectListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProjectListBloc(
        projectRepository: locator<ProjectRepository>(),
      )..add(ProjectListStarted()),
      child: _ProjectListView(),
    );
  }
}

class _ProjectListView extends StatelessWidget {
  const _ProjectListView();

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Novel Creator'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                context.read<ProjectListBloc>().add(ProjectListRefreshed()),
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: BlocBuilder<ProjectListBloc, ProjectListState>(
        builder: (context, state) {
          if (state.isLoading && state.projects.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error != null && state.projects.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline, size: 48, color: morandi.dustyRose),
                  const SizedBox(height: 16),
                  Text(state.error!, style: Theme.of(context).textTheme.bodyLarge),
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
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.menu_book_outlined, size: 64, color: morandi.stone),
                  const SizedBox(height: 16),
                  Text(
                    'Create your first novel',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: morandi.inkLight,
                        ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () =>
                        Navigator.of(context).pushNamed(AppRoutes.newProject),
                    icon: const Icon(Icons.add),
                    label: const Text('New Project'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context
                  .read<ProjectListBloc>()
                  .add(ProjectListRefreshed());
            },
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: state.projects.length,
              itemBuilder: (context, index) =>
                  _ProjectCard(project: state.projects[index]),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context).pushNamed(AppRoutes.newProject),
        tooltip: 'New Project',
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.project});

  final Project project;

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(
          AppRoutes.workspace,
          arguments: project.id,
        ),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (project.author.isNotEmpty) ...[
                          Icon(Icons.person_outline,
                              size: 14, color: morandi.inkLight),
                          const SizedBox(width: 4),
                          Text(
                            project.author,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: morandi.inkLight,
                                ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Icon(Icons.access_time,
                            size: 14, color: morandi.inkLight),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(project.updatedAt),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: morandi.inkLight,
                              ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.delete_outline, color: morandi.dustyRose, size: 20),
                onPressed: () => _confirmDelete(context),
                tooltip: 'Delete',
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  void _confirmDelete(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete Project'),
        content: Text('Are you sure you want to delete "${project.title}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              context
                  .read<ProjectListBloc>()
                  .add(ProjectListDeleteRequested(projectId: project.id));
              Navigator.of(dialogContext).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).extension<MorandiColors>()?.dustyRose,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
