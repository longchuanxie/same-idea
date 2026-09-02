import { act, render } from '@testing-library/react'
import React, { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBookFlipAnimation, FLIP_COMMIT_PROGRESS_THRESHOLD } from './useBookFlipAnimation'

type FlipApi = ReturnType<typeof useBookFlipAnimation>

interface TestHarness {
  api: FlipApi
  /** 状态 setter 触发重渲染（让 hook 下次调用读到最新状态） */
  onStateChange?: () => void
  containerEl: HTMLElement
  exitEl: HTMLElement
  enterEl: HTMLElement
  state: {
    isPageAnimating: boolean
    pageDirection: 'left' | 'right' | null
    previousPageIndex: number | null
  }
  setCurrentPageIndex: ReturnType<typeof vi.fn>
  rerender: (overrides?: Record<string, unknown>) => void
}

/** 探针组件：真实调用 hook，flipPageRef 指向渲染出的页片容器 */
function createHarness(overrides: Record<string, unknown> = {}): TestHarness {
  const captured = {} as TestHarness

  const Probe: React.FC<{ ov?: Record<string, unknown> }> = ({ ov = {} }) => {
    const state = useRef({
      isPageAnimating: false,
      pageDirection: null as 'left' | 'right' | null,
      previousPageIndex: null as number | null,
    })
    const setCurrentPageIndex = captured.setCurrentPageIndex ?? vi.fn()
    captured.setCurrentPageIndex = setCurrentPageIndex
    captured.state = {
      get isPageAnimating() { return state.current.isPageAnimating },
      get pageDirection() { return state.current.pageDirection },
      get previousPageIndex() { return state.current.previousPageIndex },
    }

    const api = useBookFlipAnimation({
      enabled: true,
      totalPages: 5,
      currentPageIndex: 2,
      setCurrentPageIndex,
      isPageAnimating: state.current.isPageAnimating,
      setIsPageAnimating: (v) => {
        state.current.isPageAnimating = v
        captured.onStateChange?.()
      },
      pageDirection: state.current.pageDirection,
      setPageDirection: (d) => {
        state.current.pageDirection = d
        captured.onStateChange?.()
      },
      previousPageIndex: state.current.previousPageIndex,
      setPreviousPageIndex: (i) => {
        state.current.previousPageIndex = i
        captured.onStateChange?.()
      },
      ...ov,
    } as Parameters<typeof useBookFlipAnimation>[0])
    captured.api = api

    return (
      <div ref={api.flipPageRef}>
        <div data-flip-exit ref={(el) => { if (el) captured.exitEl = el }} />
        <div data-flip-enter ref={(el) => { if (el) captured.enterEl = el }} />
      </div>
    )
  }

  const utils = render(<Probe ov={overrides} />)
  captured.containerEl = utils.container.firstElementChild as HTMLElement
  captured.rerender = (ov) => utils.rerender(<Probe ov={ov ?? overrides} />)
  captured.onStateChange = () => captured.rerender()
  return captured
}

/** 触摸事件（jsdom 无 TouchEvent） */
function makeTouchEvent(type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] })
  Object.defineProperty(event, 'changedTouches', { value: [{ clientX: x, clientY: y }] })
  return event
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(600)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useBookFlipAnimation', () => {
  it('startFlip：越界目标不启动；合法目标设置动画状态并翻到目标页', () => {
    const h = createHarness()
    act(() => h.api.startFlip(5, 'left'))
    expect(h.setCurrentPageIndex).not.toHaveBeenCalled()

    act(() => h.api.startFlip(3, 'left'))
    expect(h.setCurrentPageIndex).toHaveBeenCalledWith(3)
    expect(h.state.isPageAnimating).toBe(true)
    expect(h.state.pageDirection).toBe('left')
    expect(h.state.previousPageIndex).toBe(2)
  })

  it('触摸横拖：越阈值启动翻书，继续拖动更新跟手进度', () => {
    const h = createHarness()
    act(() => {
      h.api.handleFlipTouchStart(makeTouchEvent('touchstart', 300, 100) as never)
    })
    // 未越 50px 阈值：不启动
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 290, 100) as never)
    })
    expect(h.state.isPageAnimating).toBe(false)

    // 左拖 60px → 启动向前翻书
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 240, 100) as never)
    })
    expect(h.state.isPageAnimating).toBe(true)

    // 继续拖 180px → 跟手进度 = (180-50)/(600*0.6) ≈ 0.36
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 60, 100) as never)
    })
    expect(h.api.flipProgress).toBeGreaterThan(0)
    expect(h.api.flipProgress).toBeLessThanOrEqual(1)
  })

  it('松手：进度超阈值提交翻页（页片类名 + 定时复位）', () => {
    const h = createHarness()
    act(() => {
      h.api.handleFlipTouchStart(makeTouchEvent('touchstart', 300, 100) as never)
    })
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 240, 100) as never) // 启动
    })
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 0, 100) as never) // 拖满
    })
    expect(h.api.flipProgress).toBeGreaterThan(FLIP_COMMIT_PROGRESS_THRESHOLD)

    act(() => {
      h.api.handleFlipTouchEnd()
    })
    expect(h.exitEl.classList.contains('book-flip-complete-exit')).toBe(true)
    expect(h.enterEl.classList.contains('book-flip-complete-enter')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(700)
    })
    h.rerender()
    expect(h.state.isPageAnimating).toBe(false)
    expect(h.state.pageDirection).toBeNull()
  })

  it('松手：进度不足弹回原页', () => {
    const h = createHarness()
    act(() => {
      h.api.handleFlipTouchStart(makeTouchEvent('touchstart', 300, 100) as never)
    })
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 240, 100) as never) // 启动但未跟手
    })
    act(() => {
      h.api.handleFlipTouchEnd()
    })
    expect(h.exitEl.classList.contains('book-flip-snapback')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(400)
    })
    // 回到原页 2 并复位
    expect(h.setCurrentPageIndex).toHaveBeenLastCalledWith(2)
    h.rerender()
    expect(h.state.isPageAnimating).toBe(false)
  })

  it('enabled=false 时触摸手势全部短路', () => {
    const h = createHarness({ enabled: false })
    act(() => {
      h.api.handleFlipTouchStart(makeTouchEvent('touchstart', 300, 100) as never)
    })
    act(() => {
      h.api.handleFlipTouchMove(makeTouchEvent('touchmove', 100, 100) as never)
    })
    expect(h.state.isPageAnimating).toBe(false)
  })
})
