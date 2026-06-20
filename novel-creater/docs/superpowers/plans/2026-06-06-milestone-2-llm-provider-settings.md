# Milestone 2: LLM Provider & Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MockWritingTool with real OpenAI-compatible LLM client, add settings UI for managing providers/models/API keys, and verify via Flutter web build + Playwright MCP.

**Architecture:** Layered (domain/infra/data/agent/features) with Mock fallback. Per-model temperature override with priority chain (model → provider → default).

**Tech Stack:** Flutter 3.x, freezed, flutter_bloc, http, flutter_secure_storage.

**Worktree:** `D:\workplace\visual\same-idea\novel-creater\.worktrees\milestone-1-writing-loop\novel-creater\`

**Spec reference:** `docs/superpowers/specs/2026-06-06-milestone-2-llm-provider-settings-design.md`

---

## File Structure Map

### Domain layer (no UI/infra deps)
- `lib/domain/enums/provider_status.dart` — ProviderStatus enum
- `lib/domain/entities/llm_model.dart` (+freezed/g) — LlmModel value object
- `lib/domain/entities/llm_provider.dart` (+freezed/g) — LlmProvider entity
- `lib/domain/entities/llm_default_settings.dart` (+freezed/g) — Default settings value object
- `lib/domain/repositories/llm_provider_repository.dart` — Repository interface
- `lib/domain/secure/secret_storage.dart` — SecretStorage interface

### Infra LLM
- `lib/infra/llm/models/llm_message.dart` (+freezed/g)
- `lib/infra/llm/models/llm_request.dart` (+freezed/g)
- `lib/infra/llm/models/llm_response.dart` (+freezed/g)
- `lib/infra/llm/models/llm_stream_chunk.dart` (+freezed)
- `lib/infra/llm/llm_client.dart` — LlmClient interface
- `lib/infra/llm/sse_parser.dart` — Pure SSE parser
- `lib/infra/llm/openai_compatible_client.dart` — Real HTTP client

### Infra Secret
- `lib/infra/secret/in_memory_secret_storage.dart`
- `lib/infra/secret/flutter_secure_storage_secret.dart`

### Data
- `lib/data/repositories/in_memory_llm_provider_repository.dart`

### Agent
- `lib/agent/agent_writing_tool.dart` — Interface + AgentWriteResult
- `lib/agent/provider_resolver.dart` — Temperature priority resolution
- `lib/agent/real_llm_writing_tool.dart` — Real implementation
- `lib/agent/mock_writing_tool.dart` — Modified to implement AgentWritingTool

### Features Settings
- `lib/features/settings/bloc/settings_event.dart`
- `lib/features/settings/bloc/settings_state.dart`
- `lib/features/settings/bloc/settings_bloc.dart`
- `lib/features/settings/pages/settings_page.dart`
- `lib/features/settings/widgets/provider_table.dart`
- `lib/features/settings/widgets/provider_form_dialog.dart`
- `lib/features/settings/widgets/model_table.dart`
- `lib/features/settings/widgets/model_temperature_editor.dart`
- `lib/features/settings/widgets/default_model_panel.dart`
- `lib/features/settings/widgets/parameter_panel.dart`
- `lib/features/settings/widgets/placeholder_pane.dart`

### Modified files
- `pubspec.yaml` — Add http + flutter_secure_storage
- `lib/features/workspace/bloc/workspace_bloc.dart` — Accept AgentWritingTool interface
- `lib/features/workspace/widgets/agent_panel.dart` — Show current model + settings entry
- `lib/app/app.dart` — Wire SettingsPage route + new repos

---

## Task Order (13 tasks)

1. Dependencies + ProviderStatus enum
2. LlmModel + LlmDefaultSettings value objects
3. LlmProvider entity
4. SecretStorage interface + in-memory + flutter_secure_storage impl
5. LlmProviderRepository interface + in-memory impl
6. SSE parser (pure)
7. LlmClient interface + LLM models (request/response/message/chunk)
8. OpenAiCompatibleClient implementation
9. AgentWritingTool interface + ProviderResolver + RealLlmWritingTool + Mock retrofit
10. SettingsBloc (event/state/bloc)
11. SettingsPage UI (widgets + page)
12. App wiring (WorkspaceBloc accepts interface, Settings route, AgentPanel update)
13. Web build verification + Playwright MCP smoke test

---

## Task 1: Dependencies + ProviderStatus enum

**Files:**
- Modify: `pubspec.yaml`
- Create: `lib/domain/enums/provider_status.dart`
- Create: `test/unit/domain/enums/provider_status_test.dart`

- [ ] **Step 1: Add http and flutter_secure_storage to pubspec.yaml**

Edit `pubspec.yaml` — insert under `dependencies:` (after json_annotation):

```yaml
  http: ^1.2.2
  flutter_secure_storage: ^9.2.2
```

- [ ] **Step 2: Run flutter pub get**

Run: `flutter pub get`
Expected: Resolution succeeds, both packages added to `pubspec.lock`.

- [ ] **Step 3: Create ProviderStatus enum**

Create `lib/domain/enums/provider_status.dart`:

```dart
enum ProviderStatus {
  pendingConfig,
  connected,
  error,
  local,
}
```

- [ ] **Step 4: Write enum unit test**

Create `test/unit/domain/enums/provider_status_test.dart`:

```dart
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
```

- [ ] **Step 5: Run test**

Run: `flutter test test/unit/domain/enums/provider_status_test.dart`
Expected: PASS (2 tests).

- [ ] **Step 6: Run analyze**

Run: `flutter analyze`
Expected: 0 issues.

- [ ] **Step 7: Do NOT commit** (do not commit any tasks in this plan unless user explicitly asks).

---

## Task 2: LlmModel + LlmDefaultSettings value objects

**Files:**
- Create: `lib/domain/entities/llm_model.dart` (+ freezed/g)
- Create: `lib/domain/entities/llm_default_settings.dart` (+ freezed/g)
- Create: `test/unit/domain/entities/llm_model_test.dart`
- Create: `test/unit/domain/entities/llm_default_settings_test.dart`

- [ ] **Step 1: Write LlmModel test (failing)**

Create `test/unit/domain/entities/llm_model_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';

void main() {
  group('LlmModel', () {
    test('serializes to JSON with default values', () {
      const model = LlmModel(
        id: 'm1',
        modelId: 'gpt-4o',
        name: 'GPT-4o',
      );
      final json = model.toJson();
      expect(json['id'], 'm1');
      expect(json['modelId'], 'gpt-4o');
      expect(json['name'], 'GPT-4o');
      expect(json['supportsStreaming'], true);
      expect(json['temperature'], isNull);
      expect(json['contextLength'], isNull);
    });

    test('roundtrips with per-model temperature override', () {
      const model = LlmModel(
        id: 'm2',
        modelId: 'gpt-4o-mini',
        name: 'GPT-4o-mini',
        contextLength: 128000,
        maxOutput: 16000,
        supportsStreaming: true,
        temperature: 0.3,
      );
      final restored = LlmModel.fromJson(model.toJson());
      expect(restored, model);
      expect(restored.temperature, 0.3);
    });
  });
}
```

- [ ] **Step 2: Create LlmModel entity**

Create `lib/domain/entities/llm_model.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_model.freezed.dart';
part 'llm_model.g.dart';

