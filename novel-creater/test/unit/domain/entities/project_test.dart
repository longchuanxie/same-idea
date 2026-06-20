import 'package:novel_creator/domain/domain.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Project', () {
    test('creates with required fields', () {
      final now = DateTime.now();
      final project = Project(
        id: 'p1',
        title: 'Test Novel',
        createdAt: now,
        updatedAt: now,
      );
      expect(project.id, 'p1');
      expect(project.title, 'Test Novel');
      expect(project.language, 'zh');
      expect(project.schemaVersion, 1);
      expect(project.tags, isEmpty);
    });

    test('serializes to and from JSON', () {
      final now = DateTime.now();
      final project = Project(
        id: 'p1',
        title: 'Test Novel',
        author: 'Author',
        createdAt: now,
        updatedAt: now,
      );
      final json = project.toJson();
      final restored = Project.fromJson(json);
      expect(restored.id, project.id);
      expect(restored.title, project.title);
      expect(restored.author, project.author);
    });
  });
}
