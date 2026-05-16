import { useCallback, useEffect } from 'react';

import { updateStatusBarTheme } from '@/utils/capacitor';

const THEME_COLORS = {
  light: '#fdf8f8',
  dark: '#1c1b1c',
} as const;

/**
 * useStatusBar Hook
 *
 * @description 管理 Web 端 meta theme-color 和原生端状态栏主题色
 * @param isDark - 是否为暗黑模式
 */
export const useStatusBar = (isDark: boolean): void => {
  const updateThemeColor = useCallback(() => {
    const meta = document.getElementById('theme-color-meta') as HTMLMetaElement | null;
    if (meta) {
      meta.content = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    }
  }, [isDark]);

  useEffect(() => {
    updateThemeColor();
    updateStatusBarTheme(isDark);
  }, [isDark, updateThemeColor]);
};

export default useStatusBar;
