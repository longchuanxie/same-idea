import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/revision_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';

void main() {
  late AppDatabase db;
  late RevisionRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    repository = RevisionRepositoryImpl(db);
  });

  tearDown(() async {
    await db.close();
  });

  Revision _createRevision({
    required String id,
    String projectId = 'p1',
    String chapterId = 'ch1',
    RevisionStatus status = RevisionStatus.pending,
    RevisionOperation operation = RevisionOperation.insert,
  }) {
    final now = DateTime.now();
    return Revision(
      id: id,
      projectId: projectId,
      chapterId: chapterId,
      operation: operation,
      anchor: const RevisionAnchor(
        type: AnchorType.cursor,
        offset: 0,
      ),
      beforeText: '',
      afterText: 'Generated text',
      status: status,
      createdAt: now,
      updatedAt: now,
    );
  }

  group('RevisionRepository', () {
    test('create and getById', () async {
      final revision = _createRevision(id: 'r1');
      final createResult = await repository.create(revision);
      expect(createResult.isSuccess, isTrue);

      final getResult = await repository.getById('r1');
      expect(getResult.isSuccess, isTrue);
      getResult.when(
        success: (r) {
          expect(r.id, 'r1');
          expect(r.projectId, 'p1');
          expect(r.chapterId, 'ch1');
          expect(r.operation, RevisionOperation.insert);
          expect(r.status, RevisionStatus.pending);
          expect(r.beforeText, '');
          expect(r.afterText, 'Generated text');
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('getByChapterId returns revisions for a chapter', () async {
      await repository.create(_createRevision(id: 'r1', chapterId: 'ch1'));
      await repository.create(_createRevision(id: 'r2', chapterId: 'ch1'));
      await repository.create(_createRevision(id: 'r3', chapterId: 'ch2'));

      final result = await repository.getByChapterId('ch1');
      expect(result.isSuccess, isTrue);
      result.when(
        success: (revisions) {
          expect(revisions.length, 2);
          expect(revisions.every((r) => r.chapterId == 'ch1'), isTrue);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('getPendingByProjectId returns only pending revisions', () async {
      await repository.create(_createRevision(
        id: 'r1',
        projectId: 'p1',
        status: RevisionStatus.pending,
      ));
      await repository.create(_createRevision(
        id: 'r2',
        projectId: 'p1',
        status: RevisionStatus.accepted,
      ));
      await repository.create(_createRevision(
        id: 'r3',
        projectId: 'p1',
        status: RevisionStatus.pending,
      ));
      await repository.create(_createRevision(
        id: 'r4',
        projectId: 'p2',
        status: RevisionStatus.pending,
      ));

      final result = await repository.getPendingByProjectId('p1');
      expect(result.isSuccess, isTrue);
      result.when(
        success: (revisions) {
          expect(revisions.length, 2);
          expect(revisions.every((r) => r.status == RevisionStatus.pending), isTrue);
          expect(revisions.every((r) => r.projectId == 'p1'), isTrue);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('update changes status from pending to accepted', () async {
      await repository.create(_createRevision(id: 'r1', status: RevisionStatus.pending));

      final updated = _createRevision(id: 'r1', status: RevisionStatus.accepted);
      final updateResult = await repository.update(updated);
      expect(updateResult.isSuccess, isTrue);

      final getResult = await repository.getById('r1');
      getResult.when(
        success: (r) => expect(r.status, RevisionStatus.accepted),
        failure: (_) => fail('Should not fail'),
      );
    });

    test('delete removes revision', () async {
      await repository.create(_createRevision(id: 'r1'));

      await repository.delete('r1');

      final result = await repository.getById('r1');
      expect(result.isFailure, isTrue);
    });
  });
}
