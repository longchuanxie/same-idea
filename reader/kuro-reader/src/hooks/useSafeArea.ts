import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * useSafeArea Hook
 *
 * @description 获取设备安全区域边距，用于适配刘海屏、灵动岛、Home Indicator 等
 * @returns 当前设备的安全区域边距值
 */
export const useSafeArea = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const styles = getComputedStyle(document.documentElement);
      const top = parseFloat(styles.getPropertyValue('--sat') || '0');
      const bottom = parseFloat(styles.getPropertyValue('--sab') || '0');
      const left = parseFloat(styles.getPropertyValue('--sal') || '0');
      const right = parseFloat(styles.getPropertyValue('--sar') || '0');

      setInsets({ top, bottom, left, right });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
};

export default useSafeArea;
