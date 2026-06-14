import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/event_bus.dart';
import 'package:novel_creator/domain/events/domain_events.dart';

void main() {
  group('AppEventBus', () {
    late AppEventBus bus;

    setUp(() {
      bus = AppEventBus();
    });

    tearDown(() async {
      await bus.dispose();
    });

    test('publishes and receives events', () async {
      final events = <DomainEvent>[];
      bus.stream.listen(events.add);

      bus.publish(ProjectCreated(projectId: 'p1', projectName: 'Test'));
      bus.publish(RevisionCreated(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'));

      await Future<void>.delayed(Duration.zero);
      expect(events.length, 2);
    });

    test('filters by event type', () async {
      final revisions = <RevisionCreated>[];
      bus.on<RevisionCreated>().listen(revisions.add);

      bus.publish(ProjectCreated(projectId: 'p1', projectName: 'Test'));
      bus.publish(RevisionCreated(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'));

      await Future<void>.delayed(Duration.zero);
      expect(revisions.length, 1);
      expect(revisions.first.revisionId, 'r1');
    });

    test('filters by project id', () async {
      final events = <DomainEvent>[];
      bus.forProject('p1').listen(events.add);

      bus.publish(ProjectCreated(projectId: 'p1', projectName: 'A'));
      bus.publish(ProjectCreated(projectId: 'p2', projectName: 'B'));

      await Future<void>.delayed(Duration.zero);
      expect(events.length, 1);
    });

    test('filters by type and project id', () async {
      final events = <RevisionCreated>[];
      bus.onForProject<RevisionCreated>('p1').listen(events.add);

      bus.publish(RevisionCreated(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'));
      bus.publish(RevisionCreated(projectId: 'p2', revisionId: 'r2', chapterId: 'c2'));
      bus.publish(ProjectCreated(projectId: 'p1', projectName: 'A'));

      await Future<void>.delayed(Duration.zero);
      expect(events.length, 1);
      expect(events.first.revisionId, 'r1');
    });

    test('does not publish after dispose', () async {
      final events = <DomainEvent>[];
      bus.stream.listen(events.add);

      await bus.dispose();
      bus.publish(ProjectCreated(projectId: 'p1', projectName: 'Test'));

      await Future<void>.delayed(Duration.zero);
      expect(events, isEmpty);
    });

    test('all 12 event types are constructable', () {
      // Verify all events can be instantiated
      expect(
        ProjectCreated(projectId: 'p1', projectName: 'A'),
        isA<ProjectCreated>(),
      );
      expect(
        ChapterContentChanged(projectId: 'p1', chapterId: 'c1', chapterTitle: 'T'),
        isA<ChapterContentChanged>(),
      );
      expect(
        RevisionCreated(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'),
        isA<RevisionCreated>(),
      );
      expect(
        RevisionAccepted(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'),
        isA<RevisionAccepted>(),
      );
      expect(
        RevisionRejected(projectId: 'p1', revisionId: 'r1', chapterId: 'c1'),
        isA<RevisionRejected>(),
      );
      expect(
        CharacterUpdated(projectId: 'p1', characterId: 'ch1', characterName: 'A'),
        isA<CharacterUpdated>(),
      );
      expect(
        NoteCreated(projectId: 'p1', noteId: 'n1', noteTitle: 'T'),
        isA<NoteCreated>(),
      );
      expect(
        AgentTaskStarted(projectId: 'p1', taskId: 't1', taskType: 'write'),
        isA<AgentTaskStarted>(),
      );
      expect(
        AgentTaskCompleted(projectId: 'p1', taskId: 't1', taskType: 'write'),
        isA<AgentTaskCompleted>(),
      );
      expect(
        AgentTaskFailed(projectId: 'p1', taskId: 't1', taskType: 'write', errorMessage: 'err'),
        isA<AgentTaskFailed>(),
      );
      expect(
        SnapshotCreated(projectId: 'p1', snapshotId: 's1'),
        isA<SnapshotCreated>(),
      );
      expect(
        ExportCompleted(projectId: 'p1', format: 'txt', filePath: '/tmp/out.txt'),
        isA<ExportCompleted>(),
      );
    });
  });
}
