import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';

void main() {
  group('AgentTask', () {
    test('keeps required fields and defaults to created status', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);

      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      expect(task.id, 'task-1');
      expect(task.projectId, 'project-1');
      expect(task.taskType, 'continue_write');
      expect(task.createdAt, createdAt);
      expect(task.updatedAt, updatedAt);
      expect(task.schemaVersion, 1);
      expect(task.status, AgentTaskStatus.created);
      expect(task.chapterId, isNull);
      expect(task.instruction, isNull);
      expect(task.result, isNull);
      expect(task.errorMessage, isNull);
    });

    test('accepts optional fields', () {
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'rewrite',
        chapterId: 'chapter-1',
        instruction: 'Rewrite this paragraph',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(task.chapterId, 'chapter-1');
      expect(task.instruction, 'Rewrite this paragraph');
    });

    test('serializes to and from json', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        chapterId: 'chapter-1',
        instruction: 'Continue the story',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      final restored = AgentTask.fromJson(task.toJson());

      expect(restored, task);
    });

    test('serializes with result and errorMessage', () {
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        status: AgentTaskStatus.succeeded,
        result: 'Generated text here',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final restored = AgentTask.fromJson(task.toJson());

      expect(restored.result, 'Generated text here');
      expect(restored.status, AgentTaskStatus.succeeded);
    });
  });

  group('AgentTask state machine', () {
    test('isTerminal returns false for non-terminal states', () {
      for (final status in [
        AgentTaskStatus.created,
        AgentTaskStatus.queued,
        AgentTaskStatus.running,
      ]) {
        final task = AgentTask(
          id: 'task-1',
          projectId: 'project-1',
          taskType: 'continue_write',
          status: status,
          createdAt: DateTime.utc(2026),
          updatedAt: DateTime.utc(2026),
        );
        expect(task.isTerminal, isFalse, reason: '$status should not be terminal');
      }
    });

    test('isTerminal returns true for terminal states', () {
      for (final status in [
        AgentTaskStatus.succeeded,
        AgentTaskStatus.failed,
        AgentTaskStatus.cancelled,
      ]) {
        final task = AgentTask(
          id: 'task-1',
          projectId: 'project-1',
          taskType: 'continue_write',
          status: status,
          createdAt: DateTime.utc(2026),
          updatedAt: DateTime.utc(2026),
        );
        expect(task.isTerminal, isTrue, reason: '$status should be terminal');
      }
    });

    test('valid transition: created -> queued', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.created,
        AgentTaskStatus.queued,
      ), isTrue);
    });

    test('valid transition: queued -> running', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.queued,
        AgentTaskStatus.running,
      ), isTrue);
    });

    test('valid transition: queued -> cancelled', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.queued,
        AgentTaskStatus.cancelled,
      ), isTrue);
    });

    test('valid transition: running -> succeeded', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.running,
        AgentTaskStatus.succeeded,
      ), isTrue);
    });

    test('valid transition: running -> failed', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.running,
        AgentTaskStatus.failed,
      ), isTrue);
    });

    test('valid transition: running -> cancelled', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.running,
        AgentTaskStatus.cancelled,
      ), isTrue);
    });

    test('invalid transition: created -> running (skip queued)', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.created,
        AgentTaskStatus.running,
      ), isFalse);
    });

    test('invalid transition: created -> succeeded (skip queued and running)', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.created,
        AgentTaskStatus.succeeded,
      ), isFalse);
    });

    test('invalid transition: succeeded -> running (terminal state)', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.succeeded,
        AgentTaskStatus.running,
      ), isFalse);
    });

    test('invalid transition: failed -> running (terminal state)', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.failed,
        AgentTaskStatus.running,
      ), isFalse);
    });

    test('invalid transition: cancelled -> queued (terminal state)', () {
      expect(isValidAgentTaskTransition(
        AgentTaskStatus.cancelled,
        AgentTaskStatus.queued,
      ), isFalse);
    });

    test('validateTransition returns null for valid transition', () {
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      expect(task.validateTransition(AgentTaskStatus.queued), isNull);
    });

    test('validateTransition returns error message for invalid transition', () {
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      final error = task.validateTransition(AgentTaskStatus.succeeded);
      expect(error, isNotNull);
      expect(error, contains('Invalid transition'));
    });

    test('validateTransition returns null for same status', () {
      final task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      expect(task.validateTransition(AgentTaskStatus.created), isNull);
    });

    test('full happy path: created -> queued -> running -> succeeded', () {
      var task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(task.status, AgentTaskStatus.created);

      task = task.copyWith(status: AgentTaskStatus.queued);
      expect(task.status, AgentTaskStatus.queued);

      task = task.copyWith(status: AgentTaskStatus.running);
      expect(task.status, AgentTaskStatus.running);

      task = task.copyWith(
        status: AgentTaskStatus.succeeded,
        result: 'Generated text',
      );
      expect(task.status, AgentTaskStatus.succeeded);
      expect(task.result, 'Generated text');
      expect(task.isTerminal, isTrue);
    });

    test('failure path: created -> queued -> running -> failed', () {
      var task = AgentTask(
        id: 'task-1',
        projectId: 'project-1',
        taskType: 'continue_write',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      task = task.copyWith(status: AgentTaskStatus.queued);
      task = task.copyWith(status: AgentTaskStatus.running);
      task = task.copyWith(
        status: AgentTaskStatus.failed,
        errorMessage: 'Connection timeout',
      );

      expect(task.status, AgentTaskStatus.failed);
      expect(task.errorMessage, 'Connection timeout');
      expect(task.isTerminal, isTrue);
    });
  });
}
