import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/infra/llm/llm.dart';

part 'agent_event.dart';
part 'agent_state.dart';

class AgentBloc extends Bloc<AgentEvent, AgentState> {
  AgentBloc({
    required SessionRepository sessionRepository,
    required AgentTaskRepository agentTaskRepository,
    required LlmClient llmClient,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _sessionRepository = sessionRepository,
        _agentTaskRepository = agentTaskRepository,
        _llmClient = llmClient,
        _idGenerator = idGenerator,
        _clock = clock,
        super(const AgentState()) {
    on<AgentStarted>(_onStarted);
    on<AgentModeChanged>(_onModeChanged);
    on<AgentMessageSubmitted>(_onMessageSubmitted);
    on<AgentTaskCancelRequested>(_onTaskCancelRequested);
  }

  final SessionRepository _sessionRepository;
  final AgentTaskRepository _agentTaskRepository;
  final LlmClient _llmClient;
  final IdGenerator _idGenerator;
  final AppClock _clock;
  final Set<String> _cancelledTaskIds = {};

  Future<void> _onStarted(
    AgentStarted event,
    Emitter<AgentState> emit,
  ) async {
    emit(
      state.copyWith(
        projectId: event.projectId,
        isLoading: true,
        clearError: true,
      ),
    );

    final sessionResult = await _loadOrCreateSession(event.projectId);
    if (sessionResult.isFailure) {
      emit(
        state.copyWith(
          isLoading: false,
          error: sessionResult.maybeFailure?.userMessage,
        ),
      );
      return;
    }

    final tasksResult =
        await _agentTaskRepository.getByProjectId(event.projectId);
    if (tasksResult.isFailure) {
      emit(
        state.copyWith(
          isLoading: false,
          error: tasksResult.maybeFailure?.userMessage,
        ),
      );
      return;
    }

    emit(
      state.copyWith(
        session: sessionResult.maybeSuccess,
        tasks: _sortTasks(tasksResult.maybeSuccess!),
        isLoading: false,
        clearError: true,
      ),
    );
  }

  void _onModeChanged(
    AgentModeChanged event,
    Emitter<AgentState> emit,
  ) {
    emit(state.copyWith(mode: event.mode));
  }

  Future<void> _onMessageSubmitted(
    AgentMessageSubmitted event,
    Emitter<AgentState> emit,
  ) async {
    final content = event.content.trim();
    if (content.isEmpty || state.isRunning) return;

    final projectId = state.projectId;
    if (projectId == null) {
      emit(state.copyWith(error: 'Project is not ready'));
      return;
    }

    final session = await _ensureSession(projectId);
    if (session == null) {
      emit(state.copyWith(error: 'Failed to prepare agent session'));
      return;
    }

    final now = _clock.now();
    final taskId = _idGenerator.generate();
    final userMessage = SessionMessage(
      id: _idGenerator.generate(),
      role: 'user',
      content: content,
      createdAt: now,
      agentTaskId: taskId,
    );
    final nextSession = session.copyWith(
      messages: [...session.messages, userMessage],
      updatedAt: now,
    );
    final task = AgentTask(
      id: taskId,
      projectId: projectId,
      taskType: _taskTypeForMode(state.mode),
      status: AgentTaskStatus.queued,
      inputJson: jsonEncode({
        'mode': state.mode,
        'content': content,
        'sessionId': session.id,
      }),
      createdAt: now,
      updatedAt: now,
    );

    final sessionResult = await _sessionRepository.update(nextSession);
    if (sessionResult.isFailure) {
      emit(state.copyWith(error: sessionResult.maybeFailure?.userMessage));
      return;
    }
    final taskResult = await _agentTaskRepository.create(task);
    if (taskResult.isFailure) {
      emit(state.copyWith(error: taskResult.maybeFailure?.userMessage));
      return;
    }

    emit(
      state.copyWith(
        session: sessionResult.maybeSuccess,
        tasks: _upsertTask(state.tasks, taskResult.maybeSuccess!),
        isRunning: true,
        activeTaskId: taskId,
        clearError: true,
      ),
    );

    final runningTask = task.copyWith(
      status: AgentTaskStatus.running,
      startedAt: now,
      updatedAt: now,
    );
    await _persistTask(runningTask, emit);

    final response = await _llmClient.complete(
      LlmRequest(
        provider: _mockProvider(now),
        messages: [
          const LlmMessage(
            role: LlmMessageRole.system,
            content: 'You are a careful novel writing assistant.',
          ),
          ...nextSession.messages.map(
            (message) => LlmMessage(
              role: message.role == 'user'
                  ? LlmMessageRole.user
                  : LlmMessageRole.assistant,
              content: message.content,
            ),
          ),
        ],
      ),
    );

    if (_cancelledTaskIds.remove(taskId)) {
      await _finishCancelledTask(runningTask, emit);
      return;
    }

    if (response.isFailure) {
      await _finishFailedTask(
        runningTask,
        response.maybeFailure?.userMessage ?? 'Agent task failed',
        emit,
      );
      return;
    }

    await _finishSucceededTask(
      sessionResult.maybeSuccess!,
      runningTask,
      response.maybeSuccess!,
      emit,
    );
  }

  Future<void> _onTaskCancelRequested(
    AgentTaskCancelRequested event,
    Emitter<AgentState> emit,
  ) async {
    final activeTask = state.activeTask;
    if (activeTask == null || activeTask.isTerminal) return;

    _cancelledTaskIds.add(activeTask.id);
    await _finishCancelledTask(activeTask, emit);
  }

  Future<AppResult<Session>> _loadOrCreateSession(String projectId) async {
    final sessionsResult = await _sessionRepository.getByProjectId(projectId);
    if (sessionsResult.isFailure) {
      return AppResult.failure(sessionsResult.maybeFailure!);
    }

    final sessions = sessionsResult.maybeSuccess!
        .where((session) => !session.archived)
        .toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    if (sessions.isNotEmpty) {
      return AppResult.success(sessions.first);
    }

    final now = _clock.now();
    return _sessionRepository.create(
      Session(
        id: _idGenerator.generate(),
        projectId: projectId,
        title: 'Default agent session',
        createdAt: now,
        updatedAt: now,
      ),
    );
  }

  Future<Session?> _ensureSession(String projectId) async {
    if (state.session != null) {
      return state.session;
    }
    final result = await _loadOrCreateSession(projectId);
    return result.maybeSuccess;
  }

  Future<void> _persistTask(
    AgentTask task,
    Emitter<AgentState> emit,
  ) async {
    final result = await _agentTaskRepository.update(task);
    if (result.isSuccess) {
      emit(
        state.copyWith(
          tasks: _upsertTask(state.tasks, result.maybeSuccess!),
        ),
      );
    }
  }

  Future<void> _finishSucceededTask(
    Session session,
    AgentTask task,
    LlmResponse response,
    Emitter<AgentState> emit,
  ) async {
    final now = _clock.now();
    final assistantMessage = SessionMessage(
      id: _idGenerator.generate(),
      role: 'assistant',
      content: response.content,
      createdAt: now,
      agentTaskId: task.id,
    );
    final updatedSession = session.copyWith(
      messages: [...session.messages, assistantMessage],
      updatedAt: now,
    );
    final updatedTask = task.copyWith(
      status: AgentTaskStatus.succeeded,
      outputJson: jsonEncode({
        'content': response.content,
        'model': response.model,
      }),
      model: response.model,
      tokenUsage: TokenUsage(
        promptTokens: response.tokenUsage.promptTokens,
        completionTokens: response.tokenUsage.completionTokens,
        isEstimated: response.tokenUsage.isEstimated,
      ),
      completedAt: now,
      updatedAt: now,
    );

    final sessionResult = await _sessionRepository.update(updatedSession);
    final taskResult = await _agentTaskRepository.update(updatedTask);
    emit(
      state.copyWith(
        session: sessionResult.maybeSuccess ?? updatedSession,
        tasks: _upsertTask(state.tasks, taskResult.maybeSuccess ?? updatedTask),
        isRunning: false,
        clearActiveTaskId: true,
        clearError: true,
      ),
    );
  }

  Future<void> _finishFailedTask(
    AgentTask task,
    String error,
    Emitter<AgentState> emit,
  ) async {
    final now = _clock.now();
    final updatedTask = task.copyWith(
      status: AgentTaskStatus.failed,
      error: error,
      completedAt: now,
      updatedAt: now,
    );
    final result = await _agentTaskRepository.update(updatedTask);
    emit(
      state.copyWith(
        tasks: _upsertTask(state.tasks, result.maybeSuccess ?? updatedTask),
        isRunning: false,
        clearActiveTaskId: true,
        error: error,
      ),
    );
  }

  Future<void> _finishCancelledTask(
    AgentTask task,
    Emitter<AgentState> emit,
  ) async {
    final now = _clock.now();
    final updatedTask = task.copyWith(
      status: AgentTaskStatus.cancelled,
      completedAt: now,
      updatedAt: now,
    );
    final result = await _agentTaskRepository.update(updatedTask);
    emit(
      state.copyWith(
        tasks: _upsertTask(state.tasks, result.maybeSuccess ?? updatedTask),
        isRunning: false,
        clearActiveTaskId: true,
      ),
    );
  }

  List<AgentTask> _upsertTask(
    List<AgentTask> tasks,
    AgentTask task,
  ) {
    final next = List<AgentTask>.from(tasks);
    final index = next.indexWhere((item) => item.id == task.id);
    if (index == -1) {
      next.add(task);
    } else {
      next[index] = task;
    }
    return _sortTasks(next);
  }

  List<AgentTask> _sortTasks(List<AgentTask> tasks) =>
      [...tasks]..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

  AgentTaskType _taskTypeForMode(String mode) => switch (mode) {
        'writing' => AgentTaskType.write,
        'polish' => AgentTaskType.polish,
        'research' => AgentTaskType.search,
        _ => AgentTaskType.brainstorm,
      };

  LlmProvider _mockProvider(DateTime now) => LlmProvider(
        id: 'mock-local',
        displayName: 'Mock LLM',
        baseUrl: 'mock://local',
        createdAt: now,
        updatedAt: now,
      );
}
