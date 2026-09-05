#ifndef RUNNER_FLUTTER_WINDOW_H_
#define RUNNER_FLUTTER_WINDOW_H_

#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <flutter/encodable_value.h>
#include <flutter/method_channel.h>
#include <flutter/standard_method_codec.h>
#include <shellapi.h>

#include <memory>
#include <string>

#include "win32_window.h"

// A window that does nothing but host a Flutter view.
class FlutterWindow : public Win32Window {
 public:
  // Creates a new FlutterWindow hosting a Flutter view running |project|.
  explicit FlutterWindow(const flutter::DartProject& project);
  virtual ~FlutterWindow();

 protected:
  // Win32Window:
  bool OnCreate() override;
  void OnDestroy() override;
  LRESULT MessageHandler(HWND window, UINT const message, WPARAM const wparam,
                         LPARAM const lparam) noexcept override;

 private:
  void SetupTrayIcon();
  void RemoveTrayIcon();
  void ShowTrayMenu(HWND hwnd);
  void ToggleWindowVisibility(HWND hwnd);
  void RequestCloseDecision(HWND hwnd);
  void HideWindow(HWND hwnd);
  void ExitApplication(HWND hwnd);
  void InvokeTrayMethod(const std::string& method);
  void InvokeTrayMethod(const std::string& method, const std::string& argument);
  bool ImportBackupFromFileDialog(HWND hwnd);
  bool ShowReminderNotification(const flutter::EncodableMap& arguments);
  void ApplyWindowSettings(const flutter::EncodableMap& settings);
  void SetAlwaysOnTop(bool enabled);
  void SetWindowOpacity(double opacity);
  void SetLaunchAtStartup(bool enabled);
  static std::string ReadStringSetting(const flutter::EncodableMap& settings,
                                       const char* key,
                                       const std::string& fallback);
  static bool ReadBoolSetting(const flutter::EncodableMap& settings,
                              const char* key,
                              bool fallback);
  static double ReadDoubleSetting(const flutter::EncodableMap& settings,
                                  const char* key,
                                  double fallback);
  static std::wstring GetExecutablePath();

  // The project to run.
  flutter::DartProject project_;

  // The Flutter instance hosted by this window.
  std::unique_ptr<flutter::FlutterViewController> flutter_controller_;

  std::unique_ptr<flutter::MethodChannel<flutter::EncodableValue>>
      tray_channel_;
  NOTIFYICONDATA tray_icon_data_{};
  bool tray_icon_added_ = false;
};

#endif  // RUNNER_FLUTTER_WINDOW_H_
