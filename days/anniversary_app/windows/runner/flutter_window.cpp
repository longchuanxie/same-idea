#include "flutter_window.h"

#include <commdlg.h>
#include <optional>

#include "flutter/generated_plugin_registrant.h"
#include "resource.h"
#include "utils.h"

namespace {
constexpr UINT kTrayMessage = WM_APP + 1;
constexpr UINT kTrayIconId = 1001;
constexpr UINT kMenuToggleVisibility = 40001;
constexpr UINT kMenuImportBackup = 40002;
constexpr UINT kMenuRefresh = 40003;
constexpr UINT kMenuSettings = 40004;
constexpr UINT kMenuExit = 40005;
}  // namespace

FlutterWindow::FlutterWindow(const flutter::DartProject& project)
    : project_(project) {}

FlutterWindow::~FlutterWindow() {}

bool FlutterWindow::OnCreate() {
  if (!Win32Window::OnCreate()) {
    return false;
  }

  RECT frame = GetClientArea();

  // The size here must match the window dimensions to avoid unnecessary surface
  // creation / destruction in the startup path.
  flutter_controller_ = std::make_unique<flutter::FlutterViewController>(
      frame.right - frame.left, frame.bottom - frame.top, project_);
  // Ensure that basic setup of the controller was successful.
  if (!flutter_controller_->engine() || !flutter_controller_->view()) {
    return false;
  }
  RegisterPlugins(flutter_controller_->engine());
  tray_channel_ = std::make_unique<flutter::MethodChannel<flutter::EncodableValue>>(
      flutter_controller_->engine()->messenger(), "same_idea_days/windows_tray",
      &flutter::StandardMethodCodec::GetInstance());
  tray_channel_->SetMethodCallHandler(
      [this](const flutter::MethodCall<flutter::EncodableValue>& call,
             std::unique_ptr<flutter::MethodResult<flutter::EncodableValue>>
                 result) {
        if (call.method_name() == "applySettings") {
          const auto* arguments = call.arguments();
          const auto* settings =
              arguments == nullptr
                  ? nullptr
                  : std::get_if<flutter::EncodableMap>(arguments);
          if (settings == nullptr) {
            result->Error("invalid_arguments", "Settings map is required.");
            return;
          }
          ApplyWindowSettings(*settings);
          result->Success();
          return;
        }
        if (call.method_name() == "pickBackupFile") {
          result->Success(
              flutter::EncodableValue(ImportBackupFromFileDialog(GetHandle())));
          return;
        }
        if (call.method_name() == "showReminderNotification") {
          const auto* arguments = call.arguments();
          const auto* notification =
              arguments == nullptr
                  ? nullptr
                  : std::get_if<flutter::EncodableMap>(arguments);
          if (notification == nullptr) {
            result->Error("invalid_arguments",
                          "Notification map is required.");
            return;
          }
          result->Success(flutter::EncodableValue(
              ShowReminderNotification(*notification)));
          return;
        }
        if (call.method_name() == "hideWindow") {
          HideWindow(GetHandle());
          result->Success();
          return;
        }
        if (call.method_name() == "exitApp") {
          result->Success();
          ExitApplication(GetHandle());
          return;
        }
        result->NotImplemented();
      });
  SetChildContent(flutter_controller_->view()->GetNativeWindow());
  SetupTrayIcon();

  flutter_controller_->engine()->SetNextFrameCallback([&]() {
    this->Show();
  });

  // Flutter can complete the first frame before the "show window" callback is
  // registered. The following call ensures a frame is pending to ensure the
  // window is shown. It is a no-op if the first frame hasn't completed yet.
  flutter_controller_->ForceRedraw();

  return true;
}

void FlutterWindow::OnDestroy() {
  RemoveTrayIcon();
  if (flutter_controller_) {
    flutter_controller_ = nullptr;
  }

  Win32Window::OnDestroy();
}

