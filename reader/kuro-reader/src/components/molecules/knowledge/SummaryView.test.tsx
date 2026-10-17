import React, { useEffect } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { SummaryView } from '@/components/molecules/knowledge/SummaryView'
import type { Book, ChapterSummaryData } from '@/types'

/** 路由探针：MemoryRouter 不动 jsdom 真实 location，导航结果从这里取 */
const LocationProbe: React.FC<{ onChange: (path: string) => void }> = ({ onChange }) => {
  const location = useLocation()
  useEffect(() => {
    onChange(location.pathname + location.search)
  })
  return null
}

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'b1',
  title: '长夜',
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 3,
  chapters: [
    { id: 'ch-1', bookId: 'b1', number: 1, title: '第一章', pages: [], status: 'unread' },
    { id: 'ch-2', bookId: 'b1', number: 2, title: '第二章', pages: [], status: 'unread' },
  ],
  addedAt: new Date('2026-01-01'),
  isFavorite: false,
  format: 'text',
  ...overrides,
})

const data: ChapterSummaryData = {
  sections: [
    { label: '片段1', points: [{ text: '张三夜探敌营' }, { text: '李四负伤' }], chapters: [0, 1] },
    { label: '片段2', points: [{ text: '大军压境' }] },
  ],
  closing: '城门告急',
}

describe('SummaryView', () => {
  it('分段要点 + 覆盖章 chip + 此刻处境一行', () => {
    render(
      <MemoryRouter>
        <SummaryView data={data} book={makeBook()} />
      </MemoryRouter>
    )
    expect(screen.getByText('片段1')).toBeTruthy()
    expect(screen.getByText('片段2')).toBeTruthy()
    expect(screen.getByText('张三夜探敌营')).toBeTruthy()
    expect(screen.getByText('大军压境')).toBeTruthy()
    // 覆盖章 chips（第1/2章）
    expect(screen.getByText('第1章')).toBeTruthy()
    expect(screen.getByText('第2章')).toBeTruthy()
    expect(screen.getByText(/城门告急/)).toBeTruthy()
  })

  it('点覆盖章 chip 回原文（带 usage 信号）', () => {
    let navigated = ''
    render(
      <MemoryRouter>
        <LocationProbe onChange={(path) => { navigated = path }} />
        <SummaryView data={data} book={makeBook()} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('第1章'))
    expect(navigated).toBe('/text-reader/b1/ch-1')
  })

  it('修订模式回调按原始段/点索引派发', () => {
    const onEditPoint = vi.fn()
    const onRemovePoint = vi.fn()
    const onTogglePointVerified = vi.fn()
    render(
      <MemoryRouter>
        <SummaryView
          data={data}
          book={makeBook()}
          revising
          onEditPoint={onEditPoint}
          onRemovePoint={onRemovePoint}
          onTogglePointVerified={onTogglePointVerified}
        />
      </MemoryRouter>
    )
    // 第二段第一条要点：修订按钮组（改/删/校章）
    const removeButtons = screen.getAllByLabelText(/^删 /)
    fireEvent.click(removeButtons[removeButtons.length - 1])
    expect(onRemovePoint).toHaveBeenCalledWith(1, 0)
  })

  it('空数据给空态提示', () => {
    render(
      <MemoryRouter>
        <SummaryView data={{ sections: [{ label: '片段1', points: [] }] }} book={makeBook()} />
      </MemoryRouter>
    )
    expect(screen.getByText(/这份总结是空的/)).toBeTruthy()
  })
})
