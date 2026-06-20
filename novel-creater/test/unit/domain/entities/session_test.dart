import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';

void main() {
  group('Session', () {
    test('keeps required fields and defaults to active status', () {
      final createdAt = DateTime.utc(2026);
      final updatedAt = DateTime.utc(2026, 1, 2);

      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Writing session',
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

      expect(session.id, 'session-1');
      expect(session.projectId, 'project-1');
      expect(session.title, 'Writing session');
      expect(session.createdAt, createdAt);
      expect(session.updatedAt, updatedAt);
      expect(session.schemaVersion, 1);
      expect(session.status, SessionStatus.active);
      expect(session.chapterId, isNull);
      expect(session.agentMode, isNull);
      expect(session.summary, isNull);
      expect(session.startedAt, isNull);
      expect(session.endedAt, isNull);
    });

    test('accepts optional fields', () {
      final startedAt = DateTime.utc(2026, 1, 1, 10);
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Writing session',
        chapterId: 'chapter-1',
        agentMode: 'writing',
        summary: 'Wrote 2000 words',
        startedAt: startedAt,
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(session.chapterId, 'chapter-1');
      expect(session.agentMode, 'writing');
      expect(session.summary, 'Wrote 2000 words');
      expect(session.startedAt, startedAt);
    });

    test('serializes to and from json', () {
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Writing session',
        chapterId: 'chapter-1',
        agentMode: 'writing',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026, 1, 2),
      );

      final restored = Session.fromJson(session.toJson());

      expect(restored, session);
    });

    test('serializes with all nullable fields', () {
      final session = Session(
        id: 'session-2',
        projectId: 'project-1',
        title: 'Another session',
        status: SessionStatus.completed,
        summary: 'Done',
        startedAt: DateTime.utc(2026, 1, 1),
        endedAt: DateTime.utc(2026, 1, 2),
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final restored = Session.fromJson(session.toJson());

      expect(restored.status, SessionStatus.completed);
      expect(restored.summary, 'Done');
      expect(restored.startedAt, DateTime.utc(2026, 1, 1));
      expect(restored.endedAt, DateTime.utc(2026, 1, 2));
    });
  });

  group('Session state machine', () {
    test('isTerminal returns false for non-terminal states', () {
      for (final status in [
        SessionStatus.active,
        SessionStatus.paused,
        SessionStatus.completed,
      ]) {
        final session = Session(
          id: 'session-1',
          projectId: 'project-1',
          title: 'Test',
          status: status,
          createdAt: DateTime.utc(2026),
          updatedAt: DateTime.utc(2026),
        );
        expect(session.isTerminal, isFalse, reason: '$status should not be terminal');
      }
    });

    test('isTerminal returns true for archived', () {
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Test',
        status: SessionStatus.archived,
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      expect(session.isTerminal, isTrue);
    });

    test('valid transition: active -> paused', () {
      expect(isValidSessionTransition(
        SessionStatus.active,
        SessionStatus.paused,
      ), isTrue);
    });

    test('valid transition: active -> completed', () {
      expect(isValidSessionTransition(
        SessionStatus.active,
        SessionStatus.completed,
      ), isTrue);
    });

    test('valid transition: active -> archived', () {
      expect(isValidSessionTransition(
        SessionStatus.active,
        SessionStatus.archived,
      ), isTrue);
    });

    test('valid transition: paused -> active (resume)', () {
      expect(isValidSessionTransition(
        SessionStatus.paused,
        SessionStatus.active,
      ), isTrue);
    });

    test('valid transition: paused -> completed', () {
      expect(isValidSessionTransition(
        SessionStatus.paused,
        SessionStatus.completed,
      ), isTrue);
    });

    test('valid transition: paused -> archived', () {
      expect(isValidSessionTransition(
        SessionStatus.paused,
        SessionStatus.archived,
      ), isTrue);
    });

    test('valid transition: completed -> archived', () {
      expect(isValidSessionTransition(
        SessionStatus.completed,
        SessionStatus.archived,
      ), isTrue);
    });

    test('invalid transition: active -> active (same state)', () {
      // Same-state transitions are handled by validateTransition returning null
      // isValidSessionTransition does not check same state
      expect(isValidSessionTransition(
        SessionStatus.active,
        SessionStatus.active,
      ), isFalse);
    });

    test('invalid transition: completed -> active', () {
      expect(isValidSessionTransition(
        SessionStatus.completed,
        SessionStatus.active,
      ), isFalse);
    });

    test('invalid transition: archived -> active (terminal)', () {
      expect(isValidSessionTransition(
        SessionStatus.archived,
        SessionStatus.active,
      ), isFalse);
    });

    test('invalid transition: archived -> paused (terminal)', () {
      expect(isValidSessionTransition(
        SessionStatus.archived,
        SessionStatus.paused,
      ), isFalse);
    });

    test('validateTransition returns null for valid transition', () {
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Test',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      expect(session.validateTransition(SessionStatus.paused), isNull);
    });

    test('validateTransition returns error message for invalid transition', () {
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Test',
        status: SessionStatus.archived,
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      final error = session.validateTransition(SessionStatus.active);
      expect(error, isNotNull);
      expect(error, contains('Invalid transition'));
    });

    test('validateTransition returns null for same status', () {
      final session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Test',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );
      expect(session.validateTransition(SessionStatus.active), isNull);
    });

    test('full happy path: active -> paused -> active -> completed -> archived', () {
      var session = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Test',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      expect(session.status, SessionStatus.active);

      session = session.copyWith(status: SessionStatus.paused);
      expect(session.status, SessionStatus.paused);

      session = session.copyWith(status: SessionStatus.active);
      expect(session.status, SessionStatus.active);

      session = session.copyWith(
        status: SessionStatus.completed,
        summary: 'Wrote 5000 words',
      );
      expect(session.status, SessionStatus.completed);
      expect(session.summary, 'Wrote 5000 words');

      session = session.copyWith(status: SessionStatus.archived);
      expect(session.status, SessionStatus.archived);
      expect(session.isTerminal, isTrue);
    });
  });
}
