import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

import { TextFocus } from '@/plugins/TextFocusPlugin';

export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

/** 顶栏/状态栏 chrome 色 —— 全应用单源（useStatusBar 与原生初始化共用）。
 *  值与 src/index.css 的 surface 令牌保持同步：浅 #F7F4EE / 深 #201D19。 */
export const CHROME_COLORS = {
  light: '#F7F4EE',
  dark: '#201D19',
} as const;

/** 非文本类 input（焦点落上不该放行系统选择工具栏） */
const NON_TEXT_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit', 'hidden',
]);

const isTextEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.tagName === 'TEXTAREA') return true;
  return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type);
};

/** 焦点信号上报原生：焦点在可编辑元素时放行 Android 输入框的系统复制/粘贴工具栏。
 *  输入框与阅读器正文的浮动工具栏同为 TYPE_FLOATING，原生靠本信号区分（TextFocusPlugin）。
 *  焦点事件先于长按（约 500ms）触发，信号就位时工具栏尚未起播，无需考虑竞态。 */
const notifyTextFocus = (focused: boolean): void => {
  TextFocus.setFocused({ focused }).catch(() => {
    // 原生插件缺席（平台不支持）：维持默认抑制策略
  });
};

const installTextFocusReporter = (): void => {
  // 仅 Android 原生有 TYPE_FLOATING 抑制逻辑；Web/iOS 不上报
  if (!isAndroid()) return;
  document.addEventListener('focusin', (e) => notifyTextFocus(isTextEditableElement(e.target)));
  document.addEventListener('focusout', () => notifyTextFocus(false));
  // WebView 重载后重置原生侧信号（新页面初始无焦点）
  notifyTextFocus(false);
};

export async function initNativeFeatures(): Promise<void> {
  if (!isNativePlatform()) return;

  installTextFocusReporter();

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: CHROME_COLORS.light });
  } catch {
    // StatusBar not available
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch {
    // Keyboard not available
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch {
    // SplashScreen not available
  }
}

export async function updateStatusBarTheme(isDark: boolean): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    const color = isDark ? CHROME_COLORS.dark : CHROME_COLORS.light;
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
  } catch {
    // StatusBar not available
  }
}

/** 沉浸阅读开关：隐藏/恢复系统状态栏（仅原生端生效）。
 *  原生侧已设 BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE，隐藏后顶部下滑仅临时呼出并自动收回。 */
export async function setStatusBarHidden(hidden: boolean): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    if (hidden) {
      await StatusBar.hide();
    } else {
      await StatusBar.show();
    }
  } catch {
    // StatusBar not available
  }
}

export async function hideSplashScreen(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch {
    // ignore
  }
}
