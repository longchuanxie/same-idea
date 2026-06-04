import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/agent_bloc.dart';

class AgentPanel extends StatefulWidget {
  const AgentPanel({super.key});

  @override
  State<AgentPanel> createState() => _AgentPanelState();
}

class _AgentPanelState extends State<AgentPanel> {
  final _inputController = TextEditingController();

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    context.read<AgentBloc>().add(
          AgentMessageSubmitted(content: text),
        );
    _inputController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;

    return BlocBuilder<AgentBloc, AgentState>(
      builder: (context, state) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AgentHead(morandi: morandi, state: state),
          _AgentTabs(
            morandi: morandi,
            mode: state.mode,
            onModeChanged: (mode) => context.read<AgentBloc>().add(
                  AgentModeChanged(mode: mode),
                ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (state.isLoading)
                    _MutedText(morandi: morandi, text: '正在载入 Agent 会话...'),
                  if (!state.isLoading && state.messages.isEmpty)
                    _EmptyConversation(morandi: morandi),
                  ...state.messages.map(
                    (message) => _Bubble(
                      morandi: morandi,
                      isUser: message.role == 'user',
                      text: message.content,
                      time: _formatTime(message.createdAt),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _MiniCard(
                    morandi: morandi,
                    title: '任务状态',
                    child:
                        _TaskStatusList(morandi: morandi, tasks: state.tasks),
                  ),
                  const SizedBox(height: 10),
                  _MiniCard(
                    morandi: morandi,
                    title: '上下文摘要',
                    child: _MutedText(
                      morandi: morandi,
                      text: state.session == null
                          ? '尚未创建会话。'
                          : '当前会话包含 ${state.messages.length} 条消息。 '
                              '后续将接入章节、角色、设定与笔记上下文。',
                    ),
                  ),
                  const SizedBox(height: 10),
                  _MiniCard(
                    morandi: morandi,
                    title: '参考与来源',
                    child: _MutedText(
                      morandi: morandi,
                      text: '尚未使用外部资料。联网搜索会在后续阶段加入用户确认。',
                    ),
                  ),
                  if (state.error != null) ...[
                    const SizedBox(height: 10),
                    _ErrorCard(morandi: morandi, message: state.error!),
                  ],
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: state.isRunning ? null : _sendMessage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: morandi.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      state.isRunning ? '生成中...' : '生成建议',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (state.isRunning) ...[
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () => context.read<AgentBloc>().add(
                            const AgentTaskCancelRequested(),
                          ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: morandi.line),
                        backgroundColor: morandi.surface.withOpacity(0.72),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      child: Text(
                        '取消任务',
                        style: TextStyle(
                          fontSize: 13,
                          color: morandi.text,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          _AgentInput(
            morandi: morandi,
            controller: _inputController,
            onSend: _sendMessage,
            enabled: !state.isRunning,
          ),
        ],
      ),
    );
  }
}

class _AgentHead extends StatelessWidget {
  const _AgentHead({required this.morandi, required this.state});

  final MorandiColors morandi;
  final AgentState state;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
        child: Row(
          children: [
            Text(
              'Agent',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: morandi.ink,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              state.isRunning ? '运行中' : '就绪',
              style: TextStyle(
                fontSize: 13,
                color: state.isRunning ? morandi.orange : morandi.green,
              ),
            ),
            const Spacer(),
            Icon(
              Icons.more_horiz,
              size: 18,
              color: morandi.muted,
            ),
          ],
        ),
      );
}

class _AgentTabs extends StatelessWidget {
  const _AgentTabs({
    required this.morandi,
    required this.mode,
    required this.onModeChanged,
  });

  final MorandiColors morandi;
  final String mode;
  final ValueChanged<String> onModeChanged;

  static const List<(String, String)> _tabs = [
    ('brainstorm', '脑暴'),
    ('research', '调研'),
    ('outline', '骨架'),
    ('writing', '写作'),
    ('polish', '润色'),
    ('ask', '问答'),
  ];

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ..._tabs.map((tab) {
              final isActive = mode == tab.$1;
              return GestureDetector(
                onTap: () => onModeChanged(tab.$1),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isActive ? morandi.greenLight : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isActive ? morandi.green : morandi.line,
                    ),
                  ),
                  child: Text(
                    tab.$2,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                      color: isActive ? morandi.green : morandi.muted,
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      );
}

class _Bubble extends StatelessWidget {
  const _Bubble({
    required this.morandi,
    required this.isUser,
    required this.text,
    required this.time,
  });

  final MorandiColors morandi;
  final bool isUser;
  final String text;
  final String time;

  @override
  Widget build(BuildContext context) => Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 280),
          margin: const EdgeInsets.symmetric(vertical: 5),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isUser ? morandi.surface3 : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: morandi.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!isUser)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    'AI',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: morandi.greenDark,
                    ),
                  ),
                ),
              Text(
                text,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.65,
                  color: morandi.text,
                ),
              ),
              const SizedBox(height: 4),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  time,
                  style: TextStyle(
                    fontSize: 11,
                    color: morandi.muted,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

class _MiniCard extends StatelessWidget {
  const _MiniCard({
    required this.morandi,
    required this.title,
    required this.child,
  });

  final MorandiColors morandi;
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: morandi.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: morandi.ink,
              ),
            ),
            const SizedBox(height: 10),
            child,
          ],
        ),
      );
}

