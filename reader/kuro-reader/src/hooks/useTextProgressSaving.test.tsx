import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTextProgressSaving } from './useTextProgressSaving'
import type { Book, ReadingProgress } from '@/types'

vi.mock('@/stores/useAppStore', () => ({
  useAppStore: {
    getState: () => ({
      settings: { textReadingMode: 'scroll', readingTheme: 'paper' },
    }),
  },
}))

const fakeBook = {
  id: 'b1',
  title: '测试书',
  chapters: [{ id: 'ch-2', title: '第二章' }, { id: 'ch-3', title: '第三章' }],
} as unknown as Book

const fakeChapters = [
  { id: 'ch-2', title: '第二章', content: '甲' },
  { id: 'ch-3', title: '第三章', content: '乙' },
]

function setup(overrides: Partial<Parameters<typeof useTextProgressSaving>[0]> = {}) {
  const updateProgress = vi.fn()
  const hook = renderHook(({ textPages }) =>
    useTextProgressSaving({
      bookId: 'b1',
      book: fakeBook,
      chapters: fakeChapters,
      textPages,
      updateProgress,
      ...overrides,
    })
  , { initialProps: { textPages: ['页一', '页二', '页三', '页四'] } })
  return { hook, updateProgress, rerender: hook.rerender }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTextProgressSaving', () => {
  it('saveTextProgress：滚动模式载荷（chapterId、比例、locator、设置快照）', () => {
    const { hook, updateProgress } = setup()
    act(() => {
      hook.result.current.saveTextProgress(1, undefined, 0.5)
    })

    expect(updateProgress).toHaveBeenCalledTimes(1)
    const progress = updateProgress.mock.calls[0][1] as ReadingProgress
    expect(progress.bookId).toBe('b1')
    expect(progress.chapterId).toBe('ch-3') // chapters[1].id
    expect(progress.pageScrollRatio).toBe(0.5)
    expect(progress.chapterScrollRatio).toBe(0.5)
    // 全书比例 = (章索引 + 章内比例) / 章数 = (1+0.5)/2 = 75%
    expect(progress.percentage).toBe(75)
    expect(progress.totalImages).toBe(2)
    expect(progress.textReadingMode).toBe('scroll')
    expect(progress.readingTheme).toBe('paper')
    expect(JSON.parse(progress.locator ?? '')).toEqual({
      chapterIndex: 1,
      pageIndex: undefined,
      scrollRatio: 0.5,
    })
  })

  it('saveTextProgress：分页模式按页序计算比例；chapterId 缺失时兜底拼接', () => {
    const { hook, updateProgress } = setup({ book: undefined })
    act(() => {
      hook.result.current.saveTextProgress(2, 3) // 第 4 页 / 共 4 页
    })
    expect(updateProgress).toHaveBeenCalledTimes(1)
    const progress = updateProgress.mock.calls[0][1] as ReadingProgress
    expect(progress.chapterId).toBe('b1-ch3') // 无 book 元数据 → 兜底
    expect(progress.chapterScrollRatio).toBe(1)
    expect(progress.page).toBe(4)
    expect(progress.totalPages).toBe(4)
  })

  it('scheduleProgressSave：防抖合并，仅最后一次生效', () => {
    const { hook, updateProgress } = setup()
    act(() => {
      hook.result.current.scheduleProgressSave(0, 0.1)
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    act(() => {
      hook.result.current.scheduleProgressSave(0, 0.8) // 覆盖前一次
    })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(updateProgress).toHaveBeenCalledTimes(1)
    expect((updateProgress.mock.calls[0][1] as ReadingProgress).pageScrollRatio).toBe(0.8)
  })

  it('cancelPendingSave：取消未落地的防抖保存', () => {
    const { hook, updateProgress } = setup()
    act(() => {
      hook.result.current.scheduleProgressSave(0, 0.3)
      hook.result.current.cancelPendingSave()
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(updateProgress).not.toHaveBeenCalled()
  })

  it('镜像 ref 随重渲染更新（听书起播点等回调读取最新分页）', () => {
    const { hook, rerender } = setup()
    expect(hook.result.current.textPagesLengthRef.current).toBe(4)
    rerender({ textPages: ['a', 'b'] })
    expect(hook.result.current.textPagesLengthRef.current).toBe(2)
    expect(hook.result.current.textPagesRef.current).toEqual(['a', 'b'])
    expect(hook.result.current.chaptersRef.current).toHaveLength(2)
  })
})
