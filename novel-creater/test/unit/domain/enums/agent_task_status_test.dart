import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';

void main() {
  group('AgentTaskStatus', () {
    test('created can transition to queued', () {
      expect(
        AgentTaskStatus.created.canTransitionTo(AgentTaskStatus.queued),
        isTrue,
      );
    });

    test('queued can transition to running', () {
      expect(
        AgentTaskStatus.queued.canTransitionTo(AgentTaskStatus.running),
        isTrue,
      );
    });

    test('running can transition to succeeded', () {
      expect(
        AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.succeeded),
        isTrue,
      );
    });

    test('running can transition to failed', () {
      expect(
        AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.failed),
        isTrue,
      );
    });

    test('running can transition to cancelled', () {
      expect(
        AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.cancelled),
        isTrue,
      );
    });

    test('succeeded cannot transition to anything', () {
      for (final target in AgentTaskStatus.values) {
        if (target == AgentTaskStatus.succeeded) continue;
        expect(AgentTaskStatus.succeeded.canTransitionTo(target), isFalse);
      }
    });

    test('isTerminal is true for terminal states', () {
      expect(AgentTaskStatus.succeeded.isTerminal, isTrue);
      expect(AgentTaskStatus.failed.isTerminal, isTrue);
      expect(AgentTaskStatus.cancelled.isTerminal, isTrue);
      expect(AgentTaskStatus.created.isTerminal, isFalse);
    });
  });
}