class _TaskStatusList extends StatelessWidget {
  const _TaskStatusList({required this.morandi, required this.tasks});

  final MorandiColors morandi;
  final List<AgentTask> tasks;

  @override
  Widget build(BuildContext context) {
    if (tasks.isEmpty) {
      return _MutedText(morandi: morandi, text: '暂无任务。');
    }

    return Column(
      children: tasks.take(4).map((task) {
        final status = _statusLabel(task.status);
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _statusColor(task.status, morandi),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${task.taskType.name} · $status',
                  style: TextStyle(
                    fontSize: 12,
                    color: morandi.text,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _statusLabel(AgentTaskStatus status) => switch (status) {
        AgentTaskStatus.created => '已创建',
        AgentTaskStatus.queued => '排队中',
        AgentTaskStatus.running => '运行中',
        AgentTaskStatus.succeeded => '已完成',
        AgentTaskStatus.failed => '失败',
        AgentTaskStatus.cancelled => '已取消',
      };

  Color _statusColor(AgentTaskStatus status, MorandiColors morandi) =>
      switch (status) {
        AgentTaskStatus.created => morandi.muted,
        AgentTaskStatus.queued => morandi.orange,
        AgentTaskStatus.running => morandi.orange,
        AgentTaskStatus.succeeded => morandi.green,
        AgentTaskStatus.failed => morandi.red,
        AgentTaskStatus.cancelled => morandi.muted,
      };
}

class _EmptyConversation extends StatelessWidget {
  const _EmptyConversation({required this.morandi});

  final MorandiColors morandi;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: morandi.greenLight.withOpacity(0.42),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: morandi.line),
        ),
        child: _MutedText(
          morandi: morandi,
          text: '可以先让 Agent 帮你分析章节、生成建议或梳理设定。所有正文修改都会在后续修订阶段进入审核，不会静默覆盖正文。',
        ),
      );
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.morandi, required this.message});

  final MorandiColors morandi;
  final String message;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: morandi.red.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: morandi.red.withOpacity(0.25)),
        ),
        child: Text(
          message,
          style: TextStyle(
            fontSize: 12,
            height: 1.5,
            color: morandi.red,
          ),
        ),
      );
}

class _MutedText extends StatelessWidget {
  const _MutedText({required this.morandi, required this.text});

  final MorandiColors morandi;
  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: TextStyle(
          fontSize: 13,
          height: 1.6,
          color: morandi.muted,
        ),
      );
}

class _AgentInput extends StatelessWidget {
  const _AgentInput({
    required this.morandi,
    required this.controller,
    required this.onSend,
    required this.enabled,
  });

  final MorandiColors morandi;
  final TextEditingController controller;
  final VoidCallback onSend;
  final bool enabled;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
        decoration: BoxDecoration(
          color: morandi.canvas,
          border: Border(top: BorderSide(color: morandi.line)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                enabled: enabled,
                style: TextStyle(
                  fontSize: 13,
                  color: morandi.text,
                ),
                decoration: InputDecoration(
                  hintText: '向 Agent 提问',
                  hintStyle: TextStyle(
                    fontSize: 13,
                    color: morandi.muted,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: morandi.line),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: morandi.line),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: morandi.green),
                  ),
                  isDense: true,
                ),
                maxLines: 4,
                minLines: 1,
                onSubmitted: (_) => onSend(),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 44,
              height: 42,
              child: ElevatedButton(
                onPressed: enabled ? onSend : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: morandi.green,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Icon(
                  Icons.check,
                  size: 18,
                ),
              ),
            ),
          ],
        ),
      );
}

String _formatTime(DateTime? time) {
  if (time == null) return '--:--';
  return '${time.hour.toString().padLeft(2, '0')}:'
      '${time.minute.toString().padLeft(2, '0')}';
}
