import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/agent_task.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/data/repositories/in_memory_agent_task_repository.dart';

void main() {
  group('InMemoryAgentTaskRepository', () {
    late InMemoryAgentTaskRepository repo;

    setUp(() {
      repo = InMemoryAgentTaskRepository();
    });

    AgentTask createTask({
      String id = 'task-1',
      String projectId = 'project-1',
      String taskType = 'continue_write',
      AgentTaskStatus status = AgentTaskStatus.created,
      String? chapterId,
      String? instruction,
    }) {
      return AgentTask(
        id: id,
        projectId: projectId,
        taskType: taskType,
        status: status,
        chapterId: chapterId,
        instruction: instruction,
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
    }

    group('create', () {
      test('creates a task and returns it', () async {
        final task = createTask();
        final result = await repo.create(task);

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull, task);
      });
    });

    group('getById', () {
      test('returns task by id', () async {
        final task = createTask();
        await repo.create(task);

        final result = await repo.getById('task-1');

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.id, 'task-1');
      });

      test('returns failure for missing task', () async {
        final result = await repo.getById('nonexistent');

        expect(result.isFailure, isTrue);
        expect(result.errorOrNull!.code, 'agent_task.not_found');
      });
    });

    group('listByProject', () {
      test('returns tasks for a project', () async {
        await repo.create(createTask(id: 'task-1', projectId: 'project-1'));
        await repo.create(createTask(id: 'task-2', projectId: 'project-1'));
        await repo.create(createTask(id: 'task-3', projectId: 'project-2'));

        final result = await repo.listByProject('project-1');

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.length, 2);
      });

      test('returns empty list for project with no tasks', () async {
        final result = await repo.listByProject('project-1');

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!, isEmpty);
      });
    });

    group('listByStatus', () {
      test('filters tasks by status within a project', () async {
        await repo.create(
          createTask(id: 'task-1', status: AgentTaskStatus.created),
        );
        await repo.create(
          createTask(id: 'task-2', status: AgentTaskStatus.queued),
        );
        await repo.create(
          createTask(
            id: 'task-3',
            projectId: 'project-2',
            status: AgentTaskStatus.created,
          ),
        );

        final result = await repo.listByStatus(
          'project-1',
          AgentTaskStatus.created,
        );

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.length, 1);
        expect(result.valueOrNull!.first.id, 'task-1');
      });
    });

    group('updateStatus', () {
      test('updates status with valid transition', () async {
        await repo.create(createTask());

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.queued,
        );

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.status, AgentTaskStatus.queued);
      });

      test('updates updatedAt timestamp', () async {
        await repo.create(createTask());
        final beforeUpdate = DateTime.utc(2026);

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.queued,
        );

        expect(result.isSuccess, isTrue);
        expect(
          result.valueOrNull!.updatedAt.isAfter(beforeUpdate) ||
              result.valueOrNull!.updatedAt.isAtSameMomentAs(beforeUpdate),
          isTrue,
        );
      });

      test('stores result on succeeded', () async {
        await repo.create(createTask());
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.queued);
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.running);

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.succeeded,
          result: 'Generated text',
        );

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.result, 'Generated text');
      });

      test('stores errorMessage on failed', () async {
        await repo.create(createTask());
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.queued);
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.running);

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.failed,
          errorMessage: 'Timeout',
        );

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull!.errorMessage, 'Timeout');
      });

      test('rejects invalid transition', () async {
        await repo.create(createTask());

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.succeeded,
        );

        expect(result.isFailure, isTrue);
        expect(
          result.errorOrNull!.code,
          'agent_task.invalid_transition',
        );
      });

      test('rejects transition from terminal state', () async {
        await repo.create(createTask());
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.queued);
        await repo.updateStatus(id: 'task-1', status: AgentTaskStatus.running);
        await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.succeeded,
        );

        final result = await repo.updateStatus(
          id: 'task-1',
          status: AgentTaskStatus.running,
        );

        expect(result.isFailure, isTrue);
        expect(
          result.errorOrNull!.code,
          'agent_task.invalid_transition',
        );
      });

      test('returns failure for missing task', () async {
        final result = await repo.updateStatus(
          id: 'nonexistent',
          status: AgentTaskStatus.queued,
        );

        expect(result.isFailure, isTrue);
        expect(result.errorOrNull!.code, 'agent_task.not_found');
      });
    });
  });
}