LRESULT
FlutterWindow::MessageHandler(HWND hwnd, UINT const message,
                              WPARAM const wparam,
                              LPARAM const lparam) noexcept {
  // Give Flutter, including plugins, an opportunity to handle window messages.
  if (flutter_controller_) {
    std::optional<LRESULT> result =
        flutter_controller_->HandleTopLevelWindowProc(hwnd, message, wparam,
                                                      lparam);
    if (result) {
      return *result;
    }
  }

  switch (message) {
    case kTrayMessage:
      if (lparam == WM_RBUTTONUP || lparam == WM_CONTEXTMENU) {
        ShowTrayMenu(hwnd);
        return 0;
      }
      if (lparam == WM_LBUTTONDBLCLK || lparam == WM_LBUTTONUP) {
        if (!IsWindowVisible(hwnd)) {
          ShowWindow(hwnd, SW_SHOWNORMAL);
        }
        SetForegroundWindow(hwnd);
        return 0;
      }
      break;
    case WM_COMMAND:
      switch (LOWORD(wparam)) {
        case kMenuToggleVisibility:
          ToggleWindowVisibility(hwnd);
          return 0;
        case kMenuImportBackup:
          ImportBackupFromFileDialog(hwnd);
          return 0;
        case kMenuRefresh:
          InvokeTrayMethod("refresh");
          return 0;
        case kMenuSettings:
          if (!IsWindowVisible(hwnd)) {
            ShowWindow(hwnd, SW_SHOWNORMAL);
          }
          SetForegroundWindow(hwnd);
          InvokeTrayMethod("openSettings");
          return 0;
        case kMenuExit:
          RemoveTrayIcon();
          DestroyWindow(hwnd);
          return 0;
      }
      break;
    case WM_CLOSE:
      RequestCloseDecision(hwnd);
      return 0;
    case WM_FONTCHANGE:
      flutter_controller_->engine()->ReloadSystemFonts();
      break;
  }

  return Win32Window::MessageHandler(hwnd, message, wparam, lparam);
}

void FlutterWindow::SetupTrayIcon() {
  if (tray_icon_added_ || GetHandle() == nullptr) {
    return;
  }

  tray_icon_data_ = {};
  tray_icon_data_.cbSize = sizeof(NOTIFYICONDATA);
  tray_icon_data_.hWnd = GetHandle();
  tray_icon_data_.uID = kTrayIconId;
  tray_icon_data_.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP;
  tray_icon_data_.uCallbackMessage = kTrayMessage;
  tray_icon_data_.hIcon =
      LoadIcon(GetModuleHandle(nullptr), MAKEINTRESOURCE(IDI_APP_ICON));
  wcscpy_s(tray_icon_data_.szTip, L"\u4ECA\u5FF5");

  tray_icon_added_ = Shell_NotifyIcon(NIM_ADD, &tray_icon_data_) == TRUE;
  if (tray_icon_added_) {
    tray_icon_data_.uVersion = NOTIFYICON_VERSION_4;
    Shell_NotifyIcon(NIM_SETVERSION, &tray_icon_data_);
  }
}

void FlutterWindow::RemoveTrayIcon() {
  if (!tray_icon_added_) {
    return;
  }
  Shell_NotifyIcon(NIM_DELETE, &tray_icon_data_);
  tray_icon_added_ = false;
}

void FlutterWindow::ShowTrayMenu(HWND hwnd) {
  HMENU menu = CreatePopupMenu();
  if (menu == nullptr) {
    return;
  }

  AppendMenu(menu, MF_STRING, kMenuToggleVisibility,
             IsWindowVisible(hwnd) ? L"\u9690\u85CF" : L"\u663E\u793A");
  AppendMenu(menu, MF_STRING, kMenuImportBackup,
             L"\u5BFC\u5165\u5907\u4EFD...");
  AppendMenu(menu, MF_STRING, kMenuRefresh, L"\u5237\u65B0");
  AppendMenu(menu, MF_STRING, kMenuSettings, L"\u8BBE\u7F6E");
  AppendMenu(menu, MF_SEPARATOR, 0, nullptr);
  AppendMenu(menu, MF_STRING, kMenuExit, L"\u9000\u51FA");

  POINT cursor_position;
  GetCursorPos(&cursor_position);
  SetForegroundWindow(hwnd);
  TrackPopupMenu(menu, TPM_RIGHTBUTTON | TPM_BOTTOMALIGN | TPM_LEFTALIGN,
                 cursor_position.x, cursor_position.y, 0, hwnd, nullptr);
  DestroyMenu(menu);
}

