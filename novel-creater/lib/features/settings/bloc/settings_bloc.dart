import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_model.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/domain/repositories/llm_provider_repository.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/secure/secret_storage.dart';
import 'package:novel_creator/features/settings/bloc/connection_test_status.dart';
import 'package:novel_creator/features/settings/bloc/settings_event.dart';
import 'package:novel_creator/features/settings/bloc/settings_state.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc({
    required LlmProviderRepository repository,
    required LlmClient client,
    required SecretStorage secretStorage,
    String secretRefPrefix = 'novel_creator.llm.',
  })  : _repository = repository,
        _client = client,
        _secretStorage = secretStorage,
        _secretRefPrefix = secretRefPrefix,
        super(const SettingsState.initial()) {
    on<SettingsLoaded>(_onLoaded);
    on<SettingsTabSelected>(_onTabSelected);
    on<ProviderAdded>(_onProviderAdded);
    on<ProviderUpdated>(_onProviderUpdated);
    on<ProviderRemoved>(_onProviderRemoved);
    on<ConnectionTested>(_onConnectionTested);
    on<ModelsRefreshed>(_onModelsRefreshed);
    on<ModelSelected>(_onModelSelected);
    on<ModelTemperatureSet>(_onModelTemperatureSet);
    on<DefaultModelChanged>(_onDefaultModelChanged);
    on<ParametersUpdated>(_onParametersUpdated);
  }

  final LlmProviderRepository _repository;
  final LlmClient _client;
  final SecretStorage _secretStorage;
  final String _secretRefPrefix;

  Future<void> _onLoaded(
    SettingsLoaded event,
    Emitter<SettingsState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearError: true));
    final providersResult = await _repository.getAll();
    final settingsResult = await _repository.getDefaultSettings();
    if (providersResult case AppFailure(:final error)) {
      emit(state.copyWith(isLoading: false, error: error));
      return;
    }
    if (settingsResult case AppFailure(:final error)) {
      emit(state.copyWith(isLoading: false, error: error));
      return;
    }
    final providers = (providersResult as AppSuccess<List<LlmProvider>>).value;
    final settings =
        (settingsResult as AppSuccess<LlmDefaultSettings>).value;
    emit(
      state.copyWith(
        isLoading: false,
        providers: providers,
        defaultSettings: settings,
      ),
    );
  }

  void _onTabSelected(
    SettingsTabSelected event,
    Emitter<SettingsState> emit,
  ) {
    emit(state.copyWith(selectedTab: event.tab, clearError: true));
  }

  Future<void> _onProviderAdded(
    ProviderAdded event,
    Emitter<SettingsState> emit,
  ) async {
    final id = IdGenerator.create('provider');
    final secretRef = '$_secretRefPrefix$id';
    final writeResult = await _secretStorage.write(
      ref: secretRef,
      value: event.apiKey,
    );
    if (writeResult case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    final now = DateTime.now().toUtc();
    final provider = LlmProvider(
      id: id,
      projectId: 'global',
      name: event.name,
      baseUrl: event.baseUrl,
      secretKeyRef: secretRef,
      selectedModelId: null,
      status: event.status,
      createdAt: now,
      updatedAt: now,
    );
    final addResult = await _repository.add(provider);
    if (addResult case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onProviderUpdated(
    ProviderUpdated event,
    Emitter<SettingsState> emit,
  ) async {
    if (event.newApiKey != null) {
      final writeResult = await _secretStorage.write(
        ref: event.provider.secretKeyRef,
        value: event.newApiKey!,
      );
      if (writeResult case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
    }
    final result = await _repository.update(event.provider);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onProviderRemoved(
    ProviderRemoved event,
    Emitter<SettingsState> emit,
  ) async {
    final provider = _findProvider(event.providerId);
    if (provider != null) {
      final deleteResult =
          await _secretStorage.delete(ref: provider.secretKeyRef);
      if (deleteResult case AppFailure(:final error)) {
        emit(state.copyWith(error: error));
        return;
      }
    }
    final result = await _repository.remove(event.providerId);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onConnectionTested(
    ConnectionTested event,
    Emitter<SettingsState> emit,
  ) async {
    final provider = _findProvider(event.providerId);
    if (provider == null) return;
    emit(
      state.copyWith(
        testStatus: ConnectionTestStatus.testing,
        testingProviderId: event.providerId,
        clearError: true,
      ),
    );
    final secretResult = await _secretStorage.read(ref: provider.secretKeyRef);
    if (secretResult case AppFailure(:final error)) {
      final updated = provider.copyWith(status: ProviderStatus.error);
      await _repository.update(updated);
      await _reloadProviders(emit, preserveTestStatus: true);
      emit(
        state.copyWith(
          testStatus: ConnectionTestStatus.failure,
          error: error,
          clearTestingProviderId: true,
        ),
      );
      return;
    }
    final apiKey = (secretResult as AppSuccess<String?>).value ?? '';
    final modelId = provider.selectedModelId ?? '';
    final result = await _client.testConnection(
      baseUrl: provider.baseUrl,
      apiKey: apiKey,
      modelId: modelId,
    );
    switch (result) {
      case AppSuccess():
        final updated = provider.copyWith(status: ProviderStatus.connected);
        await _repository.update(updated);
        await _reloadProviders(emit, preserveTestStatus: true);
        emit(
          state.copyWith(
            testStatus: ConnectionTestStatus.success,
            clearTestingProviderId: true,
          ),
        );
      case AppFailure(:final error):
        final updated = provider.copyWith(status: ProviderStatus.error);
        await _repository.update(updated);
        await _reloadProviders(emit, preserveTestStatus: true);
        emit(
          state.copyWith(
            testStatus: ConnectionTestStatus.failure,
            error: error,
            clearTestingProviderId: true,
          ),
        );
    }
  }

  Future<void> _onModelsRefreshed(
    ModelsRefreshed event,
    Emitter<SettingsState> emit,
  ) async {
    final provider = _findProvider(event.providerId);
    if (provider == null) return;
    final secretResult = await _secretStorage.read(ref: provider.secretKeyRef);
    if (secretResult case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    final apiKey = (secretResult as AppSuccess<String?>).value ?? '';
    final modelsResult = await _client.listModels(
      baseUrl: provider.baseUrl,
      apiKey: apiKey,
    );
    if (modelsResult case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    final models = (modelsResult as AppSuccess<List<LlmModel>>).value;
    final updated = provider.copyWith(cachedModels: models);
    final updateResult = await _repository.update(updated);
    if (updateResult case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onModelSelected(
    ModelSelected event,
    Emitter<SettingsState> emit,
  ) async {
    final provider = _findProvider(event.providerId);
    if (provider == null) return;
    final updated = provider.copyWith(selectedModelId: event.modelId);
    final result = await _repository.update(updated);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onModelTemperatureSet(
    ModelTemperatureSet event,
    Emitter<SettingsState> emit,
  ) async {
    final provider = _findProvider(event.providerId);
    if (provider == null) return;
    final newModels = <LlmModel>[
      for (final m in provider.cachedModels)
        if (m.modelId == event.modelId)
          m.copyWith(temperature: event.temperature)
        else
          m,
    ];
    final updated = provider.copyWith(cachedModels: newModels);
    final result = await _repository.update(updated);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    await _reloadProviders(emit);
  }

  Future<void> _onDefaultModelChanged(
    DefaultModelChanged event,
    Emitter<SettingsState> emit,
  ) async {
    final result = await _repository.setDefaultSettings(event.settings);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    emit(state.copyWith(defaultSettings: event.settings, clearError: true));
  }

  Future<void> _onParametersUpdated(
    ParametersUpdated event,
    Emitter<SettingsState> emit,
  ) async {
    final updated = state.defaultSettings.copyWith(
      defaultTemperature:
          event.temperature ?? state.defaultSettings.defaultTemperature,
      defaultTopP: event.topP ?? state.defaultSettings.defaultTopP,
      streamingEnabled:
          event.streaming ?? state.defaultSettings.streamingEnabled,
    );
    final result = await _repository.setDefaultSettings(updated);
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    emit(state.copyWith(defaultSettings: updated, clearError: true));
  }

  LlmProvider? _findProvider(String id) {
    for (final p in state.providers) {
      if (p.id == id) return p;
    }
    return null;
  }

  Future<void> _reloadProviders(
    Emitter<SettingsState> emit, {
    bool preserveTestStatus = false,
  }) async {
    final result = await _repository.getAll();
    if (result case AppFailure(:final error)) {
      emit(state.copyWith(error: error));
      return;
    }
    final providers = (result as AppSuccess<List<LlmProvider>>).value;
    emit(
      state.copyWith(
        providers: providers,
        clearError: !preserveTestStatus,
      ),
    );
  }
}
