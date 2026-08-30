import type { CSSProperties } from 'react'

import type { AnnotationStyle } from '@/types'

/** 批注在正文中的呈现方式：className 承载水彩笔 mask 形态，style 承载颜色等内联样式 */
export interface AnnotationPresentation {
  className: string
  style: CSSProperties
}

/** 水彩笔笔触形态数量，对应 index.css 中 annotation-marker-v0..v2 三套墨迹 */
const MARKER_VARIANT_COUNT = 3
/** 批注 id 散列乘数（质数，让相邻 id 的散列分布更均匀） */
const MARKER_VARIANT_HASH_MULTIPLIER = 31

/** 由批注 id 稳定散列出一支笔触，让相邻批注的涂抹形态各不相同、且刷新后保持不变 */
function pickMarkerVariant(seed: string | undefined): number {
  if (!seed) return 0
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * MARKER_VARIANT_HASH_MULTIPLIER + seed.charCodeAt(index)) >>> 0
  }
  return hash % MARKER_VARIANT_COUNT
}

export function getAnnotationPresentation(
  style: AnnotationStyle | undefined,
  color: string,
  seed?: string
): AnnotationPresentation {
  switch (style) {
    case 'underline':
      return {
        className: '',
        style: {
          textDecoration: 'underline',
          textDecorationColor: color,
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
          cursor: 'pointer',
        },
      }
    case 'wavy':
      return {
        className: '',
        style: {
          textDecoration: 'underline wavy',
          textDecorationColor: color,
          textDecorationThickness: '1.5px',
          textUnderlineOffset: '4px',
          cursor: 'pointer',
        },
      }
    case 'highlight':
    default:
      // 水彩笔涂抹：墨迹形状由 mask 数据驱动（见 index.css .annotation-marker），
      // mask 通道控制浓淡，中央墨芯实心保证文字锐利；颜色沿用批注色半透明混合以适配全部纸张主题
      return {
        className: `annotation-marker annotation-marker-v${pickMarkerVariant(seed)}`,
        style: {
          '--annotation-marker-color': `color-mix(in srgb, ${color} 27%, transparent)`,
          cursor: 'pointer',
        } as CSSProperties,
      }
  }
}
