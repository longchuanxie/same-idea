import type { TextFontFamily } from '@/types'

export interface TextReaderFontOption {
  family: TextFontFamily
  label: string
  fontFamily: string
}

/**
 * 文本阅读字体预设。
 * 优先使用设备自带中文字体，并为所有平台提供可离线回退的字体栈。
 */
export const TEXT_READER_FONT_OPTIONS: readonly TextReaderFontOption[] = [
  {
    family: 'serif',
    label: '宋体',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", SimSun, serif',
  },
  {
    family: 'kaiti',
    label: '楷体',
    fontFamily: '"Kaiti SC", "STKaiti", KaiTi, "楷体", serif',
  },
  {
    family: 'fangSong',
    label: '仿宋',
    fontFamily: '"STFangsong", FangSong, "仿宋", "Noto Serif SC", serif',
  },
  {
    family: 'sans',
    label: '黑体',
    fontFamily: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    family: 'rounded',
    label: '圆体',
    fontFamily: '"Yuanti SC", YouYuan, "幼圆", "Microsoft YaHei UI", "Noto Sans SC", sans-serif',
  },
  {
    family: 'literata',
    label: '文学体',
    fontFamily: 'Literata, "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
  },
  {
    family: 'monospace',
    label: '等宽',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", "Noto Sans Mono CJK SC", monospace',
  },
  {
    family: 'system',
    label: '系统',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  },
] as const

export function getTextReaderFontFamily(family: TextFontFamily): string {
  return TEXT_READER_FONT_OPTIONS.find((option) => option.family === family)?.fontFamily
    ?? TEXT_READER_FONT_OPTIONS[0].fontFamily
}
