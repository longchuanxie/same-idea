import 'package:novel_creator/core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FixedClock', () {
    test('returns fixed time', () {
      final fixed = DateTime(2026, 1, 1);
      final clock = FixedClock(fixed);
      expect(clock.now(), fixed);
    });
  });

  group('SystemClock', () {
    test('returns current time', () {
      const clock = SystemClock();
      final before = DateTime.now();
      final result = clock.now();
      final after = DateTime.now();
      expect(
        result.isAfter(before.subtract(const Duration(milliseconds: 1))),
        isTrue,
      );
      expect(
        result.isBefore(after.add(const Duration(milliseconds: 1))),
        isTrue,
      );
    });
  });
}
