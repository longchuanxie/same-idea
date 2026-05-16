import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

const THEME_COLORS = {
  light: '#fdf8f8',
  dark: '#1c1b1c',
} as const;

export async function initNativeFeatures(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: THEME_COLORS.light });
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
    const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
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
