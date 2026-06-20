import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/secure/in_memory_secret_storage.dart';
import 'package:novel_creator/domain/results/app_result.dart';

void main() {
  group('InMemorySecretStorage', () {
    test('write then read returns the same value', () async {
      final storage = InMemorySecretStorage();
      final writeResult = await storage.write(ref: 'k1', value: 'sk-abc');
      expect(writeResult, isA<AppSuccess<void>>());

      final readResult = await storage.read(ref: 'k1');
      expect(readResult, isA<AppSuccess<String?>>());
      expect((readResult as AppSuccess<String?>).value, 'sk-abc');
    });

    test('read of non-existent ref returns Success(null)', () async {
      final storage = InMemorySecretStorage();
      final result = await storage.read(ref: 'missing');
      expect(result, isA<AppSuccess<String?>>());
      expect((result as AppSuccess<String?>).value, isNull);
    });

    test('delete then read returns Success(null)', () async {
      final storage = InMemorySecretStorage();
      await storage.write(ref: 'k1', value: 'v1');
      final deleteResult = await storage.delete(ref: 'k1');
      expect(deleteResult, isA<AppSuccess<void>>());

      final readResult = await storage.read(ref: 'k1');
      expect(readResult, isA<AppSuccess<String?>>());
      expect((readResult as AppSuccess<String?>).value, isNull);
    });

    test('listRefs returns all written keys', () async {
      final storage = InMemorySecretStorage();
      await storage.write(ref: 'k1', value: 'v1');
      await storage.write(ref: 'k2', value: 'v2');
      await storage.write(ref: 'k3', value: 'v3');

      final result = await storage.listRefs();
      expect(result, isA<AppSuccess<List<String>>>());
      final refs = (result as AppSuccess<List<String>>).value;
      expect(refs, hasLength(3));
      expect(refs, containsAll(<String>['k1', 'k2', 'k3']));
    });

    test('overwriting an existing ref updates the value', () async {
      final storage = InMemorySecretStorage();
      await storage.write(ref: 'k1', value: 'old');
      await storage.write(ref: 'k1', value: 'new');

      final readResult = await storage.read(ref: 'k1');
      expect((readResult as AppSuccess<String?>).value, 'new');

      final listResult = await storage.listRefs();
      expect((listResult as AppSuccess<List<String>>).value, hasLength(1));
    });

    test('delete of non-existent ref returns Success (idempotent)', () async {
      final storage = InMemorySecretStorage();
      final result = await storage.delete(ref: 'never_written');
      expect(result, isA<AppSuccess<void>>());

      final listResult = await storage.listRefs();
      expect((listResult as AppSuccess<List<String>>).value, isEmpty);
    });
  });
}