@freezed
class LlmModel with _$LlmModel {
  const factory LlmModel({
    required String id,
    required String modelId,
    required String name,
    int? contextLength,
    int? maxOutput,
    @Default(true) bool supportsStreaming,
    double? temperature,
  }) = _LlmModel;

  factory LlmModel.fromJson(Map<String, dynamic> json) =>
      _$LlmModelFromJson(json);
}
```

- [ ] **Step 3: Run build_runner**

Run: `dart run build_runner build --delete-conflicting-outputs`
Expected: `llm_model.freezed.dart` and `llm_model.g.dart` generated.

- [ ] **Step 4: Run LlmModel test**

Run: `flutter test test/unit/domain/entities/llm_model_test.dart`
Expected: PASS (2 tests).

- [ ] **Step 5: Write LlmDefaultSettings test**

Create `test/unit/domain/entities/llm_default_settings_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';

void main() {
  group('LlmDefaultSettings', () {
    test('empty constant has all nullable provider/model ids null', () {
      const settings = LlmDefaultSettings.empty;
      expect(settings.writingProviderId, isNull);
      expect(settings.writingModelId, isNull);
      expect(settings.reasoningProviderId, isNull);
      expect(settings.reasoningModelId, isNull);
      expect(settings.embeddingProviderId, isNull);
      expect(settings.embeddingModelId, isNull);
      expect(settings.defaultTemperature, 0.7);
      expect(settings.defaultTopP, 0.9);
      expect(settings.streamingEnabled, true);
    });

    test('roundtrips through JSON', () {
      const settings = LlmDefaultSettings(
        writingProviderId: 'p1',
        writingModelId: 'm1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
        defaultTemperature: 0.5,
        defaultTopP: 0.95,
        streamingEnabled: false,
      );
      final restored = LlmDefaultSettings.fromJson(settings.toJson());
      expect(restored, settings);
    });
  });
}
```

- [ ] **Step 6: Create LlmDefaultSettings**

Create `lib/domain/entities/llm_default_settings.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_default_settings.freezed.dart';
part 'llm_default_settings.g.dart';

@freezed
class LlmDefaultSettings with _$LlmDefaultSettings {
  const factory LlmDefaultSettings({
    required String? writingProviderId,
    required String? writingModelId,
    required String? reasoningProviderId,
    required String? reasoningModelId,
    required String? embeddingProviderId,
    required String? embeddingModelId,
    @Default(0.7) double defaultTemperature,
    @Default(0.9) double defaultTopP,
    @Default(true) bool streamingEnabled,
  }) = _LlmDefaultSettings;

  factory LlmDefaultSettings.fromJson(Map<String, dynamic> json) =>
      _$LlmDefaultSettingsFromJson(json);

  static const LlmDefaultSettings empty = LlmDefaultSettings(
    writingProviderId: null,
    writingModelId: null,
    reasoningProviderId: null,
    reasoningModelId: null,
    embeddingProviderId: null,
    embeddingModelId: null,
  );
}
```

- [ ] **Step 7: Re-run build_runner**

Run: `dart run build_runner build --delete-conflicting-outputs`
Expected: New `.freezed.dart` + `.g.dart` files generated.

- [ ] **Step 8: Run tests + analyze**

Run: `flutter test test/unit/domain/entities/llm_default_settings_test.dart && flutter analyze`
Expected: PASS, 0 analyzer issues.

- [ ] **Step 9: Do NOT commit.**

---

## Task 3: LlmProvider entity

**Files:**
- Create: `lib/domain/entities/llm_provider.dart` (+ freezed/g)
- Create: `test/unit/domain/entities/llm_provider_test.dart`

- [ ] **Step 1: Write LlmProvider test (failing)**

Create `test/unit/domain/entities/llm_provider_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

void main() {
  group('LlmProvider', () {
    test('roundtrips through JSON with cached models', () {
      final now = DateTime.utc(2026, 6, 6);
      final provider = LlmProvider(
        id: 'p1',
        projectId: 'global',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        secretKeyRef: 'novel_creator_secret_p1',
        selectedModelId: 'm1',
        cachedModels: const <LlmModel>[
          LlmModel(id: 'm1', modelId: 'gpt-4o', name: 'GPT-4o'),
        ],
        status: ProviderStatus.connected,
        createdAt: now,
        updatedAt: now,
      );
      final restored = LlmProvider.fromJson(provider.toJson());
      expect(restored, provider);
      expect(restored.cachedModels, hasLength(1));
      expect(restored.temperature, 0.7);
    });

    test('defaults streamingEnabled true and schemaVersion 1', () {
      final now = DateTime.utc(2026, 6, 6);
      final provider = LlmProvider(
        id: 'p2',
        projectId: 'global',
        name: 'Local',
        baseUrl: 'http://localhost:11434/v1',
        secretKeyRef: '',
        selectedModelId: null,
        status: ProviderStatus.local,
        createdAt: now,
        updatedAt: now,
      );
      expect(provider.streamingEnabled, true);
      expect(provider.schemaVersion, 1);
      expect(provider.cachedModels, isEmpty);
    });
  });
}
```

- [ ] **Step 2: Create LlmProvider entity**

Create `lib/domain/entities/llm_provider.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';

part 'llm_provider.freezed.dart';
part 'llm_provider.g.dart';

@freezed
class LlmProvider with _$LlmProvider {
  const factory LlmProvider({
    required String id,
    required String projectId,
    required String name,
    required String baseUrl,
    required String secretKeyRef,
    required String? selectedModelId,
    required ProviderStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(<LlmModel>[]) List<LlmModel> cachedModels,
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(true) bool streamingEnabled,
    @Default(1) int schemaVersion,
  }) = _LlmProvider;

  factory LlmProvider.fromJson(Map<String, dynamic> json) =>
      _$LlmProviderFromJson(json);
}
```

- [ ] **Step 3: Run build_runner**

Run: `dart run build_runner build --delete-conflicting-outputs`
Expected: `llm_provider.freezed.dart` + `llm_provider.g.dart` generated.

- [ ] **Step 4: Run test + analyze**

Run: `flutter test test/unit/domain/entities/llm_provider_test.dart && flutter analyze`
Expected: PASS (2 tests), 0 analyzer issues.

- [ ] **Step 5: Do NOT commit.**

---

## Task 4: SecretStorage interface + implementations

**Files:**
- Create: `lib/domain/secure/secret_storage.dart`
- Create: `lib/infra/secret/in_memory_secret_storage.dart`
- Create: `lib/infra/secret/flutter_secure_storage_secret.dart`
- Create: `test/unit/infra/secret/in_memory_secret_storage_test.dart`

- [ ] **Step 1: Write in-memory secret storage test (failing)**

Create `test/unit/infra/secret/in_memory_secret_storage_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/secret/in_memory_secret_storage.dart';

