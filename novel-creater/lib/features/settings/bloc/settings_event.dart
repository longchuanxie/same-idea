import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/enums/provider_status.dart';
import 'package:novel_creator/features/settings/bloc/settings_tab.dart';

sealed class SettingsEvent {
  const SettingsEvent();
}

final class SettingsLoaded extends SettingsEvent {
  const SettingsLoaded();
}

final class SettingsTabSelected extends SettingsEvent {
  const SettingsTabSelected(this.tab);

  final SettingsTab tab;
}

final class ProviderAdded extends SettingsEvent {
  const ProviderAdded({
    required this.name,
    required this.baseUrl,
    required this.apiKey,
    required this.status,
  });

  final String name;
  final String baseUrl;
  final String apiKey;
  final ProviderStatus status;
}

final class ProviderUpdated extends SettingsEvent {
  const ProviderUpdated({required this.provider, this.newApiKey});

  final LlmProvider provider;
  final String? newApiKey;
}

final class ProviderRemoved extends SettingsEvent {
  const ProviderRemoved(this.providerId);

  final String providerId;
}

final class ConnectionTested extends SettingsEvent {
  const ConnectionTested(this.providerId);

  final String providerId;
}

final class ModelsRefreshed extends SettingsEvent {
  const ModelsRefreshed(this.providerId);

  final String providerId;
}

final class ModelSelected extends SettingsEvent {
  const ModelSelected({required this.providerId, required this.modelId});

  final String providerId;
  final String modelId;
}

final class ModelTemperatureSet extends SettingsEvent {
  const ModelTemperatureSet({
    required this.providerId,
    required this.modelId,
    required this.temperature,
  });

  final String providerId;
  final String modelId;
  final double? temperature;
}

final class DefaultModelChanged extends SettingsEvent {
  const DefaultModelChanged(this.settings);

  final LlmDefaultSettings settings;
}

final class ParametersUpdated extends SettingsEvent {
  const ParametersUpdated({this.temperature, this.topP, this.streaming});

  final double? temperature;
  final double? topP;
  final bool? streaming;
}
