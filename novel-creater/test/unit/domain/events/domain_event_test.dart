import 'package:novel_creator/domain/domain.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('DomainEvent', () {
    test('ProjectCreated holds correct data', () {
      final now = DateTime.now();
      final event = DomainEvent.projectCreated(
        projectId: 'p1',
        occurredAt: now,
      );
      event.when(
        projectCreated: (projectId, occurredAt) {
          expect(projectId, 'p1');
          expect(occurredAt, now);
        },
        chapterContentChanged: (_, __, ___) => fail('Wrong event type'),
        revisionCreated: (_, __, ___, ____) => fail('Wrong event type'),
        revisionAccepted: (_, __, ___, ____) => fail('Wrong event type'),
        revisionRejected: (_, __, ___, ____) => fail('Wrong event type'),
        characterUpdated: (_, __, ___) => fail('Wrong event type'),
        noteCreated: (_, __, ___) => fail('Wrong event type'),
        agentTaskStarted: (_, __, ___) => fail('Wrong event type'),
        agentTaskCompleted: (_, __, ___) => fail('Wrong event type'),
        agentTaskFailed: (_, __, ___) => fail('Wrong event type'),
        snapshotCreated: (_, __, ___) => fail('Wrong event type'),
        exportCompleted: (_, __, ___) => fail('Wrong event type'),
      );
    });

    test('AgentTaskCompleted holds correct data', () {
      final now = DateTime.now();
      final event = DomainEvent.agentTaskCompleted(
        agentTaskId: 't1',
        projectId: 'p1',
        occurredAt: now,
      );
      event.when(
        projectCreated: (_, __) => fail('Wrong event type'),
        chapterContentChanged: (_, __, ___) => fail('Wrong event type'),
        revisionCreated: (_, __, ___, ____) => fail('Wrong event type'),
        revisionAccepted: (_, __, ___, ____) => fail('Wrong event type'),
        revisionRejected: (_, __, ___, ____) => fail('Wrong event type'),
        characterUpdated: (_, __, ___) => fail('Wrong event type'),
        noteCreated: (_, __, ___) => fail('Wrong event type'),
        agentTaskStarted: (_, __, ___) => fail('Wrong event type'),
        agentTaskCompleted: (agentTaskId, projectId, occurredAt) {
          expect(agentTaskId, 't1');
          expect(projectId, 'p1');
          expect(occurredAt, now);
        },
        agentTaskFailed: (_, __, ___) => fail('Wrong event type'),
        snapshotCreated: (_, __, ___) => fail('Wrong event type'),
        exportCompleted: (_, __, ___) => fail('Wrong event type'),
      );
    });
  });
}
