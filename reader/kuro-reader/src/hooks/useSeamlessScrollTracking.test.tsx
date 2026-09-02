import { act, render } from '@testing-library/react'
import React, { useRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { useSeamlessScrollTracking } from './useSeamlessScrollTracking'
import type { TextChapter } from '@/services/textContent'

/** 等长章节：文档坐标第 i 章顶部 = i * 1000，章高 1000 */
const CHAPTER_SPACING = 1000
const VIEWPORT = 500
const TOTAL_SCROLLABLE = 7500

const chapters: TextChapter[] = Array.from({ length: 8 }, (_, i) => ({
  id: `ch-${i}`,
  title: `第${i + 1}章`,
  content: `第${i + 1}章内容`,
}))

interface Captured {
  api: ReturnType<typeof useSeamlessScrollTracking>
  container: HTMLDivElement
  currentChapterIndex?: number
  scrollPercent?: number
  chapterEndPrompt?: boolean
  saves?: unknown[][]
}

/**
 * 探针组件：渲染滚动容器 + 窗口内章节元素并登记到 scrollChapterElsRef。
 * jsdom 布局量全 0，用 defineProperty 提供确定性几何：
 * 章元素 rect.top 返回文档坐标 - 当前 scrollTop（模拟真实视口坐标随滚动平移，
 * 使 chapterGeometry 的 start = scrollTop + (top - hostTop) 还原为文档坐标）。
 */
function createHarness(overrides: Record<string, unknown> = {}) {
  const captured = {} as Captured

  const Probe: React.FC<{ ov?: Record<string, unknown> }> = ({ ov = {} }) => {
    const containerRef = useRef<HTMLDivElement | null>(null) as { current: HTMLDivElement | null }
    const api = useSeamlessScrollTracking({
      scrollContainerRef: containerRef,
      bookId: 'b1',
      chapters,
      currentChapterIndex: (ov.currentChapterIndex as number | undefined) ?? 0,
      setCurrentChapterIndex: (i: number) => {
        captured.currentChapterIndex = i
        // 模拟页面：切章是状态更新，下一次渲染生效
        utilsRef.current?.rerender({ ...(overridesRef.current ?? {}), currentChapterIndex: i })
      },
      isSeamlessReading: true,
      textReadingMode: 'scroll',
      isLoading: false,
      ttsActive: false,
      isProgressDragging: false,
      verticalWriting: false,
      showProgressHint: () => {},
      setScrollPercent: (p: number) => {
        captured.scrollPercent = p
      },
      setIsChapterEndPromptVisible: (v: boolean) => {
        captured.chapterEndPrompt = v
      },
      scheduleProgressSave: (...args: unknown[]) => {
        ;(captured.saves ||= []).push(args)
      },
      ...ov,
    } as Parameters<typeof useSeamlessScrollTracking>[0])
    captured.api = api

    return (
      <div
        ref={(el) => {
          if (!el) return
          captured.container = el
          containerRef.current = el
          Object.defineProperty(el, 'clientHeight', { value: VIEWPORT, configurable: true })
          Object.defineProperty(el, 'clientWidth', { value: VIEWPORT, configurable: true })
          Object.defineProperty(el, 'scrollHeight', { value: TOTAL_SCROLLABLE + VIEWPORT, configurable: true })
          Object.defineProperty(el, 'scrollWidth', { value: TOTAL_SCROLLABLE + VIEWPORT, configurable: true })
          Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true })
          Object.defineProperty(el, 'scrollTo', { value: () => {}, configurable: true })
          Object.defineProperty(el, 'getBoundingClientRect', {
            value: () => ({ top: 0, left: 0, right: VIEWPORT, bottom: VIEWPORT, width: VIEWPORT, height: VIEWPORT }),
            configurable: true,
          })
        }}
      >
        {Array.from({ length: Math.max(0, api.scrollWindow.end - api.scrollWindow.start) }, (_, i) => {
          const idx = api.scrollWindow.start + i
          return (
            <div
              key={idx}
              ref={(el) => {
                if (!el) return
                api.scrollChapterElsRef.current.set(idx, el)
                Object.defineProperty(el, 'getBoundingClientRect', {
                  value: () => ({
                    top: idx * CHAPTER_SPACING - (captured.container?.scrollTop ?? 0),
                    left: 0,
                    width: VIEWPORT,
                    height: CHAPTER_SPACING,
                  }),
                  configurable: true,
                })
              }}
              data-chapter-index={idx}
            />
          )
        })}
      </div>
    )
  }

  const utilsRef: { current: { rerender: (ov: Record<string, unknown>) => void } | null } = { current: null } as {
    current: { rerender: (ov: Record<string, unknown>) => void } | null
  }
  const overridesRef: { current: Record<string, unknown> | null } = { current: null } as {
    current: Record<string, unknown> | null
  }
  const utils = render(<Probe ov={overrides} />)
  overridesRef.current = overrides
  utilsRef.current = {
    rerender: (ov: Record<string, unknown>) => {
      overridesRef.current = { ...(overridesRef.current ?? {}), ...ov }
      utils.rerender(<Probe ov={overridesRef.current} />)
    },
  }
  return {
    captured,
    rerender: (ov: Record<string, unknown> = {}) => utilsRef.current!.rerender(ov),
  }
}