void main() {
  group('InMemorySecretStorage', () {
    test('save then read returns the same value', () async {
      final storage = InMemorySecretStorage();
      await storage.saveSecret('k1', 'sk-abc');
      final result = await storage.readSecret('k1');
      expect(result, isA<AppSuccess<String?>>());
      expect((result as AppSuccess<String?>).value, 'sk-abc');
    });

    test('read missing key returns success(null)', () async {
      final storage = InMemorySecretStorage();
      final result = await storage.readSecret('missing');
      expect(result, isA<AppSuccess<String?>>());
      expect((result as AppSuccess<String?>).value, isNull);
    });

    test('delete removes value', () async {
      final storage = InMemorySecretStorage();
      await storage.saveSecret('k1', 'v1');
      await storage.deleteSecret('k1');
      final result = await storage.readSecret('k1');
      expect((result as AppSuccess<String?>).value, isNull);
    });

    test('clear removes all values', () async {
      final storage = InMemorySecretStorage();
      await storage.saveSecret('k1', 'v1');
      await storage.saveSecret('k2', 'v2');
      await storage.clear();
      expect(((await storage.readSecret('k1')) as AppSuccess<String?>).value, isNull);
      expect(((await storage.readSecret('k2')) as AppSuccess<String?>).value, isNull);
    });
  });
}
```

- [ ] **Step 2: Create SecretStorage interface**

Create `lib/domain/secure/secret_storage.dart`:

```dart
import 'package:novel_creator/domain/results/app_result.dart';

abstract class SecretStorage {
  Future<AppResult<void>> saveSecret(String key, String value);
  Future<AppResult<String?>> readSecret(String key);
  Future<AppResult<void>> deleteSecret(String key);
  Future<AppResult<void>> clear();
}
```

- [ ] **Step 3: Create InMemorySecretStorage**

Create `lib/infra/secret/in_memory_secret_storage.dart`:

```dart
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';

final class InMemorySecretStorage implements SecretStorage {
  final Map<String, String> _entries = <String, String>{};

