import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';
import 'package:novel_creator/domain/repositories/session_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemorySessionRepository implements SessionRepository {
  final Map<String, Session> _sessions = <String, Session>{};

  @override
  Future<AppResult<Session>> create(Session session) async {
    _sessions[session.id] = session;
    return AppResult<Session>.success(session);
  }

  @override
  Future<AppResult<Session>> getById(String id) async {
    final session = _sessions[id];
    if (session == null) {
      return const AppResult<Session>.failure(
        AppError(
          code: 'session.not_found',
          message: 'Session was not found.',
          userMessage: '未找到会话记录。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新会话列表后重试。',
        ),
      );
    }
    return AppResult<Session>.success(session);
  }

  @override
  Future<AppResult<List<Session>>> listByProject(String projectId) async {
    final sessions = _sessions.values
        .where((s) => s.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<Session>>.success(
      List<Session>.unmodifiable(sessions),
    );
  }

  @override
  Future<AppResult<List<Session>>> listByStatus(
    String projectId,
    SessionStatus status,
  ) async {
    final sessions = _sessions.values
        .where((s) => s.projectId == projectId && s.status == status)
        .toList(growable: false);
    return AppResult<List<Session>>.success(
      List<Session>.unmodifiable(sessions),
    );
  }

  @override
  Future<AppResult<Session>> updateStatus({
    required String id,
    required SessionStatus status,
    String? summary,
  }) async {
    final session = _sessions[id];
    if (session == null) {
      return const AppResult<Session>.failure(
        AppError(
          code: 'session.not_found',
          message: 'Session was not found.',
          userMessage: '未找到会话记录，无法更新状态。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新会话列表后重试。',
        ),
      );
    }

    final validationError = session.validateTransition(status);
    if (validationError != null) {
      return AppResult<Session>.failure(
        AppError(
          code: 'session.invalid_transition',
          message: validationError,
          userMessage: '会话状态转换无效：$validationError',
          source: AppErrorSource.storage,
          recoverable: false,
        ),
      );
    }

    final updated = session.copyWith(
      status: status,
      summary: summary,
      updatedAt: DateTime.now().toUtc(),
    );
    _sessions[id] = updated;
    return AppResult<Session>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _sessions.remove(id);
    return AppResult<void>.success(null);
  }
}
