import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/chapter_tree_bloc.dart';
import 'package:novel_creator/features/workspace/models/workspace_view.dart';

class ChapterTreeSidebar extends StatelessWidget {
  const ChapterTreeSidebar({
    required this.currentView,
    required this.onViewSelected,
    required this.onChapterSelected,
    super.key,
  });

  final WorkspaceView currentView;
  final ValueChanged<WorkspaceView> onViewSelected;
  final ValueChanged<String> onChapterSelected;

  static const _topViews = [
    WorkspaceView.overview,
    WorkspaceView.outline,
    WorkspaceView.editor,
    WorkspaceView.research,
    WorkspaceView.revision,
    WorkspaceView.agentTasks,
    WorkspaceView.pendingChanges,
  ];

  static const _knowledgeViews = [
    WorkspaceView.characters,
    WorkspaceView.world,
    WorkspaceView.notes,
    WorkspaceView.sessions,
  ];

  static const _systemViews = [
    WorkspaceView.export,
    WorkspaceView.backup,
    WorkspaceView.settings,
  ];

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _BrandRow(morandi: morandi),
        _ProjectCard(morandi: morandi),
        _SearchLine(morandi: morandi),
        Expanded(
          child: BlocBuilder<ChapterTreeBloc, ChapterTreeState>(
            builder: (context, state) {
              if (state.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              return ListView(
                padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
                children: [
                  ..._topViews.map(_buildMenuItem),
                  if (state.chapters.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _TreeSection(
                      morandi: morandi,
                      title: '章节列表',
                      count: state.chapters.length,
                      chapters: state.chapters,
                      selectedChapterId: state.selectedChapterId,
                      onChapterSelected: onChapterSelected,
                    ),
                  ],
                  _SectionLabel(label: '知识库', morandi: morandi),
                  ..._knowledgeViews.map(_buildMenuItem),
                  _SectionLabel(label: '项目', morandi: morandi),
                  ..._systemViews.map(_buildMenuItem),
                ],
              );
            },
          ),
        ),
        _LeftFooter(
          morandi: morandi,
          onSettingsTap: () => onViewSelected(WorkspaceView.settings),
        ),
      ],
    );
  }

  Widget _buildMenuItem(WorkspaceView view) => Builder(
        builder: (context) {
          final morandi = Theme.of(context).extension<MorandiColors>()!;
          return _MenuItem(
            morandi: morandi,
            icon: view.icon,
            label: view.shortLabel,
            isActive: currentView == view,
            onTap: () => onViewSelected(view),
          );
        },
      );
}

