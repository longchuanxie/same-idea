import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/secure_storage.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/repositories/settings_repository_impl.dart';
import 'package:novel_creator/domain/domain.dart';

void main() {
  late AppDatabase db;
  late InMemorySecureStorage secureStorage;
  late SettingsRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    secureStorage = InMemorySecureStorage();
    repository = SettingsRepositoryImpl(db, secureStorage);
  });

  tearDown(() async {
    await db.close();
  });

  group('SettingsRepository', () {
    test('saveProvider persists model parameters', () async {
      final now = DateTime(2026, 6, 4);
      final provider = LlmProvider(
        id: 'provider-1',
        displayName: 'Local Mock',
        baseUrl: 'http://localhost:11434/v1',
        createdAt: now,
        updatedAt: now,
        defaultModel: 'mock-novel',
        temperature: 0.35,
        maxTokens: 4096,
      );

      final saveResult = await repository.saveProvider(provider);
      expect(saveResult.isSuccess, isTrue);

      final getResult = await repository.getProviderById('provider-1');
      expect(getResult.isSuccess, isTrue);
      getResult.when(
        success: (saved) {
          expect(saved.defaultModel, 'mock-novel');
          expect(saved.temperature, 0.35);
          expect(saved.maxTokens, 4096);
          expect(saved.apiKey, isEmpty);
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('saveApiKey keeps secrets outside provider rows', () async {
      final now = DateTime(2026, 6, 4);
      await repository.saveProvider(
        LlmProvider(
          id: 'provider-1',
          displayName: 'Provider',
          baseUrl: 'https://api.example.test/v1',
          createdAt: now,
          updatedAt: now,
        ),
      );

      final saveKeyResult =
          await repository.saveApiKey('provider-1', 'secret-key');
      expect(saveKeyResult.isSuccess, isTrue);

      final keyResult = await repository.getApiKey('provider-1');
      expect(keyResult.maybeSuccess, 'secret-key');

      final providerResult = await repository.getProviderById('provider-1');
      expect(providerResult.maybeSuccess?.apiKey, isEmpty);
    });

    test('getProviderById returns failure for missing provider', () async {
      final result = await repository.getProviderById('missing');

      expect(result.isFailure, isTrue);
      expect(result.maybeFailure?.code, 'NOT_FOUND');
    });
  });
}
