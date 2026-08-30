import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { InBookSearchPanel } from '@/components/molecules/InBookSearchPanel'
import { COPY } from '@/constants/copy'
import type { TextChapter } from '@/services/textContent'
import type { SearchHit } from '@/utils/textSearch'

vi.mock('@/utils/textSearch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/textSearch')>()
  return {
    ...actual,
    // 面板测试不真扫大文本，直接给确定性结果
    searchChapters: vi.fn((_chapters: TextChapter[], query: string) => {
      if (query.trim().length < actual.MIN_QUERY_CHARS) return []
      return [
        {
          chapterIndex: 0,
          chapterTitle: '第一章',
          offset: 3,
          length: 2,
          textLength: 20,
          before: '前面的',
          match: query,
          after: '后面的',
        },
      ]
    }),
  }
})

const CHAPTERS: TextChapter[] = [{ id: 'ch-1', title: '第一章', content: '示例内容若干字' }]

const PROPS = {
  chapters: CHAPTERS,
  onSelectHit: vi.fn(),
  onClose: vi.fn(),
}

const setup = (overrides: Partial<typeof PROPS> = {}) =>
  render(<InBookSearchPanel {...PROPS} {...overrides} />)

const type = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText(COPY.searchInBook.placeholder), {
    target: { value },
  })
}

describe('InBookSearchPanel', () => {
  it('初始态展示操作提示（未达最短字符数）', () => {
    setup()
    expect(screen.getByText(COPY.searchInBook.hint)).toBeInTheDocument()
  })

  it('输入防抖后展示命中数与命中摘录', async () => {
    setup()
    type('雨夜')
    await waitFor(
      () => expect(screen.getByText(COPY.searchInBook.hitCount(1))).toBeInTheDocument(),
      { timeout: 1000 }
    )
    expect(screen.getByText(/前面的/)).toBeInTheDocument()
  })

  it('点击命中回调 onSelectHit 并由面板回调关闭', async () => {
    const onSelectHit = vi.fn()
    setup({ onSelectHit })
    type('雨夜')
    await waitFor(
      () => expect(screen.getByText(COPY.searchInBook.hitCount(1))).toBeInTheDocument(),
      { timeout: 1000 }
    )
    fireEvent.click(screen.getByText(/前面的/).closest('button') as HTMLElement)
    expect(onSelectHit).toHaveBeenCalledTimes(1)
    const hit = onSelectHit.mock.calls[0][0] as SearchHit
    expect(hit.chapterIndex).toBe(0)
    expect(hit.match).toBe('雨夜')
  })

  it('清空输入回到提示态', async () => {
    setup()
    type('雨夜')
    await waitFor(
      () => expect(screen.getByText(COPY.searchInBook.hitCount(1))).toBeInTheDocument(),
      { timeout: 1000 }
    )
    fireEvent.click(screen.getByLabelText('清空'))
    await waitFor(() => expect(screen.getByText(COPY.searchInBook.hint)).toBeInTheDocument())
  })

  it('关闭按钮触发 onClose', () => {
    const onClose = vi.fn()
    setup({ onClose })
    fireEvent.click(screen.getByLabelText(COPY.annotation.close))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
