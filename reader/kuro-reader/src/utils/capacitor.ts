import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

/** 顶栏/状态栏 chrome 色 —— 全应用单源（useStatusBar 与原生初始化共用）。
 *  值与 src/index.css 的 surface 令牌保持同步：浅 #F7F4EE / 深 #201D19。 */
export const CHROME_COLORS = {
  light: '#F7F4EE',
  dark: '#201D19',
} as const;

export async function initNativeFeatures(): Promise<void> {
  if (!isNativePlatform()) return;

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

export async function hideSplashScreen(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch {
    // ignore
  }
}
