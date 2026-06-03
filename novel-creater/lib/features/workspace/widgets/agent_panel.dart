import 'package:flutter/material.dart';
import 'package:novel_creator/app/app.dart';

class AgentPanel extends StatelessWidget {
  const AgentPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return Container(
      color: morandi.panel,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AgentHeader(morandi: morandi),
          _AgentTabs(morandi: morandi),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _UserBubble(morandi: morandi),
                  const SizedBox(height: 12),
                  _AgentBubble(morandi: morandi),
                  const SizedBox(height: 16),
                  _ToolStatusGrid(morandi: morandi),
                  const SizedBox(height: 16),
                  _ContextSummary(morandi: morandi),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: morandi.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: const Text('生成草稿', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AgentHeader extends StatelessWidget {
  const _AgentHeader({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: Row(
        children: [
          Text(
            'Agent',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: morandi.ink,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: morandi.green3,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: morandi.green,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  '在线',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: morandi.green),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AgentTabs extends StatelessWidget {
  const _AgentTabs({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    const tabs = ['脑暴', '调研', '骨架', '写作', '润色'];
    const activeIndex = 3;

    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: morandi.line)),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, index) {
          final isActive = index == activeIndex;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: isActive ? morandi.green3 : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isActive ? morandi.green : morandi.line,
              ),
            ),
            child: Center(
              child: Text(
                tabs[index],
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? morandi.green : morandi.muted,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _UserBubble extends StatelessWidget {
  const _UserBubble({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 220),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: morandi.panel2,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          '帮我续写下一段，主角进入了密室...',
          style: TextStyle(fontSize: 13, height: 1.5, color: morandi.text),
        ),
      ),
    );
  }
}

class _AgentBubble extends StatelessWidget {
  const _AgentBubble({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 240),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: morandi.canvas,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: morandi.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '好的，我来为这段情节续写。主角推开门，看到...',
              style: TextStyle(fontSize: 13, height: 1.5, color: morandi.text),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.schedule, size: 12, color: morandi.muted2),
                const SizedBox(width: 4),
                Text(
                  '正在生成...',
                  style: TextStyle(fontSize: 11, color: morandi.muted2),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ToolStatusGrid extends StatelessWidget {
  const _ToolStatusGrid({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '工具状态',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: morandi.ink),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            _ToolCell(label: '续写', statusColor: morandi.green, morandi: morandi),
            const SizedBox(width: 8),
            _ToolCell(label: '改写', statusColor: morandi.orange, morandi: morandi),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            _ToolCell(label: '扩写', statusColor: morandi.muted2, morandi: morandi),
            const SizedBox(width: 8),
            _ToolCell(label: '润色', statusColor: morandi.blue, morandi: morandi),
          ],
        ),
      ],
    );
  }
}

class _ToolCell extends StatelessWidget {
  const _ToolCell({
    required this.label,
    required this.statusColor,
    required this.morandi,
  });

  final String label;
  final Color statusColor;
  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: morandi.canvas,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: morandi.line),
        ),
        child: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: statusColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(fontSize: 12, color: morandi.text),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContextSummary extends StatelessWidget {
  const _ContextSummary({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: morandi.canvas,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: morandi.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '上下文摘要',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: morandi.ink),
          ),
          const SizedBox(height: 8),
          Text(
            '当前章节: 第三章 密室\n已使用角色: 林逸、陈教授\n场景: 古堡地下密室\n风格: 悬疑/冒险',
            style: TextStyle(fontSize: 12, height: 1.6, color: morandi.muted),
          ),
        ],
      ),
    );
  }
}
