import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/app/widgets/app_modal.dart';
import 'package:novel_creator/app/widgets/app_toast.dart';
import 'package:novel_creator/app/widgets/empty_hero_widget.dart';
import 'package:novel_creator/domain/entities/project.dart';
import 'package:novel_creator/features/projects/bloc/project_list_bloc.dart';
import 'package:novel_creator/features/projects/bloc/project_list_event.dart';
import 'package:novel_creator/features/projects/bloc/project_list_state.dart';

class ProjectListPage extends StatelessWidget {
  const ProjectListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProjectListBloc, ProjectListState>(
      builder: (context, state) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final text = isDark ? MorandiColors.darkText : MorandiColors.text;
        final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
        final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
        final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
        final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
        final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
        final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

        return Scaffold(
          backgroundColor: bg,
          body: CustomScrollView(
            slivers: <Widget>[
              // 顶部导航栏
              SliverAppBar(
                pinned: true,
                backgroundColor: surface,
                foregroundColor: text,
                title: Text(
                  'Novel Creator',
                  style: AppTypography.title(
                    color: text,
                    weight: AppTypography.weightBold,
                  ),
                ),
                actions: <Widget>[
                  IconButton(
                    icon: Icon(LucideIcons.settings, size: AppSpacing.iconMedium),
                    onPressed: () => Navigator.of(context).pushNamed('/settings'),
                    tooltip: '设置',
                  ),
                ],
              ),
              // 标题行
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.workspacePadding,
                    AppSpacing.xl,
                    AppSpacing.workspacePadding,
                    0,
                  ),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          '我的项目',
                          style: AppTypography.headline(color: text),
                        ),
                      ),
                      FilledButton.icon(
                        onPressed: () => _showCreateDialog(context),
                        icon: Icon(LucideIcons.plus, size: 16, color: Colors.white),
                        label: Text(
                          '新建项目',
                          style: AppTypography.small(
                            color: Colors.white,
                            weight: AppTypography.weightBold,
                          ),
                        ),
                        style: FilledButton.styleFrom(
                          backgroundColor: green,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // 内容区
              if (state.isLoading)
                SliverFillRemaining(
                  child: _buildLoadingSkeleton(isDark),
                )
              else if (state.projects.isEmpty)
                SliverToBoxAdapter(
                  child: _buildEmptyState(context, isDark),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.workspacePadding),
                  sliver: SliverList.separated(
                    itemCount: state.projects.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.lg),
                    itemBuilder: (context, index) =>
                        _buildProjectCard(context, state.projects[index], isDark),
                  ),
                ),
              // 错误提示
              if (state.error != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.workspacePadding),
                    child: Text(
                      state.error!.userMessage,
                      style: AppTypography.body(color: MorandiColors.danger),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  /// 加载中骨架屏
  Widget _buildLoadingSkeleton(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.workspacePadding),
      child: Column(
        children: [
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              3,
              (_) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: SkeletonCard(width: 200, height: 120, isDark: isDark),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 空状态：插图 + 标题 + 描述 + CTA + 模板网格 + 骨架屏指标
  Widget _buildEmptyState(BuildContext context, bool isDark) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final surface2 = isDark ? MorandiColors.darkSurface2 : MorandiColors.surface2;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.workspacePadding),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // 空状态面板（带虚线装饰边框）
          Container(
            padding: const EdgeInsets.symmetric(vertical: 42, horizontal: 32),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Stack(
              children: [
                // 虚线装饰边框
                Positioned.fill(
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: CustomPaint(
                      painter: _DashedBorderPainter(
                        color: line,
                        radius: AppRadius.md,
                      ),
                    ),
                  ),
                ),
                // 内容
                Column(
                  children: [
                    // 插图
                    _EmptyIllustration(isDark: isDark),
                    const SizedBox(height: 18),
                    Text(
                      '从一个故事种子开始',
                      style: AppTypography.headline(color: text),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 560),
                      child: Text(
                        '创建长篇项目开始你的写作旅程，或从模板快速启动。Agent 会根据上下文给出续写、改写和润色建议，所有修改经你审核后生效。',
                        style: AppTypography.body(color: muted),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 22),
                    // 双按钮 CTA
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        FilledButton(
                          onPressed: () => _showCreateDialog(context),
                          style: FilledButton.styleFrom(
                            backgroundColor: green,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 10,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.bookOpen, size: 16, color: Colors.white),
                              const SizedBox(width: 7),
                              Text(
                                '创建长篇项目',
                                style: AppTypography.small(
                                  color: Colors.white,
                                  weight: AppTypography.weightBold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton(
                          onPressed: () {
                            AppToast.show(context, message: '导入功能开发中', type: ToastType.info);
                          },
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: line),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(LucideIcons.upload, size: 16, color: muted),
                              const SizedBox(width: 7),
                              Text(
                                '导入文稿',
                                style: AppTypography.small(
                                  color: muted,
                                  weight: AppTypography.weightBold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          // 模板网格
          Row(
            children: [
              _TemplateCard(
                icon: LucideIcons.building2,
                title: '都市悬疑',
                description: '案件线索、角色动机、反转节奏。',
                isDark: isDark,
                onTap: () => _createFromTemplate(context, '都市悬疑'),
              ),
              const SizedBox(width: 12),
              _TemplateCard(
                icon: LucideIcons.castle,
                title: '奇幻群像',
                description: '多阵营、地图、势力冲突。',
                isDark: isDark,
                onTap: () => _createFromTemplate(context, '奇幻群像'),
              ),
              const SizedBox(width: 12),
              _TemplateCard(
                icon: LucideIcons.orbit,
                title: '科幻纪元',
                description: '设定规则、技术树、主线任务。',
                isDark: isDark,
                onTap: () => _createFromTemplate(context, '科幻纪元'),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // 骨架屏指标区
          Row(
            children: List.generate(
              3,
              (_) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: SkeletonCard(height: 122, isDark: isDark),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildProjectCard(BuildContext context, Project project, bool isDark) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: BorderSide(color: line),
      ),
      color: surface,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () => _openProject(context, project.id),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.cardPadding),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      project.name,
                      style: AppTypography.title(color: text),
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (project.description.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        project.description,
                        style: AppTypography.small(color: muted),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 6),
                    Text(
                      _formatDate(project.updatedAt),
                      style: AppTypography.caption(color: muted),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(
                  LucideIcons.trash2,
                  size: 18,
                  color: MorandiColors.danger.withOpacity(0.7),
                ),
                onPressed: () => _confirmDelete(context, project.id, project.name),
                tooltip: '删除项目',
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openProject(BuildContext context, String projectId) {
    Navigator.of(context).pushNamed('/workspace', arguments: projectId);
  }

  void _confirmDelete(BuildContext context, String projectId, String projectName) {
    AppModal.confirm(
      context: context,
      title: '删除项目',
      message: '确定要删除项目「$projectName」吗？此操作不可撤销。',
      confirmLabel: '删除',
      isDanger: true,
    ).then((confirmed) {
      if (confirmed) {
        context.read<ProjectListBloc>().add(ProjectListDeleted(projectId));
        AppToast.show(context, message: '已删除项目「$projectName」');
      }
    });
  }

  void _showCreateDialog(BuildContext context) {
    AppModal.createProject(context: context).then((name) {
      if (name != null) {
        context.read<ProjectListBloc>().add(ProjectListCreated(name: name));
        AppToast.show(context, message: '已创建项目「$name」');
      }
    });
  }

  void _createFromTemplate(BuildContext context, String templateName) {
    context.read<ProjectListBloc>().add(ProjectListCreated(name: templateName));
    AppToast.show(context, message: '已从模板创建项目「$templateName」');
  }

  String _formatDate(DateTime dt) {
    final y = dt.year;
    final m = dt.month.toString().padLeft(2, '0');
    final d = dt.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}

/// 空状态插图：三个浮动卡片 + 书本形状
class _EmptyIllustration extends StatelessWidget {
  const _EmptyIllustration({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;

    return SizedBox(
      height: 146,
      width: 330,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // 书本形状
          Positioned(
            bottom: 8,
            child: Container(
              width: 168,
              height: 96,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [MorandiColors.darkGreen3, MorandiColors.darkSurface2]
                      : [MorandiColors.green3, MorandiColors.surface2],
                ),
                border: Border.all(color: line),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 35,
                    offset: const Offset(0, 18),
                  ),
                ],
              ),
              child: Center(
                child: Container(
                  width: 1,
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  color: line,
                ),
              ),
            ),
          ),
          // 浮动卡片 1（左下，旋转 -8°）
          Positioned(
            left: 18,
            top: 50,
            child: Transform.rotate(
              angle: -0.14,
              child: _FloatingCard(
                icon: LucideIcons.feather,
                isDark: isDark,
              ),
            ),
          ),
          // 浮动卡片 2（中上，无旋转）
          Positioned(
            left: 134,
            top: 7,
            child: _FloatingCard(
              icon: LucideIcons.sparkles,
              isDark: isDark,
            ),
          ),
          // 浮动卡片 3（右下，旋转 9°）
          Positioned(
            right: 20,
            top: 52,
            child: Transform.rotate(
              angle: 0.16,
              child: _FloatingCard(
                icon: LucideIcons.penTool,
                isDark: isDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 浮动卡片
class _FloatingCard extends StatelessWidget {
  const _FloatingCard({
    required this.icon,
    required this.isDark,
  });

  final IconData icon;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;

    return Container(
      width: 62,
      height: 62,
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: line),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 32,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Icon(icon, size: 24, color: green),
    );
  }
}

/// 模板卡片
class _TemplateCard extends StatelessWidget {
  const _TemplateCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isDark,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: line),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, size: 26, color: green),
                  const SizedBox(height: 9),
                  Text(title, style: AppTypography.title(color: text, weight: AppTypography.weightBold)),
                  const SizedBox(height: 5),
                  Text(description, style: AppTypography.small(color: muted)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 虚线边框画笔
class _DashedBorderPainter extends CustomPainter {
  _DashedBorderPainter({
    required this.color,
    required this.radius,
  });

  final Color color;
  final double radius;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final rect = Offset.zero & size;
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(radius));

    // 使用虚线绘制圆角矩形
    final path = Path()..addRRect(rrect);
    _drawDashedPath(canvas, path, paint);
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint) {
    const dashWidth = 5.0;
    const dashSpace = 3.0;

    final metrics = path.computeMetrics();
    for (final metric in metrics) {
      double distance = 0;
      while (distance < metric.length) {
        final length = dashWidth;
        if (distance + length > metric.length) {
          canvas.drawPath(
            metric.extractPath(distance, metric.length),
            paint,
          );
        } else {
          canvas.drawPath(
            metric.extractPath(distance, distance + length),
            paint,
          );
        }
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedBorderPainter oldDelegate) =>
      color != oldDelegate.color || radius != oldDelegate.radius;
}
