import { useEffect, useState } from 'react';

const LANDSCAPE_QUERY = '(orientation: landscape)';

/**
 * 订阅视口横竖屏状态（matchMedia），初始值同步读取当前状态。
 */
export function useLandscapeViewport(query: string = LANDSCAPE_QUERY): boolean {
  const [isLandscape, setIsLandscape] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setIsLandscape(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return isLandscape;
}
