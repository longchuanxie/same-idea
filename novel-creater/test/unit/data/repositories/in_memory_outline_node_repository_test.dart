import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_outline_node_repository.dart';
import 'package:novel_creator/domain/entities/outline_node.dart';

void main() {
  group('InMemoryOutlineNodeRepository', () {
    late InMemoryOutlineNodeRepository repo;

    setUp(() {
      repo = InMemoryOutlineNodeRepository();
    });

    final now = DateTime.now().toUtc();

    test('create and get node', () async {
      final node = OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Act I',
        createdAt: now,
        updatedAt: now,
      );
      final createResult = await repo.create(node);
      expect(createResult.isSuccess, isTrue);

      final getResult = await repo.get('on_1');
      expect(getResult.isSuccess, isTrue);
      expect(getResult.valueOrNull?.title, 'Act I');
    });

    test('list returns nodes for project', () async {
      await repo.create(OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'A',
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(OutlineNode(
        id: 'on_2',
        projectId: 'proj_1',
        title: 'B',
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(OutlineNode(
        id: 'on_3',
        projectId: 'proj_2',
        title: 'C',
        createdAt: now,
        updatedAt: now,
      ));
      final result = await repo.list('proj_1');
      expect(result.valueOrNull?.length, 2);
    });

    test('listChildren returns children of parent', () async {
      await repo.create(OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Parent',
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(OutlineNode(
        id: 'on_2',
        projectId: 'proj_1',
        title: 'Child 1',
        parentId: 'on_1',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(OutlineNode(
        id: 'on_3',
        projectId: 'proj_1',
        title: 'Child 2',
        parentId: 'on_1',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      ));
      final result = await repo.listChildren('on_1');
      expect(result.valueOrNull?.length, 2);
    });

    test('update node', () async {
      await repo.create(OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'Old',
        createdAt: now,
        updatedAt: now,
      ));
      final node = (await repo.get('on_1')).valueOrNull!;
      final updated = node.copyWith(title: 'New');
      final result = await repo.update(updated);
      expect(result.isSuccess, isTrue);
      expect(result.valueOrNull?.title, 'New');
    });

    test('delete node', () async {
      await repo.create(OutlineNode(
        id: 'on_1',
        projectId: 'proj_1',
        title: 'ToDelete',
        createdAt: now,
        updatedAt: now,
      ));
      final result = await repo.delete('on_1');
      expect(result.isSuccess, isTrue);
      final getResult = await repo.get('on_1');
      expect(getResult.valueOrNull, isNull);
    });

    test('update missing node returns failure', () async {
      final node = OutlineNode(
        id: 'missing',
        projectId: 'proj_1',
        title: 'Ghost',
        createdAt: now,
        updatedAt: now,
      );
      final result = await repo.update(node);
      expect(result.isFailure, isTrue);
    });
  });
}