void FlutterWindow::ToggleWindowVisibility(HWND hwnd) {
  if (IsWindowVisible(hwnd)) {
    HideWindow(hwnd);
  } else {
    ShowWindow(hwnd, SW_SHOWNORMAL);
    SetForegroundWindow(hwnd);
  }
}

void FlutterWindow::RequestCloseDecision(HWND hwnd) {
  if (!tray_channel_) {
    HideWindow(hwnd);
    return;
  }
  InvokeTrayMethod("requestClose");
}

void FlutterWindow::HideWindow(HWND hwnd) {
  if (hwnd != nullptr) {
    ShowWindow(hwnd, SW_HIDE);
  }
}

void FlutterWindow::ExitApplication(HWND hwnd) {
  RemoveTrayIcon();
  if (hwnd != nullptr) {
    DestroyWindow(hwnd);
  }
}

void FlutterWindow::InvokeTrayMethod(const std::string& method) {
  if (!tray_channel_) {
    return;
  }
  tray_channel_->InvokeMethod(method, nullptr);
}

void FlutterWindow::InvokeTrayMethod(const std::string& method,
                                     const std::string& argument) {
  if (!tray_channel_) {
    return;
  }
  auto encoded_argument =
      std::make_unique<flutter::EncodableValue>(argument);
  tray_channel_->InvokeMethod(method, std::move(encoded_argument));
}

bool FlutterWindow::ImportBackupFromFileDialog(HWND hwnd) {
  wchar_t file_name[MAX_PATH] = L"";
  OPENFILENAMEW open_file_name = {};
  open_file_name.lStructSize = sizeof(OPENFILENAMEW);
  open_file_name.hwndOwner = hwnd;
  open_file_name.lpstrFile = file_name;
  open_file_name.nMaxFile = MAX_PATH;
  open_file_name.lpstrFilter = L"Anniversary backup (*.json)\0*.json\0All files (*.*)\0*.*\0";
  open_file_name.nFilterIndex = 1;
  open_file_name.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;

  if (GetOpenFileNameW(&open_file_name) == TRUE) {
    if (!IsWindowVisible(hwnd)) {
      ShowWindow(hwnd, SW_SHOWNORMAL);
    }
    SetForegroundWindow(hwnd);
    InvokeTrayMethod("importBackup", Utf8FromUtf16(file_name));
    return true;
  }
  return false;
}

bool FlutterWindow::ShowReminderNotification(
    const flutter::EncodableMap& arguments) {
  SetupTrayIcon();
  if (!tray_icon_added_) {
    return false;
  }

  const std::wstring title = Utf16FromUtf8(
      ReadStringSetting(arguments, "title", "\xE4\xBB\x8A\xE5\xBF\xB5"));
  const std::wstring body =
      Utf16FromUtf8(ReadStringSetting(arguments, "body", ""));

  NOTIFYICONDATA notification = tray_icon_data_;
  notification.uFlags = NIF_INFO;
  notification.dwInfoFlags = NIIF_INFO;
  wcsncpy_s(notification.szInfoTitle, title.c_str(), _TRUNCATE);
  wcsncpy_s(notification.szInfo, body.c_str(), _TRUNCATE);
  return Shell_NotifyIcon(NIM_MODIFY, &notification) == TRUE;
}