class _BrandRow extends StatelessWidget {
  const _BrandRow({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
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
      );
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) =>
      BlocBuilder<ChapterTreeBloc, ChapterTreeState>(
        builder: (context, state) {
          final totalWords = state.chapters.fold<int>(
            0,
            (sum, chapter) => sum + chapter.wordCount,
          );
          final totalChapters = state.chapters.length;
          final progress = totalChapters > 0 ? 0.62 : 0.0;

          return Container(
            margin: const EdgeInsets.fromLTRB(12, 14, 12, 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: morandi.surface.withOpacity(0.58),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: morandi.line),
              boxShadow: const [
                BoxShadow(
                  color: Color(0xB3FFFFFF),
                  offset: Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 76,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Color(0xD9819496),
                        Color(0xFA384347),
                        Color(0xFF1F2528),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              state.projectTitle ?? '当前项目',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: morandi.ink,
                              ),
                            ),
                          ),
                          _ProjectBadge(morandi: morandi),
                        ],
                      ),
                      const SizedBox(height: 7),
                      Text(
                        '字数 $totalWords · 章节 $totalChapters',
                        style: TextStyle(
                          fontSize: 12,
                          color: morandi.muted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          SizedBox(
                            width: 34,
                            child: Text(
                              '进度',
                              style: TextStyle(
                                fontSize: 12,
                                color: morandi.muted,
                              ),
                            ),
                          ),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(99),
                              child: Container(
                                height: 4,
                                color: const Color(0xFFDED9CF),
                                child: FractionallySizedBox(
                                  alignment: Alignment.centerLeft,
                                  widthFactor: progress,
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      color: morandi.green,
                                      borderRadius: BorderRadius.circular(99),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${(progress * 100).toInt()}%',
                            style: TextStyle(
                              fontSize: 12,
                              color: morandi.muted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
}

class _ProjectBadge extends StatelessWidget {
  const _ProjectBadge({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: morandi.greenLight,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          '进行中',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: morandi.greenDark,
          ),
        ),
      );
}

class _SearchLine extends StatelessWidget {
  const _SearchLine({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
        child: Row(
          children: [
            Expanded(
              child: Container(
                height: 36,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: morandi.surface.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: morandi.line),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, size: 16, color: Color(0xFF8A897F)),
                    SizedBox(width: 8),
                    Text(
                      '搜索（Ctrl K）',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF8A897F),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 6),
            _SquareButton(
              morandi: morandi,
              icon: Icons.tune_outlined,
              onTap: () {},
            ),
            const SizedBox(width: 6),
            _SquareButton(
              morandi: morandi,
              icon: Icons.add,
              onTap: () {
                final state = context.read<ChapterTreeBloc>().state;
                final projectId = state.chapters.isNotEmpty
                    ? state.chapters.first.projectId
                    : state.projectId;
                if (projectId == null) return;
                context.read<ChapterTreeBloc>().add(
                      ChapterTreeChapterAdded(projectId: projectId),
                    );
              },
            ),
          ],
        ),
      );
}

class _SquareButton extends StatelessWidget {
  const _SquareButton({
    required this.morandi,
    required this.icon,
    required this.onTap,
  });

  final MorandiColors morandi;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: morandi.surface.withOpacity(0.55),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: morandi.line),
          ),
          child: Icon(icon, size: 16, color: const Color(0xFF535851)),
        ),
      );
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label, required this.morandi});

  final String label;
  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(10, 14, 10, 6),
        child: Text(
          label,
          style: TextStyle(
            color: morandi.muted,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      );
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.morandi,
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final MorandiColors morandi;
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          height: 36,
          margin: const EdgeInsets.symmetric(vertical: 2),
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: isActive ? morandi.greenTint : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isActive ? morandi.greenLight : Colors.transparent,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color: isActive ? morandi.greenDark : const Color(0xFF555952),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                    color:
                        isActive ? morandi.greenDark : const Color(0xFF555952),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

class _TreeSection extends StatelessWidget {
  const _TreeSection({
    required this.morandi,
    required this.title,
    required this.count,
    required this.chapters,
    required this.selectedChapterId,
    required this.onChapterSelected,
  });

  final MorandiColors morandi;
  final String title;
  final int count;
  final List<Chapter> chapters;
  final String? selectedChapterId;
  final ValueChanged<String> onChapterSelected;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Row(
              children: [
                const Icon(
                  Icons.menu_book_outlined,
                  size: 15,
                  color: Color(0xFF444943),
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF444943),
                  ),
                ),
                const Spacer(),
                Text(
                  '$count',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF7D7E76),
                  ),
                ),
              ],
            ),
          ),
          ...chapters.asMap().entries.map((entry) {
            final index = entry.key;
            final chapter = entry.value;
            final isActive = chapter.id == selectedChapterId;
            return _ChapterRow(
              label: '第${index + 1}章  ${chapter.title}',
              isActive: isActive,
              onTap: () => onChapterSelected(chapter.id),
            );
          }),
        ],
      );
}

class _ChapterRow extends StatelessWidget {
  const _ChapterRow({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          height: 30,
          margin: const EdgeInsets.symmetric(vertical: 1),
          padding: const EdgeInsets.fromLTRB(32, 0, 10, 0),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFFDFE8DA) : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    color: isActive
                        ? const Color(0xFF365738)
                        : const Color(0xFF555952),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isActive)
                const Icon(
                  Icons.more_horiz,
                  size: 16,
                  color: Color(0xFF6F726B),
                ),
            ],
          ),
        ),
      );
}

class _LeftFooter extends StatelessWidget {
  const _LeftFooter({
    required this.morandi,
    required this.onSettingsTap,
  });

  final MorandiColors morandi;
  final VoidCallback onSettingsTap;

  @override
  Widget build(BuildContext context) => Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: morandi.line)),
        ),
        child: Row(
          children: [
            _TinyIcon(
              icon: Icons.settings_outlined,
              onTap: onSettingsTap,
            ),
            _TinyIcon(icon: Icons.help_outline, onTap: () {}),
            _TinyIcon(icon: Icons.wb_sunny_outlined, onTap: () {}),
            const Spacer(),
            _TinyIcon(icon: Icons.chevron_left, onTap: () {}),
          ],
        ),
      );
}

class _TinyIcon extends StatelessWidget {
  const _TinyIcon({
    required this.icon,
    required this.onTap,
  });

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 28,
          height: 28,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(9)),
          child: Icon(icon, size: 16, color: const Color(0xFF666A62)),
        ),
      );
}
