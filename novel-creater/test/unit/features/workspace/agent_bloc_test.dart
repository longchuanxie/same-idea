import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/agent_bloc.dart';
import 'package:novel_creator/infra/llm/llm.dart';

void main() {
  final fixedNow = DateTime(2026, 6, 4, 11, 20);

  late _FakeSessionRepository sessionRepository;
  late _FakeAgentTaskRepository taskRepository;
  late AgentBloc bloc;

  AgentBloc createBloc(LlmClient llmClient) => AgentBloc(
        sessionRepository: sessionRepository,
        agentTaskRepository: taskRepository,
        llmClient: llmClient,
        idGenerator: const IdGenerator(),
        clock: FixedClock(fixedNow),
      );

  setUp(() {
    sessionRepository = _FakeSessionRepository();
    taskRepository = _FakeAgentTaskRepository();
    bloc = createBloc(const _SuccessLlmClient());
  });

  tearDown(() async {
    await bloc.close();
  });

  group('AgentBloc', () {
    test('started creates a default session when none exists', () async {
      bloc.add(const AgentStarted(projectId: 'project-1'));

      await bloc.stream.firstWhere((state) => !state.isLoading);

      expect(bloc.state.session, isNotNull);
      expect(bloc.state.session!.projectId, 'project-1');
      expect(sessionRepository.sessions.length, 1);
    });

    test('message submit persists user and assistant messages plus task',
        () async {
      bloc.add(const AgentStarted(projectId: 'project-1'));
      await bloc.stream.firstWhere((state) => !state.isLoading);

      bloc.add(const AgentMessageSubmitted(content: '帮我续写这一段'));
      await bloc.stream.firstWhere(
        (state) => state.tasks.any(
          (task) => task.status == AgentTaskStatus.succeeded,
        ),
      );

      final session = sessionRepository.sessions.values.single;
      expect(session.messages.length, 2);
      expect(session.messages.first.role, 'user');
      expect(session.messages.first.content, '帮我续写这一段');
      expect(session.messages.last.role, 'assistant');
      expect(session.messages.last.content, contains('Mocked answer'));

      final task = taskRepository.tasks.values.single;
      expect(task.status, AgentTaskStatus.succeeded);
      expect(task.model, 'mock-model');
      expect(task.tokenUsage?.completionTokens, greaterThan(0));
      expect(task.outputJson, contains('Mocked answer'));
    });

    test('llm failure marks task failed and does not append assistant message',
        () async {
      await bloc.close();
      bloc = createBloc(const _FailingLlmClient());

      final states = bloc.stream;
      bloc.add(const AgentStarted(projectId: 'project-1'));
      await states.firstWhere((state) => !state.isLoading);

      bloc.add(const AgentMessageSubmitted(content: '触发失败'));

      await bloc.stream.firstWhere(
        (state) => state.tasks.any(
          (task) => task.status == AgentTaskStatus.failed,
        ),
      );

      final session = sessionRepository.sessions.values.single;
      expect(session.messages.length, 1);
      expect(session.messages.single.role, 'user');
      expect(taskRepository.tasks.values.single.status, AgentTaskStatus.failed);
      expect(bloc.state.error, 'Mock LLM failed');
    });

    test('cancel task marks it cancelled without assistant side effect',
        () async {
      await bloc.close();
      final delayedClient = _DelayedLlmClient();
      bloc = createBloc(delayedClient);

      final states = bloc.stream;
      bloc.add(const AgentStarted(projectId: 'project-1'));
      await states.firstWhere((state) => !state.isLoading);

      bloc.add(const AgentMessageSubmitted(content: '开始一个长任务'));
      await bloc.stream.firstWhere((state) => state.isRunning);

      bloc.add(const AgentTaskCancelRequested());
      await bloc.stream.firstWhere(
        (state) => state.tasks.any(
          (task) => task.status == AgentTaskStatus.cancelled,
        ),
      );
      delayedClient.completeRequest();
      await Future<void>.delayed(Duration.zero);

      final session = sessionRepository.sessions.values.single;
      expect(session.messages.length, 1);
      expect(session.messages.single.role, 'user');
      expect(
        taskRepository.tasks.values.single.status,
        AgentTaskStatus.cancelled,
      );
    });
  });
}

