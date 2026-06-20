import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

void main() {
  group('ProviderStatus', () {
    test('contains all 4 variants', () {
      expect(ProviderStatus.values, hasLength(4));
      expect(ProviderStatus.values, contains(ProviderStatus.pendingConfig));
      expect(ProviderStatus.values, contains(ProviderStatus.connected));
      expect(ProviderStatus.values, contains(ProviderStatus.error));
      expect(ProviderStatus.values, contains(ProviderStatus.local));
    });

    test('names use lowerCamelCase', () {
      expect(ProviderStatus.pendingConfig.name, 'pendingConfig');
      expect(ProviderStatus.connected.name, 'connected');
      expect(ProviderStatus.error.name, 'error');
      expect(ProviderStatus.local.name, 'local');
    });
  });
}
