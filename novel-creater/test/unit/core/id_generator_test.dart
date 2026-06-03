import 'package:novel_creator/core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('IdGenerator', () {
    test('generates non-empty id', () {
      const generator = IdGenerator();
      final id = generator.generate();
      expect(id, isNotEmpty);
    });

    test('generates unique ids', () {
      const generator = IdGenerator();
      final ids = <String>{};
      for (var i = 0; i < 100; i++) {
        ids.add(generator.generate());
      }
      expect(ids.length, 100);
    });
  });
}