class _FakeSessionRepository implements SessionRepository {
  final sessions = <String, Session>{};

  @override
  Future<AppResult<Session>> create(Session session) async {
    sessions[session.id] = session;
    return AppResult.success(session);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    sessions.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<Session>> getById(String id) async {
    final session = sessions[id];
    if (session == null) {
      return const AppResult.failure(_notFoundError);
    }
    return AppResult.success(session);
  }

  @override
  Future<AppResult<List<Session>>> getByProjectId(String projectId) async =>
      AppResult.success(
        sessions.values
            .where((session) => session.projectId == projectId)
            .toList(),
      );

  @override
  Future<AppResult<Session>> update(Session session) async {
    sessions[session.id] = session;
    return AppResult.success(session);
  }
}

class _FakeAgentTaskRepository implements AgentTaskRepository {
  final tasks = <String, AgentTask>{};

  @override
  Future<AppResult<AgentTask>> create(AgentTask task) async {
    tasks[task.id] = task;
    return AppResult.success(task);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    tasks.remove(id);
    return const AppResult.success(null);
  }

  @override
  Future<AppResult<List<AgentTask>>> getActiveByProjectId(
    String projectId,
  ) async =>
      AppResult.success(
        tasks.values
            .where(
              (task) => task.projectId == projectId && !task.status.isTerminal,
            )
            .toList(),
      );

  @override
  Future<AppResult<AgentTask>> getById(String id) async {
    final task = tasks[id];
    if (task == null) {
      return const AppResult.failure(_notFoundError);
    }
    return AppResult.success(task);
  }

  @override
  Future<AppResult<List<AgentTask>>> getByProjectId(String projectId) async =>
      AppResult.success(
        tasks.values.where((task) => task.projectId == projectId).toList(),
      );

  @override
  Future<AppResult<AgentTask>> update(AgentTask task) async {
    tasks[task.id] = task;
    return AppResult.success(task);
  }
}

class _SuccessLlmClient implements LlmClient {
  const _SuccessLlmClient();

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) async =>
      const AppResult.success(
        LlmResponse(
          content: 'Mocked answer',
          model: 'mock-model',
          tokenUsage: LlmTokenUsage(
            promptTokens: 5,
            completionTokens: 8,
          ),
        ),
      );

  @override
  Stream<AppResult<String>> streamComplete(LlmRequest request) async* {
    yield const AppResult.success('Mocked answer');
  }

  @override
  Future<AppResult<void>> testConnection(
    LlmProvider provider, {
    String? apiKey,
  }) async =>
      const AppResult.success(null);
}

class _FailingLlmClient extends _SuccessLlmClient {
  const _FailingLlmClient();

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) async =>
      const AppResult.failure(
        AppError(
          code: 'LLM_FAILED',
          message: 'mock failed',
          userMessage: 'Mock LLM failed',
          source: AppErrorSource.llm,
        ),
      );
}

class _DelayedLlmClient extends _SuccessLlmClient {
  final _completer = Completer<AppResult<LlmResponse>>();

  @override
  Future<AppResult<LlmResponse>> complete(LlmRequest request) =>
      _completer.future;

  void completeRequest() {
    if (_completer.isCompleted) return;
    _completer.complete(
      const AppResult.success(
        LlmResponse(
          content: 'Late answer',
          model: 'mock-model',
          tokenUsage: LlmTokenUsage(
            promptTokens: 5,
            completionTokens: 8,
          ),
        ),
      ),
    );
  }
}

const _notFoundError = AppError(
  code: 'NOT_FOUND',
  message: 'Not found',
  userMessage: 'Not found',
  recoverable: false,
  source: AppErrorSource.storage,
);
