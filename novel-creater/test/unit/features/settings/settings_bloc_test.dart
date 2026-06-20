import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/data/repositories/in_memory_llm_provider_repository.dart';
import 'package:novel_creator/data/secure/in_memory_secret_storage.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/features/settings/bloc/connection_test_status.dart';
import 'package:novel_creator/features/settings/bloc/settings_bloc.dart';
import 'package:novel_creator/features/settings/bloc/settings_event.dart';
import 'package:novel_creator/features/settings/bloc/settings_state.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_response.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';

class _StubLlmClient implements LlmClient {
  _StubLlmClient({
    this.testConnectionResult,
    this.listModelsResult,
  });

  final AppResult<void>? testConnectionResult;
  final AppResult<List<LlmModel>>? listModelsResult;

  @override
  Stream<LlmStreamChunk> chatCompletionStream(LlmRequest request) async* {}

  @override
  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request) async =>
      const AppResult<LlmResponse>.success(
        LlmResponse(content: ''),
      );

  @override
  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  }) async =>
      listModelsResult ?? const AppResult<List<LlmModel>>.success(<LlmModel>[]);

  @override
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  }) async =>
      testConnectionResult ?? const AppResult<void>.success(null);
}

class _FailingLlmProviderRepository implements LlmProviderRepository {
  const _FailingLlmProviderRepository(this.error);

  final AppError error;

  @override
  Future<AppResult<List<LlmProvider>>> getAll() async =>
      AppResult<List<LlmProvider>>.failure(error);

  @override
  Future<AppResult<LlmProvider?>> getById(String id) async =>
      AppResult<LlmProvider?>.failure(error);

  @override
  Future<AppResult<LlmProvider>> add(LlmProvider provider) async =>
      AppResult<LlmProvider>.failure(error);

  @override
  Future<AppResult<LlmProvider>> update(LlmProvider provider) async =>
      AppResult<LlmProvider>.failure(error);

  @override
  Future<AppResult<void>> remove(String id) async =>
      AppResult<void>.failure(error);

  @override
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings() async =>
      AppResult<LlmDefaultSettings>.failure(error);

  @override
  Future<AppResult<void>> setDefaultSettings(
    LlmDefaultSettings settings,
  ) async =>
      AppResult<void>.failure(error);
}

SettingsBloc _buildBloc({
  required InMemoryLlmProviderRepository repository,
  required InMemorySecretStorage secret,
  LlmClient? client,
}) =>
    SettingsBloc(
      repository: repository,
      client: client ?? _StubLlmClient(),
      secretStorage: secret,
    );

Future<SettingsState> _waitFor(
  SettingsBloc bloc,
  bool Function(SettingsState) predicate,
) async {
  if (predicate(bloc.state)) return bloc.state;
  return bloc.stream.firstWhere(predicate);
}

