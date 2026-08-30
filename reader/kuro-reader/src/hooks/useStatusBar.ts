import { useCallback, useEffect } from 'react';

import { CHROME_COLORS, updateStatusBarTheme } from '@/utils/capacitor';

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
      meta.content = isDark ? CHROME_COLORS.dark : CHROME_COLORS.light;
    }
  }, [isDark]);

  useEffect(() => {
    updateThemeColor();
    updateStatusBarTheme(isDark);
  }, [isDark, updateThemeColor]);
};

export default useStatusBar;
