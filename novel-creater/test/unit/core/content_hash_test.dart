import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/content_hash.dart';

void main() {
  group('contentHash', () {
    test('is stable for equal content', () {
      final firstHash = contentHash('same content');
      final secondHash = contentHash('same content');

      expect(firstHash, equals(secondHash));
    });

    test('changes for different content', () {
      final firstHash = contentHash('first content');
      final secondHash = contentHash('second content');

      expect(firstHash, isNot(equals(secondHash)));
    });
  });
}