void main() {
  group('SettingsBloc', () {
    test('SettingsLoaded populates providers and defaults', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      await repo.add(
        LlmProvider(
          id: 'p1',
          projectId: 'global',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          secretKeyRef: 'novel_creator.llm.p1',
          selectedModelId: null,
          status: ProviderStatus.pendingConfig,
          createdAt: now,
          updatedAt: now,
        ),
      );
      final bloc = _buildBloc(repository: repo, secret: secret);
      bloc.add(const SettingsLoaded());
      final loaded = await _waitFor(
        bloc,
        (s) => !s.isLoading && s.providers.isNotEmpty,
      );
      expect(loaded.providers, hasLength(1));
      expect(loaded.providers.single.id, 'p1');
      expect(loaded.defaultSettings, LlmDefaultSettings.empty);
      await bloc.close();
    });

    test('ProviderAdded writes secret then persists provider', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final bloc = _buildBloc(repository: repo, secret: secret);
      bloc.add(
        const ProviderAdded(
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'sk-test',
          status: ProviderStatus.pendingConfig,
        ),
      );
      final state = await _waitFor(
        bloc,
        (s) => s.providers.isNotEmpty,
      );
      expect(state.providers, hasLength(1));
      final ref = state.providers.single.secretKeyRef;
      expect(ref, startsWith('novel_creator.llm.'));
      final read = await secret.read(ref: ref);
      expect((read as AppSuccess<String?>).value, 'sk-test');
      await bloc.close();
    });

    test('ConnectionTested success sets provider status to connected',
        () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      await repo.add(
        LlmProvider(
          id: 'p1',
          projectId: 'global',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          secretKeyRef: 'novel_creator.llm.p1',
          selectedModelId: 'gpt-4o',
          status: ProviderStatus.pendingConfig,
          createdAt: now,
          updatedAt: now,
        ),
      );
      await secret.write(ref: 'novel_creator.llm.p1', value: 'sk-test');
      final client = _StubLlmClient(
        testConnectionResult: const AppResult<void>.success(null),
      );
      final bloc = _buildBloc(
        repository: repo,
        secret: secret,
        client: client,
      );
      bloc.add(const SettingsLoaded());
      await _waitFor(bloc, (s) => s.providers.isNotEmpty);
      bloc.add(const ConnectionTested('p1'));
      final state = await _waitFor(
        bloc,
        (s) => s.testStatus == ConnectionTestStatus.success,
      );
      expect(
        state.providers.single.status,
        ProviderStatus.connected,
      );
      await bloc.close();
    });

    test('ConnectionTested failure sets error and status failure', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      await repo.add(
        LlmProvider(
          id: 'p1',
          projectId: 'global',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          secretKeyRef: 'novel_creator.llm.p1',
          selectedModelId: 'gpt-4o',
          status: ProviderStatus.pendingConfig,
          createdAt: now,
          updatedAt: now,
        ),
      );
      await secret.write(ref: 'novel_creator.llm.p1', value: 'sk-test');
      final client = _StubLlmClient(
        testConnectionResult: const AppResult<void>.failure(
          AppError(
            code: 'llm.auth_failed',
            message: 'auth failed',
            userMessage: '认证失败',
            source: AppErrorSource.llm,
            recoverable: true,
          ),
        ),
      );
      final bloc = _buildBloc(
        repository: repo,
        secret: secret,
        client: client,
      );
      bloc.add(const SettingsLoaded());
      await _waitFor(bloc, (s) => s.providers.isNotEmpty);
      bloc.add(const ConnectionTested('p1'));
      final state = await _waitFor(
        bloc,
        (s) => s.testStatus == ConnectionTestStatus.failure,
      );
      expect(state.error?.code, 'llm.auth_failed');
      expect(state.providers.single.status, ProviderStatus.error);
      await bloc.close();
    });

    test('ModelTemperatureSet updates the cached model temperature',
        () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      const model = LlmModel(
        id: 'm1',
        modelId: 'gpt-4o',
        name: 'GPT-4o',
      );
      await repo.add(
        LlmProvider(
          id: 'p1',
          projectId: 'global',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          secretKeyRef: 'novel_creator.llm.p1',
          selectedModelId: 'gpt-4o',
          status: ProviderStatus.connected,
          createdAt: now,
          updatedAt: now,
          cachedModels: <LlmModel>[model],
        ),
      );
      final bloc = _buildBloc(repository: repo, secret: secret);
      bloc.add(const SettingsLoaded());
      await _waitFor(bloc, (s) => s.providers.isNotEmpty);
      bloc.add(
        const ModelTemperatureSet(
          providerId: 'p1',
          modelId: 'gpt-4o',
          temperature: 0.3,
        ),
      );
      final state = await _waitFor(
        bloc,
        (s) => s.providers.isNotEmpty &&
            s.providers.single.cachedModels.first.temperature == 0.3,
      );
      expect(state.providers.single.cachedModels.first.temperature, 0.3);
      await bloc.close();
    });

    test('DefaultModelChanged persists defaults', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final bloc = _buildBloc(repository: repo, secret: secret);
      const newSettings = LlmDefaultSettings(
        writingProviderId: 'p1',
        writingModelId: 'gpt-4o',
        reasoningProviderId: null,
        reasoningModelId: null,
        embeddingProviderId: null,
        embeddingModelId: null,
      );
      bloc.add(const DefaultModelChanged(newSettings));
      final state = await _waitFor(
        bloc,
        (s) => s.defaultSettings.writingProviderId == 'p1',
      );
      expect(state.defaultSettings, newSettings);
      final stored = await repo.getDefaultSettings();
      expect((stored as AppSuccess<LlmDefaultSettings>).value, newSettings);
      await bloc.close();
    });

    test('ModelsRefreshed writes returned models into the provider', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      await repo.add(
        LlmProvider(
          id: 'p1',
          projectId: 'global',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          secretKeyRef: 'novel_creator.llm.p1',
          selectedModelId: null,
          status: ProviderStatus.connected,
          createdAt: now,
          updatedAt: now,
        ),
      );
      await secret.write(ref: 'novel_creator.llm.p1', value: 'sk-test');
      final client = _StubLlmClient(
        listModelsResult: const AppResult<List<LlmModel>>.success(
          <LlmModel>[
            LlmModel(id: 'gpt-4o', modelId: 'gpt-4o', name: 'gpt-4o'),
            LlmModel(id: 'gpt-3.5', modelId: 'gpt-3.5', name: 'gpt-3.5'),
          ],
        ),
      );
      final bloc = _buildBloc(
        repository: repo,
        secret: secret,
        client: client,
      );
      bloc.add(const SettingsLoaded());
      await _waitFor(bloc, (s) => s.providers.isNotEmpty);
      bloc.add(const ModelsRefreshed('p1'));
      final state = await _waitFor(
        bloc,
        (s) => s.providers.isNotEmpty &&
            s.providers.single.cachedModels.length == 2,
      );
      expect(
        state.providers.single.cachedModels.map((m) => m.modelId).toList(),
        <String>['gpt-4o', 'gpt-3.5'],
      );
      await bloc.close();
    });

    test('SettingsLoaded surfaces error when repository fails', () async {
      const failure = AppError(
        code: 'llm_provider.load_failed',
        message: 'load failed',
        userMessage: '加载失败',
        source: AppErrorSource.storage,
        recoverable: true,
      );
      const repo = _FailingLlmProviderRepository(failure);
      final secret = InMemorySecretStorage();
      final bloc = SettingsBloc(
        repository: repo,
        client: _StubLlmClient(),
        secretStorage: secret,
      );
      bloc.add(const SettingsLoaded());
      final state = await _waitFor(
        bloc,
        (s) => !s.isLoading && s.error != null,
      );
      expect(state.error?.code, 'llm_provider.load_failed');
      expect(state.providers, isEmpty);
      await bloc.close();
    });

    test('ProviderUpdated with newApiKey overwrites stored secret', () async {
      final repo = InMemoryLlmProviderRepository();
      final secret = InMemorySecretStorage();
      final now = DateTime.utc(2026);
      final provider = LlmProvider(
        id: 'p1',
        projectId: 'global',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        secretKeyRef: 'novel_creator.llm.p1',
        selectedModelId: null,
        status: ProviderStatus.pendingConfig,
        createdAt: now,
        updatedAt: now,
      );
      await repo.add(provider);
      await secret.write(ref: 'novel_creator.llm.p1', value: 'sk-old');
      final bloc = _buildBloc(repository: repo, secret: secret);
      bloc.add(const SettingsLoaded());
      await _waitFor(bloc, (s) => s.providers.isNotEmpty);
      final renamed = provider.copyWith(name: 'OpenAI Renamed');
      bloc.add(ProviderUpdated(provider: renamed, newApiKey: 'sk-new'));
      final state = await _waitFor(
        bloc,
        (s) => s.providers.isNotEmpty &&
            s.providers.single.name == 'OpenAI Renamed',
      );
      expect(state.providers.single.name, 'OpenAI Renamed');
      final stored = await secret.read(ref: 'novel_creator.llm.p1');
      expect((stored as AppSuccess<String?>).value, 'sk-new');
      await bloc.close();
    });
  });
}
