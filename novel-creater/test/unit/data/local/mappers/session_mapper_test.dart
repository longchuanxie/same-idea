import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/session.dart';
import 'package:novel_creator/domain/enums/session_status.dart';

void main() {
  group('SessionMapper', () {
    test('status enum name round-trips correctly', () {
      for (final status in SessionStatus.values) {
        final name = status.name;
        final restored = SessionStatus.values.byName(name);
        expect(restored, status, reason: '$status should round-trip');
      }
    });

    test('entity serializes with all fields', () {
      final entity = Session(
        id: 'session-1',
        projectId: 'project-1',
        title: 'Writing session',
        status: SessionStatus.paused,
        chapterId: 'chapter-1',
        agentMode: 'writing',
        summary: 'Wrote 2000 words',
        startedAt: DateTime.utc(2026, 1, 1, 10),
        endedAt: DateTime.utc(2026, 1, 1, 12),
        createdAt: DateTime.utc(2026, 1, 1),
        updatedAt: DateTime.utc(2026, 1, 2),
        schemaVersion: 1,
      );

      final json = entity.toJson();
      final restored = Session.fromJson(json);

      expect(restored, entity);
      expect(restored.status, SessionStatus.paused);
      expect(restored.chapterId, 'chapter-1');
      expect(restored.agentMode, 'writing');
      expect(restored.summary, 'Wrote 2000 words');
    });

    test('entity handles nullable fields as null', () {
      final entity = Session(
        id: 'session-2',
        projectId: 'project-1',
        title: 'New session',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final json = entity.toJson();
      final restored = Session.fromJson(json);

      expect(restored.chapterId, isNull);
      expect(restored.agentMode, isNull);
      expect(restored.summary, isNull);
      expect(restored.startedAt, isNull);
      expect(restored.endedAt, isNull);
    });

    test('entity handles completed session', () {
      final entity = Session(
        id: 'session-3',
        projectId: 'project-1',
        title: 'Done',
        status: SessionStatus.completed,
        summary: 'Finished chapter 1',
        createdAt: DateTime.utc(2026),
        updatedAt: DateTime.utc(2026),
      );

      final json = entity.toJson();
      final restored = Session.fromJson(json);

      expect(restored.status, SessionStatus.completed);
      expect(restored.summary, 'Finished chapter 1');
    });
  });
}