const scrollTo = (c: Captured, scrollTop: number) => {
  Object.defineProperty(c.container, 'scrollTop', { value: scrollTop, configurable: true })
  act(() => {
    c.api.handleScroll()
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useSeamlessScrollTracking', () => {
  it('视口追踪：滚动进入第 1 章后半 → 切当前章 + 章内百分比 + 防抖保存 + 预拼接第 2 章', () => {
    const { captured: c, rerender } = createHarness()
    expect(c.api.scrollWindow).toEqual({ start: 0, end: 2 })

    scrollTo(c, 1500) // 第 1 章顶部 1000 → 章内比例 0.5
    expect(c.currentChapterIndex).toBe(1)
    expect(c.scrollPercent).toBe(50)
    expect(c.saves?.[0]).toEqual([1, 0.5])
    rerender()
    expect(c.api.scrollWindow.end).toBe(3) // 末窗章向后预拼接
  })

  it('navigateToChapter：窗口重置到目标章，首个 scroll 事件按目标章计算比例', () => {
    const { captured: c, rerender } = createHarness()
    act(() => {
      c.api.navigateToChapter(5)
    })
    rerender()
    expect(c.api.scrollWindow).toEqual({ start: 5, end: 7 })

    // 页面显式跳章：setCurrentChapterIndex(5) 与 navigateToChapter 同批更新
    rerender({ currentChapterIndex: 5 })
    expect(c.api.scrollWindow).toEqual({ start: 5, end: 7 }) // 窗口外重置 effect 不再拉回

    // 显式跳章后的首个 scroll（scrollTo(0,0) 余波落在窗口首章顶部附近）：
    // 抑制视口追踪 → 按目标章 5 计算
    scrollTo(c, 5500) // 第 5 章顶部 5000 → 比例 0.5
    expect(c.scrollPercent).toBe(50)
    expect(c.currentChapterIndex).toBeUndefined() // 未被拉回窗口首章
  })

  it('单章滚动（关闭无缝续读）：整容器比例 + 章末提示', () => {
    const { captured: c } = createHarness({ isSeamlessReading: false })
    scrollTo(c, 7500) // 滚到底
    expect(c.scrollPercent).toBe(100)
    expect(c.chapterEndPrompt).toBe(true)
    expect(c.saves?.[0]).toEqual([0, 1])
  })

  it('听书激活时视口追踪让位（不切章，退回单章比例保存）', () => {
    const { captured: c } = createHarness({ ttsActive: true })
    scrollTo(c, 1500)
    // 无缝视口追踪（切章）让位播报；退化为单章滚动分支：整容器比例 0.2
    expect(c.currentChapterIndex).toBeUndefined()
    expect(c.scrollPercent).toBe(20)
    expect(c.saves?.[0]).toEqual([0, 0.2])
  })
})
