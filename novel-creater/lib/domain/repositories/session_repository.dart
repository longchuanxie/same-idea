import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class SessionRepository {
  Future<AppResult<Session>> create(Session session);

  Future<AppResult<Session>> getById(String id);

  Future<AppResult<List<Session>>> listByProject(String projectId);

  Future<AppResult<List<Session>>> listByStatus(
    String projectId,
    SessionStatus status,
  );

  Future<AppResult<Session>> updateStatus({
    required String id,
    required SessionStatus status,
    String? summary,
  });

  Future<AppResult<void>> delete(String id);
}