  @override
  Future<AppResult<void>> saveSecret(String key, String value) async {
    _entries[key] = value;
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<String?>> readSecret(String key) async =>
      AppResult<String?>.success(_entries[key]);

  @override
  Future<AppResult<void>> deleteSecret(String key) async {
    _entries.remove(key);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<void>> clear() async {
    _entries.clear();
    return const AppResult<void>.success(null);
  }
}
```

- [ ] **Step 4: Run in-memory test**

Run: `flutter test test/unit/infra/secret/in_memory_secret_storage_test.dart`
Expected: PASS (4 tests).

- [ ] **Step 5: Create FlutterSecureStorageSecret**

Create `lib/infra/secret/flutter_secure_storage_secret.dart`:

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';

final class FlutterSecureStorageSecret implements SecretStorage {
  FlutterSecureStorageSecret({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  @override
  Future<AppResult<void>> saveSecret(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
      return const AppResult<void>.success(null);
    } on Exception catch (e) {
      return AppResult<void>.failure(_buildError(e, 'save'));
    }
  }

  @override
  Future<AppResult<String?>> readSecret(String key) async {
    try {
      final value = await _storage.read(key: key);
      return AppResult<String?>.success(value);
    } on Exception catch (e) {
      return AppResult<String?>.failure(_buildError(e, 'read'));
    }
  }

  @override
  Future<AppResult<void>> deleteSecret(String key) async {
    try {
      await _storage.delete(key: key);
      return const AppResult<void>.success(null);
    } on Exception catch (e) {
      return AppResult<void>.failure(_buildError(e, 'delete'));
    }
  }

  @override
  Future<AppResult<void>> clear() async {
    try {
      await _storage.deleteAll();
      return const AppResult<void>.success(null);
    } on Exception catch (e) {
      return AppResult<void>.failure(_buildError(e, 'clear'));
    }
  }

  AppError _buildError(Exception e, String op) => AppError(
        code: 'secret_storage.$op.failed',
        message: 'Secret storage $op failed.',
        userMessage: '安全存储操作失败，请检查设备权限。',
        source: AppErrorSource.storage,
        technicalDetail: e.toString(),
        recoverable: true,
      );
}
```

- [ ] **Step 6: Run analyze**

Run: `flutter analyze`
Expected: 0 issues.

- [ ] **Step 7: Do NOT commit.**

---

## Task 5: LlmProviderRepository interface + in-memory impl

**Files:**
- Create: `lib/domain/repositories/llm_provider_repository.dart`
- Create: `lib/data/repositories/in_memory_llm_provider_repository.dart`
- Create: `test/unit/data/repositories/in_memory_llm_provider_repository_test.dart`

- [ ] **Step 1: Create LlmProviderRepository interface**

Create `lib/domain/repositories/llm_provider_repository.dart`:

```dart
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract class LlmProviderRepository {
  Future<AppResult<List<LlmProvider>>> getAll();
  Future<AppResult<LlmProvider?>> getById(String id);
  Future<AppResult<LlmProvider>> add(LlmProvider provider);
  Future<AppResult<LlmProvider>> update(LlmProvider provider);
  Future<AppResult<void>> remove(String id);
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings();
  Future<AppResult<void>> setDefaultSettings(LlmDefaultSettings settings);
}
```

- [ ] **Step 2: Write failing repository test**

Create `test/unit/data/repositories/in_memory_llm_provider_repository_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_llm_provider_repository.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

LlmProvider _makeProvider(String id) {
  final now = DateTime.utc(2026, 6, 6);
  return LlmProvider(
    id: id,
    projectId: 'global',
    name: 'OpenAI $id',
    baseUrl: 'https://api.openai.com/v1',
    secretKeyRef: 'novel_creator_secret_$id',
    selectedModelId: null,
    status: ProviderStatus.pendingConfig,
    createdAt: now,
    updatedAt: now,
  );
}

void main() {
  group('InMemoryLlmProviderRepository', () {
    test('add then getAll returns the provider', () async {
      final repo = InMemoryLlmProviderRepository();
      await repo.add(_makeProvider('p1'));
      final result = await repo.getAll();
      expect(result, isA<AppSuccess<List<LlmProvider>>>());
      expect((result as AppSuccess<List<LlmProvider>>).value, hasLength(1));
    });

    test('update existing provider succeeds', () async {
      final repo = InMemoryLlmProviderRepository();
      final p = _makeProvider('p1');
      await repo.add(p);
      final updated = p.copyWith(name: 'Renamed');
      final result = await repo.update(updated);
      expect(result, isA<AppSuccess<LlmProvider>>());
      expect((result as AppSuccess<LlmProvider>).value.name, 'Renamed');
    });

    test('update missing provider returns failure', () async {
      final repo = InMemoryLlmProviderRepository();
      final result = await repo.update(_makeProvider('ghost'));
      expect(result, isA<AppFailure<LlmProvider>>());
      expect((result as AppFailure<LlmProvider>).error.code,
          'llm_provider.not_found');
    });

    test('remove deletes the provider', () async {
      final repo = InMemoryLlmProviderRepository();
      await repo.add(_makeProvider('p1'));
      await repo.remove('p1');
      final result = await repo.getAll();
      expect((result as AppSuccess<List<LlmProvider>>).value, isEmpty);
    });

    test('getById returns null when missing', () async {
      final repo = InMemoryLlmProviderRepository();
      final result = await repo.getById('ghost');
      expect(result, isA<AppSuccess<LlmProvider?>>());
      expect((result as AppSuccess<LlmProvider?>).value, isNull);
    });

    test('default settings start empty and can be saved', () async {
      final repo = InMemoryLlmProviderRepository();
      final initial = await repo.getDefaultSettings();
      expect((initial as AppSuccess<LlmDefaultSettings>).value,
          LlmDefaultSettings.empty);
      const updated = LlmDefaultSettings(
        writingProviderId: 'p1',
        writingModelId: 'm1',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      );
      await repo.setDefaultSettings(updated);
      final after = await repo.getDefaultSettings();
      expect((after as AppSuccess<LlmDefaultSettings>).value, updated);
    });
  });
}
```

- [ ] **Step 3: Create InMemoryLlmProviderRepository**

Create `lib/data/repositories/in_memory_llm_provider_repository.dart`:

```dart
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryLlmProviderRepository implements LlmProviderRepository {
  final Map<String, LlmProvider> _providers = <String, LlmProvider>{};
  LlmDefaultSettings _defaultSettings = LlmDefaultSettings.empty;

  @override
  Future<AppResult<List<LlmProvider>>> getAll() async =>
      AppResult<List<LlmProvider>>.success(
        List<LlmProvider>.unmodifiable(_providers.values),
      );

  @override
  Future<AppResult<LlmProvider?>> getById(String id) async =>
      AppResult<LlmProvider?>.success(_providers[id]);

  @override
  Future<AppResult<LlmProvider>> add(LlmProvider provider) async {
    _providers[provider.id] = provider;
    return AppResult<LlmProvider>.success(provider);
  }

  @override
  Future<AppResult<LlmProvider>> update(LlmProvider provider) async {
    if (!_providers.containsKey(provider.id)) {
      return const AppResult<LlmProvider>.failure(
        AppError(
          code: 'llm_provider.not_found',
          message: 'Provider was not found.',
          userMessage: '未找到该服务商，无法更新。',
          source: AppErrorSource.storage,
          recoverable: true,
        ),
      );
    }
    final saved = provider.copyWith(updatedAt: DateTime.now().toUtc());
    _providers[provider.id] = saved;
    return AppResult<LlmProvider>.success(saved);
  }

  @override
  Future<AppResult<void>> remove(String id) async {
    _providers.remove(id);
    return const AppResult<void>.success(null);
  }

  @override
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings() async =>
      AppResult<LlmDefaultSettings>.success(_defaultSettings);

  @override
  Future<AppResult<void>> setDefaultSettings(
    LlmDefaultSettings settings,
  ) async {
    _defaultSettings = settings;
    return const AppResult<void>.success(null);
  }
}
```

- [ ] **Step 4: Run tests + analyze**

Run: `flutter test test/unit/data/repositories/in_memory_llm_provider_repository_test.dart && flutter analyze`
Expected: PASS (6 tests), 0 analyzer issues.

- [ ] **Step 5: Do NOT commit.**

---

## Task 6: SSE parser (pure)

**Files:**
- Create: `lib/infra/llm/sse_parser.dart`
- Create: `test/unit/infra/llm/sse_parser_test.dart`

- [ ] **Step 1: Write failing parser test**

Create `test/unit/infra/llm/sse_parser_test.dart`:

```dart
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/infra/llm/sse_parser.dart';

Stream<List<int>> _streamOf(String text) async* {
  yield utf8.encode(text);
}

void main() {
  group('parseSseStream', () {
    test('parses single event with data line', () async {
      final stream = _streamOf('data: hello\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events, hasLength(1));
      expect(events.single.data, 'hello');
    });

    test('parses multiple events split by blank lines', () async {
      final stream = _streamOf('data: a\n\ndata: b\n\ndata: c\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.map((e) => e.data).toList(), ['a', 'b', 'c']);
    });

    test('joins multi-line data fields with newline', () async {
      final stream = _streamOf('data: line1\ndata: line2\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'line1\nline2');
    });

    test('skips comment lines starting with colon', () async {
      final stream = _streamOf(':ping\ndata: value\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'value');
    });

    test('captures event and id fields', () async {
      final stream = _streamOf('event: delta\nid: 42\ndata: x\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.event, 'delta');
      expect(events.single.id, '42');
      expect(events.single.data, 'x');
    });

    test('ignores malformed lines without colon', () async {
      final stream = _streamOf('garbage\ndata: ok\n\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'ok');
    });

    test('handles chunked byte boundaries', () async {
      Stream<List<int>> chunked() async* {
        yield utf8.encode('data: hel');
        yield utf8.encode('lo\n\ndata: world\n\n');
      }

      final events = await parseSseStream(chunked()).toList();
      expect(events.map((e) => e.data).toList(), ['hello', 'world']);
    });

    test('emits final event without trailing blank line on stream close', () async {
      final stream = _streamOf('data: last\n');
      final events = await parseSseStream(stream).toList();
      expect(events.single.data, 'last');
    });
  });
}
```

- [ ] **Step 2: Create SSE parser**

Create `lib/infra/llm/sse_parser.dart`:

```dart
import 'dart:async';
import 'dart:convert';

final class SseEvent {
  const SseEvent({this.event, required this.data, this.id});

  final String? event;
  final String data;
  final String? id;
}

Stream<SseEvent> parseSseStream(Stream<List<int>> byteStream) async* {
  final decoder = utf8.decoder;
  var buffer = '';
  String? currentEvent;
  String? currentId;
  final dataLines = <String>[];

  SseEvent? flush() {
    if (dataLines.isEmpty && currentEvent == null && currentId == null) {
      return null;
    }
    final event = SseEvent(
      event: currentEvent,
      data: dataLines.join('\n'),
      id: currentId,
    );
    currentEvent = null;
    currentId = null;
    dataLines.clear();
    return event;
  }

  await for (final bytes in byteStream) {
    buffer += decoder.convert(bytes);
    while (true) {
      final newlineIndex = buffer.indexOf('\n');
      if (newlineIndex < 0) break;
      final rawLine = buffer.substring(0, newlineIndex);
      buffer = buffer.substring(newlineIndex + 1);
      final line = rawLine.endsWith('\r')
          ? rawLine.substring(0, rawLine.length - 1)
          : rawLine;

      if (line.isEmpty) {
        final event = flush();
        if (event != null) yield event;
        continue;
      }
      if (line.startsWith(':')) {
        continue;
      }
      final colonIndex = line.indexOf(':');
      if (colonIndex < 0) {
        continue;
      }
      final field = line.substring(0, colonIndex);
      var value = line.substring(colonIndex + 1);
      if (value.startsWith(' ')) {
        value = value.substring(1);
      }
      switch (field) {
        case 'data':
          dataLines.add(value);
        case 'event':
          currentEvent = value;
        case 'id':
          currentId = value;
        default:
          break;
      }
    }
  }

  if (buffer.isNotEmpty) {
    final line = buffer.endsWith('\r')
        ? buffer.substring(0, buffer.length - 1)
        : buffer;
    if (line.isNotEmpty && !line.startsWith(':')) {
      final colonIndex = line.indexOf(':');
      if (colonIndex >= 0) {
        final field = line.substring(0, colonIndex);
        var value = line.substring(colonIndex + 1);
        if (value.startsWith(' ')) value = value.substring(1);
        switch (field) {
          case 'data':
            dataLines.add(value);
          case 'event':
            currentEvent = value;
          case 'id':
            currentId = value;
          default:
            break;
        }
      }
    }
  }

  final tail = flush();
  if (tail != null) yield tail;
}
```

- [ ] **Step 3: Run tests + analyze**

Run: `flutter test test/unit/infra/llm/sse_parser_test.dart && flutter analyze`
Expected: PASS (8 tests), 0 analyzer issues.

- [ ] **Step 4: Do NOT commit.**

---

## Task 7: LlmClient interface + LLM models

**Files:**
- Create: `lib/infra/llm/models/llm_message.dart` (+ freezed/g)
- Create: `lib/infra/llm/models/llm_request.dart` (+ freezed/g)
- Create: `lib/infra/llm/models/llm_response.dart` (+ freezed/g)
- Create: `lib/infra/llm/models/llm_stream_chunk.dart` (+ freezed)
- Create: `lib/infra/llm/llm_client.dart`
- Create: `test/unit/infra/llm/llm_request_test.dart`

- [ ] **Step 1: Create LlmMessage**

Create `lib/infra/llm/models/llm_message.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_message.freezed.dart';
part 'llm_message.g.dart';

@freezed
class LlmMessage with _$LlmMessage {
  const factory LlmMessage({
    required String role,
    required String content,
  }) = _LlmMessage;

  factory LlmMessage.fromJson(Map<String, dynamic> json) =>
      _$LlmMessageFromJson(json);
}
```

- [ ] **Step 2: Create LlmRequest**

Create `lib/infra/llm/models/llm_request.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';

part 'llm_request.freezed.dart';
part 'llm_request.g.dart';

@freezed
class LlmRequest with _$LlmRequest {
  const factory LlmRequest({
    required String baseUrl,
    required String apiKey,
    required String model,
    required List<LlmMessage> messages,
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(2048) int maxTokens,
    @Default(true) bool stream,
  }) = _LlmRequest;

  factory LlmRequest.fromJson(Map<String, dynamic> json) =>
      _$LlmRequestFromJson(json);
}
```

- [ ] **Step 3: Create LlmResponse**

Create `lib/infra/llm/models/llm_response.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'llm_response.freezed.dart';
part 'llm_response.g.dart';

@freezed
class LlmResponse with _$LlmResponse {
  const factory LlmResponse({
    required String content,
    String? finishReason,
    int? promptTokens,
    int? completionTokens,
  }) = _LlmResponse;

  factory LlmResponse.fromJson(Map<String, dynamic> json) =>
      _$LlmResponseFromJson(json);
}
```

- [ ] **Step 4: Create LlmStreamChunk (sealed)**

Create `lib/infra/llm/models/llm_stream_chunk.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/results/app_error.dart';

part 'llm_stream_chunk.freezed.dart';

@freezed
sealed class LlmStreamChunk with _$LlmStreamChunk {
  const factory LlmStreamChunk.textDelta(String text) = TextDelta;
  const factory LlmStreamChunk.done(String? finishReason) = StreamDone;
  const factory LlmStreamChunk.error(AppError error) = StreamErrorChunk;
}
```

- [ ] **Step 5: Create LlmClient interface**

Create `lib/infra/llm/llm_client.dart`:

```dart
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';

abstract class LlmClient {
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  });

  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  });

  Stream<LlmStreamChunk> chatCompletionStream(LlmRequest request);

  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request);
}
```

- [ ] **Step 6: Write LlmRequest JSON roundtrip test**

Create `test/unit/infra/llm/llm_request_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';

void main() {
  group('LlmRequest', () {
    test('serializes with default values', () {
      const req = LlmRequest(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-x',
        model: 'gpt-4o',
        messages: <LlmMessage>[
          LlmMessage(role: 'user', content: 'hi'),
        ],
      );
      final json = req.toJson();
      expect(json['model'], 'gpt-4o');
      expect(json['temperature'], 0.7);
      expect(json['stream'], true);
      expect((json['messages'] as List).first, isA<Map>());
    });

    test('roundtrips with overridden temperature', () {
      const req = LlmRequest(
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-x',
        model: 'gpt-4o',
        messages: <LlmMessage>[LlmMessage(role: 'user', content: 'hi')],
        temperature: 0.3,
        stream: false,
      );
      final restored = LlmRequest.fromJson(req.toJson());
      expect(restored, req);
    });
  });
}
```

- [ ] **Step 7: Run build_runner + test + analyze**

Run: `dart run build_runner build --delete-conflicting-outputs && flutter test test/unit/infra/llm/llm_request_test.dart && flutter analyze`
Expected: Generated files created, tests PASS, 0 analyzer issues.

- [ ] **Step 8: Do NOT commit.**

---

## Task 8: OpenAiCompatibleClient implementation

**Files:**
- Create: `lib/infra/llm/openai_compatible_client.dart`
- Create: `test/unit/infra/llm/openai_compatible_client_test.dart`

**Reference:** spec section "OpenAI 兼容客户端（核心实现）" in `docs/superpowers/specs/2026-06-06-milestone-2-llm-provider-settings-design.md`.

**Implementation notes:**
- Use `package:http/http.dart` `Client` (injectable for testing via `MockClient`).
- `chatCompletionStream`: POST `${baseUrl}/chat/completions` with `Authorization: Bearer ${apiKey}`, body `{"model","messages","temperature","top_p","max_tokens","stream":true}`. Use `request.send()` then `response.stream.transform(parseSseStream)`. For each SSE event: if data == `[DONE]` yield `StreamDone(null)`; otherwise `jsonDecode(event.data)` and yield `TextDelta(json.choices[0].delta.content ?? '')`; on finishReason present yield `StreamDone(finishReason)`. JSON-decode errors yield `StreamErrorChunk(AppError(code:'sse_parse_error', source: llm))`.
- `chatCompletion` (non-stream): POST with `stream:false`, return `AppResult<LlmResponse>` from `json.choices[0].message.content`.
- `listModels`: GET `${baseUrl}/models` with Bearer auth; map `data[*].id` → `LlmModel(id:id, modelId:id, name:id)`.
- `testConnection`: call `listModels` and return success/failure; on network errors return `AppError(code:'llm_connection_failed', source: llm, recoverable:true)`.
- All exceptions → wrap in `AppError(source: llm)`, never throw. Never log apiKey.

- [ ] **Step 1: Write test using `package:http/testing` MockClient**

Test cases (in `test/unit/infra/llm/openai_compatible_client_test.dart`):
  - `listModels` parses `{"data":[{"id":"gpt-4o"}, ...]}` correctly.
  - `listModels` returns `AppFailure(code:'llm_auth_failed')` when HTTP 401.
  - `chatCompletion` parses non-stream response and extracts content.
  - `chatCompletionStream` yields TextDelta then StreamDone when fed mocked SSE bytes.
  - `testConnection` returns failure with `llm_connection_failed` on network error (throw `SocketException`).

Use `MockClient` (sync) for non-stream; for stream use `MockClient.streaming((req, byteStream) async => StreamedResponse(...))`.

- [ ] **Step 2: Implement `OpenAiCompatibleClient`**

  - Constructor: `OpenAiCompatibleClient({http.Client? client}) : _client = client ?? http.Client();`
  - Implements `LlmClient`.
  - Use `parseSseStream` from Task 6 for stream parsing.
  - All response error codes:
    - HTTP 401/403 → `llm_auth_failed`
    - HTTP 429 → `llm_rate_limited`
    - Network/socket exception → `llm_connection_failed`
    - Non-200 other → `llm_request_failed`
    - JSON decode failure → `sse_parse_error` (stream) / `llm_response_parse_error` (sync)

- [ ] **Step 3: Run tests + analyze**

Run: `flutter test test/unit/infra/llm/openai_compatible_client_test.dart && flutter analyze`
Expected: All tests PASS, 0 analyzer issues.

- [ ] **Step 4: Do NOT commit.**

---

## Task 9: AgentWritingTool interface + ProviderResolver + RealLlmWritingTool + Mock retrofit

**Files:**
- Create: `lib/agent/agent_writing_tool.dart` (interface + `AgentWriteResult`)
- Create: `lib/agent/provider_resolver.dart`
- Create: `lib/agent/real_llm_writing_tool.dart`
- Modify: `lib/agent/mock_writing_tool.dart` (implement interface)
- Create: `test/unit/agent/provider_resolver_test.dart`
- Create: `test/unit/agent/real_llm_writing_tool_test.dart`
- Modify: `test/unit/agent/mock_writing_tool_test.dart`

**Reference:** spec section "Agent 集成" + "ProviderResolver" + "MockWritingTool 演变".

### 9.1 AgentWritingTool interface

`AgentWriteResult` fields: `continuedText` (String), `stopReason` (String), `usedProvider` (String?), `usedModel` (String?), `temperature` (double).

Interface method: `Future<AppResult<AgentWriteResult>> continueWrite({required String chapterId, required String cursorContext, required int targetLength});`

### 9.2 ProviderResolver

Value object `ResolvedProvider`:
- `provider: LlmProvider`
- `model: LlmModel?`
- `apiKey: String`
- `temperature: double`
- `topP: double`
- `streamingEnabled: bool`

Method `Future<AppResult<ResolvedProvider>> resolveWritingProvider()`:
1. `getDefaultSettings` → check `writingProviderId`. null → return `AppFailure(code:'model_not_selected', source: llm, suggestedAction:'在设置页选择默认写作模型')`.
2. `getById(writingProviderId)` → null/error → `AppFailure(code:'provider_not_found')`.
3. `model = provider.cachedModels.firstWhereOrNull(modelId == writingModelId)`. (`null` allowed: temperature falls back.)
4. `secretStorage.readSecret(provider.secretKeyRef)` → null/empty AND `provider.status != local` → `AppFailure(code:'api_key_missing')`.
5. `temperature = model?.temperature ?? provider.temperature ?? settings.defaultTemperature` (provider.temperature has class default 0.7, so the `??` chain reduces to model override; document this).
6. Return `AppSuccess(ResolvedProvider(...))`.

### 9.3 RealLlmWritingTool

Constructor takes `LlmClient`, `ProviderResolver`.

`continueWrite`:
1. `resolveWritingProvider()` → failure passes through.
2. Build `LlmRequest` with system prompt ("你是一位中文小说创作助手，根据已有正文延续故事，保持文风一致") + user message "已有内容：\n${cursorContext}\n请继续写作约 ${targetLength} 字。".
3. If `streamingEnabled`: collect `chatCompletionStream` chunks accumulating `TextDelta.text` until `StreamDone`; on `StreamErrorChunk` return `AppFailure(error)`.
4. If non-streaming: `chatCompletion` and use `response.content`.
5. Return `AgentWriteResult(continuedText: accumulated, stopReason: finishReason ?? 'unknown', usedProvider: provider.name, usedModel: model?.modelId, temperature: resolved.temperature)`.

### 9.4 MockWritingTool retrofit

- Make it `implements AgentWritingTool`.
- Change return to `Future<AppResult<AgentWriteResult>>`.
- Preserve existing fixed-text behaviour. Set `usedProvider:'mock'`, `usedModel:'mock'`.
- Delete `MockContinueWriteResult` class; use `AgentWriteResult` instead.

### Tests

`provider_resolver_test.dart` cases:
- Returns `model_not_selected` when defaults empty.
- Returns `provider_not_found` when settings reference a missing provider.
- Returns `api_key_missing` when secret empty AND provider is not `local`.
- `local` provider passes with empty apiKey.
- Temperature priority: model override > provider override > default.

`real_llm_writing_tool_test.dart` cases:
- Streaming path: feeds `StreamController` of LlmStreamChunk via mock client, asserts assembled text.
- Non-streaming path returns content.
- Resolver failure short-circuits.

`mock_writing_tool_test.dart`:
- Update existing tests to assert `AppSuccess<AgentWriteResult>` shape; verify fixed text still produced.

- [ ] **Step 1: Create AgentWritingTool + AgentWriteResult.**
- [ ] **Step 2: Create ProviderResolver + tests; run tests.**
- [ ] **Step 3: Create RealLlmWritingTool + tests using stub LlmClient; run tests.**
- [ ] **Step 4: Retrofit MockWritingTool; update its test; run tests.**
- [ ] **Step 5: `flutter analyze` → 0 issues.**
- [ ] **Step 6: Do NOT commit.**

---

## Task 10: SettingsBloc (event/state/bloc)

**Files:**
- Create: `lib/features/settings/bloc/settings_event.dart`
- Create: `lib/features/settings/bloc/settings_state.dart`
- Create: `lib/features/settings/bloc/settings_bloc.dart`
- Create: `test/unit/features/settings/settings_bloc_test.dart`

**Reference:** spec section "SettingsBloc".

### SettingsState

Fields:
- `isLoading: bool`
- `providers: List<LlmProvider>`
- `defaultSettings: LlmDefaultSettings`
- `selectedTab: SettingsTab` (enum: model, general, writing, proof, shortcuts, backup, about — default `model`)
- `testStatus: ConnectionTestStatus` (enum: idle, testing, success, failure)
- `error: AppError?`
- `copyWith(... , bool clearError = false)`
- `const SettingsState.initial()` returning empty / idle / model tab.

### SettingsEvent variants

- `SettingsLoaded()` — load providers + defaults.
- `SettingsTabSelected(SettingsTab tab)`
- `ProviderAdded(name, baseUrl, apiKey, ProviderStatus status)` — generates id, saves secret then adds provider.
- `ProviderUpdated(LlmProvider provider, String? newApiKey)` — if `newApiKey` non-null, save to secret storage; then `update`.
- `ProviderRemoved(String id)` — delete secret then remove.
- `ConnectionTested(String providerId)` — read secret, call `LlmClient.testConnection`, set provider.status.
- `ModelsRefreshed(String providerId)` — call `LlmClient.listModels`, write `provider.cachedModels`.
- `ModelSelected(String providerId, String modelId)` — set `provider.selectedModelId`.
- `ModelTemperatureSet(String providerId, String modelId, double? temperature)` — update `cachedModels[i].temperature`.
- `DefaultModelChanged(LlmDefaultSettings settings)` — replace defaults.
- `ParametersUpdated({double? temperature, double? topP, bool? streaming})` — patch defaults.

### SettingsBloc behaviour

- Constructor: `SettingsBloc({required LlmProviderRepository repository, required LlmClient client, required SecretStorage secretStorage})`.
- On `SettingsLoaded`: parallel load providers + defaults, emit `isLoading:false`.
- On `ProviderAdded`: build provider with `secretKeyRef:'novel_creator_secret_$id'`, write secret, `repository.add`, refresh list.
- On `ProviderRemoved`: `secretStorage.deleteSecret(provider.secretKeyRef)`, then `repository.remove`.
- On `ConnectionTested`: emit `testStatus:testing`; read secret; `client.testConnection`; on success update provider status to `connected`, on failure to `error` and emit `testStatus:failure` with error.
- On `ModelTemperatureSet`: build new cachedModels list with replaced model, call `repository.update`.
- All failures → emit `error: AppError`, do NOT throw.

### Tests

- `SettingsLoaded` populates state.
- `ProviderAdded` saves secret then adds.
- `ConnectionTested` success path with stub client.
- `ConnectionTested` failure path produces `error` + `testStatus:failure`.
- `ModelTemperatureSet` updates the cached model's temperature in the repository.
- `DefaultModelChanged` persists defaults.

Use `bloc_test`? Project doesn't have it yet — write plain `test` with `Bloc.stream` collection via `expectLater`.

- [ ] **Step 1: Create event/state/bloc files.**
- [ ] **Step 2: Write bloc tests with in-memory repo + stub client + in-memory secret storage.**
- [ ] **Step 3: `flutter test test/unit/features/settings/settings_bloc_test.dart && flutter analyze` → PASS, 0 issues.**
- [ ] **Step 4: Do NOT commit.**

---

## Task 11: SettingsPage UI

**Files:**
- Create: `lib/features/settings/pages/settings_page.dart`
- Create: `lib/features/settings/widgets/provider_table.dart`
- Create: `lib/features/settings/widgets/provider_form_dialog.dart`
- Create: `lib/features/settings/widgets/model_table.dart`
- Create: `lib/features/settings/widgets/model_temperature_editor.dart`
- Create: `lib/features/settings/widgets/default_model_panel.dart`
- Create: `lib/features/settings/widgets/parameter_panel.dart`
- Create: `lib/features/settings/widgets/placeholder_pane.dart`
- Create: `test/widget/settings_page_test.dart`

**Reference:** spec section "SettingsPage 布局" + prototype `docs/novel-creator-ui/settings.html`.

### Layout

`SettingsPage` is a `Scaffold` with `AppBar(title: '设置')` and back-arrow leading. Body is a `Row`:
- **Left (240px)**: `SettingsNavRail` — 7 entries (model/general/writing/proof/shortcuts/backup/about). Use `MorandiColors` tokens (no hardcoded colors). Dispatch `SettingsTabSelected`.
- **Right**: `IndexedStack` selecting one of 7 panes based on `state.selectedTab`:
  - `model` → `ModelTab` (composes `ProviderTable`, `ModelTable`, `DefaultModelPanel`, `ParameterPanel`)
  - others → `PlaceholderPane(title)` with localized title and "即将推出" text

### Component contracts (all stateless, take `WatchOnly state` + callbacks)

**`ProviderTable`**
  - DataTable rows: name, baseUrl, masked apiKey (`sk-•••• + last4` from `secretStorage`-cached display value, OR just `••••••••` since we never read back), status dot (connected/error/pendingConfig/local with morandi colors), edit + delete buttons.
  - "添加服务商" button → opens `ProviderFormDialog` in create mode → on save dispatch `ProviderAdded`.
  - Edit → opens `ProviderFormDialog` in edit mode.
  - Delete → confirmation dialog → dispatch `ProviderRemoved`.

**`ProviderFormDialog`** (`AlertDialog`)
  - Fields: name (TextFormField), baseUrl, apiKey (obscureText with eye toggle), provider preset dropdown (OpenAI / DeepSeek / 通义 / Ollama / Custom — fills baseUrl), "测试连接" button (dispatch `ConnectionTested` and show inline result).
  - On save: validate non-empty name + baseUrl, dispatch `ProviderAdded` or `ProviderUpdated`.

**`ModelTable`**
  - Visible when a provider is selected (top of pane has provider dropdown).
  - Columns: radio (selectedModelId), name, modelId, contextLength, maxOutput, supportsStreaming icon, temperature (click → `ModelTemperatureEditor`).
  - Refresh button → `ModelsRefreshed`.

**`ModelTemperatureEditor`** (popup `MenuAnchor` or inline)
  - Slider 0.0–2.0 + numeric label.
  - "恢复默认" button → dispatch `ModelTemperatureSet(temperature: null)`.

**`DefaultModelPanel`**
  - Three dropdowns: 写作模型 / 推理模型(可选) / 嵌入模型(可选).
  - Options merged from all providers' cachedModels (label `${provider.name} · ${model.name}`).
  - Dispatch `DefaultModelChanged`.

**`ParameterPanel`**
  - Temperature slider (default global) + TopP slider + streaming toggle.
  - Dispatch `ParametersUpdated`.

**`PlaceholderPane`**
  - Centered card with morandi muted text "该分类即将推出". Title comes from props.

### Tests (widget level — keep minimal)

- `settings_page_test.dart`:
  - Renders with empty state (no providers): table is empty, "添加服务商" visible.
  - Tab switch updates the visible pane.
  - Placeholder pane shows "即将推出".
  - With one provider seeded into mock repo, table shows row.

Pump using `BlocProvider<SettingsBloc>(create: ..., child: MaterialApp(home: SettingsPage()))` and seed in-memory repo via constructor before dispatching `SettingsLoaded`.

### Styling constraints

- No hardcoded colors — use `AppTheme.of(context)` / `MorandiColors`.
- No emojis.
- All icons via existing inline SVG helper or Material Icons (project doesn't have heroicons package; use `Icons.add`, `Icons.delete_outline`, `Icons.edit_outlined`, `Icons.refresh`, `Icons.visibility`).
- Use `Tooltip` for icon-only buttons.
- Spacing/sizes from `AppTheme.spacing`.

- [ ] **Step 1: Build component files in dependency order: PlaceholderPane → ProviderTable → ProviderFormDialog → ModelTemperatureEditor → ModelTable → DefaultModelPanel → ParameterPanel → SettingsPage.**
- [ ] **Step 2: Add smoke widget test.**
- [ ] **Step 3: `flutter test test/widget/settings_page_test.dart && flutter analyze` → PASS, 0 issues.**
- [ ] **Step 4: Do NOT commit.**

---

## Task 12: App wiring (WorkspaceBloc accepts interface, Settings route, AgentPanel update)

**Files:**
- Modify: `lib/app/app.dart`
- Modify: `lib/features/workspace/bloc/workspace_bloc.dart` (parameter type only)
- Modify: `lib/features/workspace/widgets/agent_panel.dart` (display current model + settings entry)
- Modify: `test/widget/workspace_page_test.dart` if needed for new constructor parameter

### 12.1 WorkspaceBloc parameter type change

- Change constructor parameter from `required MockWritingTool writingTool` to `required AgentWritingTool writingTool`.
- Update field type accordingly.
- Update `_onAgentSuggestionRequested`: now `_writingTool.continueWrite(...)` returns `Future<AppResult<AgentWriteResult>>`. Await it. On `AppFailure`, emit `state.copyWith(error: error)` (set `agentSuggestion: ''`). On `AppSuccess`, emit with `agentSuggestion: result.value.continuedText` and clear error.
- Update existing tests that construct `WorkspaceBloc` to inject `MockWritingTool()` (still satisfies interface).

### 12.2 App wiring (`lib/app/app.dart`)

- Add singletons constructed once: `InMemoryLlmProviderRepository`, `InMemorySecretStorage` (default for now; document that flutter_secure_storage will be wired when not in test/web).
- Add `OpenAiCompatibleClient` instance.
- Wrap root with `MultiBlocProvider`:
  - `BlocProvider<WorkspaceBloc>(... writingTool: RealLlmWritingTool(client, ProviderResolver(repo, secret)))`.
  - `BlocProvider<SettingsBloc>(create: (_) => SettingsBloc(...)..add(SettingsLoaded()))`.
- Add a named route `/settings` registered via `MaterialApp.routes`. `WorkspacePage` exposes a settings entry button (sidebar footer) that calls `Navigator.pushNamed(context, '/settings')`.

NOTE: Use `RealLlmWritingTool` even when no provider is configured. ProviderResolver returns `AppFailure(code:'model_not_selected')` and AgentPanel displays "未配置默认模型，前往设置" link.

### 12.3 AgentPanel updates

- Read `state` from `SettingsBloc` (via `context.watch`) to display:
  - Current default writing provider + model name (`state.defaultSettings.writingModelId`).
  - Settings entry button (gear icon) → push `/settings`.
- On error result with `code == 'model_not_selected'` or `'api_key_missing'`, show a small inline banner with a button "前往设置".

- [ ] **Step 1: Modify WorkspaceBloc + propagate AsyncResult change.**
- [ ] **Step 2: Modify app.dart wiring.**
- [ ] **Step 3: Modify AgentPanel.**
- [ ] **Step 4: Update existing workspace tests for new constructor + async return type.**
- [ ] **Step 5: `flutter test && flutter analyze` → all pass, 0 issues.**
- [ ] **Step 6: Do NOT commit.**

---

## Task 13: Web build verification + Playwright MCP smoke test

**Files:** none new — operational task.

**Goal:** Build the app as a Flutter web app, serve it locally, then use the Playwright MCP browser tools (`playwright_browser_navigate`, `playwright_browser_snapshot`, `playwright_browser_click`, `playwright_browser_evaluate`) to perform an automated smoke verification of the new Settings flow.

### 13.1 Build web

- [ ] **Step 1: Build release web bundle**

Run from `D:\workplace\visual\same-idea\novel-creater\.worktrees\milestone-1-writing-loop\novel-creater`:

```
flutter build web --release --no-tree-shake-icons
```

Expected: `build/web/` populated with `index.html`, `main.dart.js`, assets. Warning about flutter_secure_storage Web limited support is acceptable (we wired InMemorySecretStorage by default, so Web build should not crash).

If build fails because of secure storage native-only code: gate the binding (in `lib/app/app.dart` use `kIsWeb` to pick `InMemorySecretStorage` on Web vs `FlutterSecureStorageSecret` elsewhere). Then re-build.

- [ ] **Step 2: Serve the build directory**

Use any of:
- `dart pub global activate dhttpd && dhttpd --path build/web --port 8765`
- Or `python -m http.server 8765 --directory build/web`

Confirm `http://localhost:8765` returns HTML.

### 13.2 Playwright MCP smoke checks

Use the Playwright MCP tools to verify the following journeys. Each is one step; on any failure, capture a screenshot and an accessibility snapshot for debugging.

- [ ] **Step 3: Navigate to app**

  - Tool: `playwright_browser_navigate` to `http://localhost:8765`
  - Tool: `playwright_browser_wait_for` text "示例项目" (initial workspace seed)
  - Expected: workspace loads.

- [ ] **Step 4: Open Settings page**

  - Tool: `playwright_browser_click` on the settings (gear) icon in sidebar footer.
  - Tool: `playwright_browser_wait_for` text "模型与服务商"
  - Tool: `playwright_browser_snapshot` and verify SettingsPage rendered with 7 tabs.

- [ ] **Step 5: Switch tabs**

  - Click "通用设置" tab. Verify placeholder "即将推出" visible.
  - Click "模型与服务商" tab. Verify it returns to model pane.

- [ ] **Step 6: Add a provider (without making real network call)**

  - Click "添加服务商" button.
  - Fill form fields: name="Test", baseUrl="https://example.invalid/v1", apiKey="sk-test".
  - Click "保存".
  - Tool: `playwright_browser_wait_for` text "Test" in provider table.

- [ ] **Step 7: Trigger Connection Test (expect failure)**

  - In the new row, click 测试连接.
  - Tool: `playwright_browser_wait_for` text including "连接失败" or "无法连接" within 30s.
  - Confirm the error is displayed inline; the app does not crash.

- [ ] **Step 8: Workspace fallback flow**

  - Navigate back to workspace (`Navigator.pop`).
  - Click "生成草稿" in AgentPanel.
  - Expected: With no default model configured, the panel shows "未配置默认模型" banner and a "前往设置" link.

- [ ] **Step 9: Set fallback to MockWritingTool for AI demo (optional, skip if hard)**

  - Open settings → set default model to a hand-added "Mock" provider (status=local) with a single model "mock". (This requires that the form allows status=local; if not, skip.)
  - Back to workspace → click 生成草稿 again — Agent should produce a mock-suggested text.
  - Click "应用为修订" → assert pending revision appears in side list.
  - Accept revision → editor content updates.

- [ ] **Step 10: Final report**

  Stop the dev server. Produce a final summary:
  - All 9 above steps PASS / FAIL with screenshots saved under `build/web-smoke/`.
  - `flutter test` total count and pass count.
  - `flutter analyze` final state.

- [ ] **Step 11: Do NOT commit.**

---

## Self-Review Checklist (run before handing off to executor)

- [ ] Each new file in spec has a creating task.
- [ ] Per-model temperature override (the spec amendment) is in Task 9 ProviderResolver + Task 10 `ModelTemperatureSet` event + Task 11 `ModelTemperatureEditor`.
- [ ] No "TBD"/"TODO"/"similar to" placeholders.
- [ ] AGENTS.md red lines respected:
  - Domain has no Flutter/HTTP imports (Tasks 2/3/5).
  - Repository wraps storage (Task 5).
  - Errors via AppResult/AppError (all tasks).
  - API key never logged (Task 4 + Task 8).
  - Mock fallback preserved (Task 9).
- [ ] No test framework other than `flutter_test` introduced (no bloc_test added).
- [ ] Web build path documented and matches the user's MCP verification requirement.

---

**End of plan.**












