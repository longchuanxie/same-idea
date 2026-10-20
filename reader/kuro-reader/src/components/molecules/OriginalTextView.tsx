/**
 * 原版式正文视图：foliate-js `<foliate-view>` 的 React 封装（EPUB/MOBI 保真渲染）。
 *
 * 渲染原始文件（作者 CSS/绕排/SVG/表格全保留），CSS 多栏分页，触摸滑动翻页走
 * foliate 自带手势。Kuro 侧职责：
 * - relocate → 全书比例锚（fraction）+ CFI 回传外层进度
 * - load（每章文档就绪）→ 注入阅读器纸色（不带 important，作者显式背景优先——保真原则）
 *   + 转发 iframe 内点击（不冒泡：左/右 30% 翻页、中间呼出 UI；链接交给 foliate 自身）
 * - open 完成后经 apiRef 暴露 next/prev/goToFraction 供键盘等外层入口驱动
 *
 * M1 边界：划线批注/听书/书内检索在原版式模式下不生效——iframe 内 selection
 * 不达主文档，与 Kuro 的选区动作条天然隔离，无需额外屏蔽。
 */
import { useEffect, useRef, type FC, type MutableRefObject } from 'react'

import 'foliate-js/view.js'

/** foliate-js <foliate-view> 的最小结构面（custom element，createElement 产物） */
interface FoliateView extends HTMLElement {
  open(book: Blob): Promise<void>
  next(): Promise<void>
  prev(): Promise<void>
  goToFraction(fraction: number): Promise<void>
}

export interface OriginalTextLocation {
  fraction: number
  cfi?: string
}

export interface OriginalTextApi {
  next: () => void
  prev: () => void
  goToFraction: (fraction: number) => void
}

export interface OriginalTextViewProps {
  blob: Blob
  /** 打开后的起始位置（全书比例）；null/0 从头读 */
  initialFraction: number | null
  /** 阅读器纸色（注入章节文档底色；变化只影响后载章节，不重挂整书） */
  background: string
  color: string
  onRelocate: (location: OriginalTextLocation) => void
  onToggleUi: () => void
  apiRef: MutableRefObject<OriginalTextApi | null>
}

/** 点击翻页区宽度比例（与重排版模式 getPaginatedTapAction 的左右区语义一致） */
const ORIGINAL_TAP_ZONE_RATIO = 0.3

export const OriginalTextView: FC<OriginalTextViewProps> = ({
  blob,
  initialFraction,
  background,
  color,
  onRelocate,
  onToggleUi,
  apiRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // 回调/主题色经 ref 保持监听器闭包新鲜（主题切换不重挂整书）
  const onRelocateRef = useRef(onRelocate)
  onRelocateRef.current = onRelocate
  const onToggleUiRef = useRef(onToggleUi)
  onToggleUiRef.current = onToggleUi
  const themeRef = useRef({ background, color })
  themeRef.current = { background, color }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const view = document.createElement('foliate-view') as FoliateView
    // view.js 只给内部 renderer 设了样式，宿主元素默认 inline：height:100% 无效
    view.style.display = 'block'
    view.style.width = '100%'
    view.style.height = '100%'
    let cancelled = false

    const handleRelocate = (event: Event): void => {
      const detail = (event as CustomEvent).detail as { fraction?: number; cfi?: string }
      onRelocateRef.current({ fraction: detail.fraction ?? 0, cfi: detail.cfi })
    }
    const handleLoad = (event: Event): void => {
      const detail = (event as CustomEvent).detail as { doc?: Document } | null
      const doc = detail?.doc
      if (!doc?.head) return
      const { background: bg, color: fg } = themeRef.current
      const style = doc.createElement('style')
      style.textContent = `html { background: ${bg}; color: ${fg}; }`
      doc.head.appendChild(style)
      doc.addEventListener('click', (clickEvent) => {
        const target = clickEvent.target as HTMLElement | null
        if (target?.closest?.('a[href]')) return
        const win = doc.defaultView
        if (!win?.innerWidth) return
        const ratio = clickEvent.clientX / win.innerWidth
        if (ratio < ORIGINAL_TAP_ZONE_RATIO) apiRef.current?.prev()
        else if (ratio > 1 - ORIGINAL_TAP_ZONE_RATIO) apiRef.current?.next()
        else onToggleUiRef.current()
      })
    }

    view.addEventListener('relocate', handleRelocate)
    view.addEventListener('load', handleLoad)
    container.appendChild(view)

    void (async () => {
      try {
        // foliate 的 makeBook 按扩展名分流（isCBZ/isFB2 解构 file.name）：裸 Blob 没有
        // name 会在第一道判断崩溃，必须包成 File；EPUB 名走 zip 内容判定，MOBI 走魔数
        await view.open(new File([blob], 'book.epub', { type: blob.type }))
        if (cancelled) return
        apiRef.current = {
          next: () => void view.next(),
          prev: () => void view.prev(),
          goToFraction: (fraction: number) => void view.goToFraction(fraction),
        }
        if (initialFraction && initialFraction > 0) await view.goToFraction(initialFraction)
      } catch (error) {
        console.error('[OriginalTextView] 打开原版式书籍失败', error)
      }
    })()

    return () => {
      cancelled = true
      apiRef.current = null
      view.removeEventListener('relocate', handleRelocate)
      view.removeEventListener('load', handleLoad)
      view.remove()
    }
    // blob 是唯一重挂维度：换书才整书重开；初始位置只消费一次，主题色经 ref 热更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob])

  return <div ref={containerRef} className="h-full w-full" />
}

export default OriginalTextView
