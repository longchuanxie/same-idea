import 'package:novel_creator/domain/entities/llm_default_settings.dart';
import 'package:novel_creator/domain/entities/llm_provider.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/features/settings/bloc/connection_test_status.dart';
import 'package:novel_creator/features/settings/bloc/settings_tab.dart';

final class SettingsState {
  const SettingsState({
    required this.isLoading,
    required this.providers,
    required this.defaultSettings,
    required this.selectedTab,
    required this.testStatus,
    this.testingProviderId,
    this.error,
  });

  const SettingsState.initial()
      : isLoading = false,
        providers = const <LlmProvider>[],
        defaultSettings = LlmDefaultSettings.empty,
        selectedTab = SettingsTab.model,
        testStatus = ConnectionTestStatus.idle,
        testingProviderId = null,
        error = null;

  final bool isLoading;
  final List<LlmProvider> providers;
  final LlmDefaultSettings defaultSettings;
  final SettingsTab selectedTab;
  final ConnectionTestStatus testStatus;
  final String? testingProviderId;
  final AppError? error;

  SettingsState copyWith({
    bool? isLoading,
    List<LlmProvider>? providers,
    LlmDefaultSettings? defaultSettings,
    SettingsTab? selectedTab,
    ConnectionTestStatus? testStatus,
    String? testingProviderId,
    AppError? error,
    bool clearError = false,
    bool clearTestingProviderId = false,
  }) =>
      SettingsState(
        isLoading: isLoading ?? this.isLoading,
        providers: providers ?? this.providers,
        defaultSettings: defaultSettings ?? this.defaultSettings,
        selectedTab: selectedTab ?? this.selectedTab,
        testStatus: testStatus ?? this.testStatus,
        testingProviderId: clearTestingProviderId
            ? null
            : testingProviderId ?? this.testingProviderId,
        error: clearError ? null : error ?? this.error,
      );
}
