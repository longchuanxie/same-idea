import type { ReadingTheme } from '@/types';

/** 文本阅读器主题 —— 全应用单源。
 *  此前在 TextReader/index.tsx 与 TextReaderBottomBar.tsx 重复定义（建议书 3.3 去重清单）。 */
export const READING_THEMES: { theme: ReadingTheme; label: string; bg: string; color: string }[] = [
  { theme: 'light', label: '白色', bg: '#ffffff', color: '#1a1a1a' },
  { theme: 'green', label: '护眼', bg: '#c7edcc', color: '#2d3a2d' },
  { theme: 'sepia', label: '羊皮纸', bg: '#f5e6c8', color: '#5b4636' },
  { theme: 'dark', label: '暗夜', bg: '#1a1a1a', color: '#b8b8b8' },
];

export const DEFAULT_READING_THEME = READING_THEMES[0];

export const getReadingTheme = (theme: string): { bg: string; color: string } => {
  return READING_THEMES.find((t) => t.theme === theme) ?? DEFAULT_READING_THEME;
};