void FlutterWindow::ApplyWindowSettings(
    const flutter::EncodableMap& settings) {
  SetAlwaysOnTop(ReadBoolSetting(settings, "alwaysOnTop", true));
  SetWindowOpacity(ReadDoubleSetting(settings, "opacity", 0.94));
  SetLaunchAtStartup(ReadBoolSetting(settings, "launchAtStartup", false));
}

void FlutterWindow::SetAlwaysOnTop(bool enabled) {
  HWND hwnd = GetHandle();
  if (hwnd == nullptr) {
    return;
  }
  SetWindowPos(hwnd, enabled ? HWND_TOPMOST : HWND_NOTOPMOST, 0, 0, 0, 0,
               SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
}

void FlutterWindow::SetWindowOpacity(double opacity) {
  HWND hwnd = GetHandle();
  if (hwnd == nullptr) {
    return;
  }
  if (opacity < 0.62) {
    opacity = 0.62;
  }
  if (opacity > 1.0) {
    opacity = 1.0;
  }

  LONG ex_style = GetWindowLong(hwnd, GWL_EXSTYLE);
  SetWindowLong(hwnd, GWL_EXSTYLE, ex_style | WS_EX_LAYERED);
  BYTE alpha = static_cast<BYTE>(opacity * 255);
  SetLayeredWindowAttributes(hwnd, 0, alpha, LWA_ALPHA);
}

void FlutterWindow::SetLaunchAtStartup(bool enabled) {
  HKEY key;
  const wchar_t* run_key =
      L"Software\\Microsoft\\Windows\\CurrentVersion\\Run";
  if (RegCreateKeyExW(HKEY_CURRENT_USER, run_key, 0, nullptr, 0, KEY_SET_VALUE,
                      nullptr, &key, nullptr) != ERROR_SUCCESS) {
    return;
  }

  const wchar_t* value_name = L"SameIdeaDays";
  if (enabled) {
    std::wstring command = L"\"" + GetExecutablePath() + L"\"";
    RegSetValueExW(key, value_name, 0, REG_SZ,
                   reinterpret_cast<const BYTE*>(command.c_str()),
                   static_cast<DWORD>((command.size() + 1) * sizeof(wchar_t)));
  } else {
    RegDeleteValueW(key, value_name);
  }
  RegCloseKey(key);
}

std::string FlutterWindow::ReadStringSetting(
    const flutter::EncodableMap& settings,
    const char* key,
    const std::string& fallback) {
  auto iterator = settings.find(flutter::EncodableValue(key));
  if (iterator == settings.end()) {
    return fallback;
  }
  if (const auto* value = std::get_if<std::string>(&iterator->second)) {
    return *value;
  }
  return fallback;
}

bool FlutterWindow::ReadBoolSetting(const flutter::EncodableMap& settings,
                                    const char* key,
                                    bool fallback) {
  auto iterator = settings.find(flutter::EncodableValue(key));
  if (iterator == settings.end()) {
    return fallback;
  }
  if (const auto* value = std::get_if<bool>(&iterator->second)) {
    return *value;
  }
  return fallback;
}

double FlutterWindow::ReadDoubleSetting(const flutter::EncodableMap& settings,
                                        const char* key,
                                        double fallback) {
  auto iterator = settings.find(flutter::EncodableValue(key));
  if (iterator == settings.end()) {
    return fallback;
  }
  if (const auto* value = std::get_if<double>(&iterator->second)) {
    return *value;
  }
  if (const auto* value = std::get_if<int32_t>(&iterator->second)) {
    return static_cast<double>(*value);
  }
  if (const auto* value = std::get_if<int64_t>(&iterator->second)) {
    return static_cast<double>(*value);
  }
  return fallback;
}

std::wstring FlutterWindow::GetExecutablePath() {
  wchar_t path[MAX_PATH];
  DWORD length = GetModuleFileNameW(nullptr, path, MAX_PATH);
  if (length == 0 || length == MAX_PATH) {
    return L"";
  }
  return std::wstring(path, length);
}
